import body_parser from "body-parser";
import compression from "compression";
import cors from "cors";
import express from "express";
import _ from "lodash";
import nodemailer from "nodemailer";

import {
  get_db_connection_status,
  connect_db,
  log_email_and_meta_to_db,
} from "./db_utils/index.js";
import { get_transport_config, get_email_config } from "./email_utils/index.js";
import {
  get_templates,
  validate_completed_template,
  make_email_subject_from_completed_template,
  make_email_body_from_completed_template,
} from "./template_utils/index.js";

import { throttle_requests_by_client } from "./throttle_requests_by_client.js";

const get_request_content = (request) =>
  (!_.isEmpty(request.body) && request.body) ||
  (!_.isEmpty(request.query) && request.query);
const log_error_case = (request, error_message) => {
  const request_content = get_request_content(request);
  console.error(
    JSON.stringify({
      ..._.pickBy({
        error_message,
        request_content,
      }),
      sha: process.env.CURRENT_SHA || "dev, no sha env var set",
    })
  );
};
const log_success_case = (request) => {
  const request_content = get_request_content(request);
  console.log(
    JSON.stringify({
      request_content,
      sha: process.env.CURRENT_SHA || "dev, no sha env var set",
    })
  );
};

const make_email_backend = (templates) => {
  const email_backend = express();

  email_backend.use(body_parser.json({ limit: "50mb" }));
  email_backend.use(compression());
  email_backend.use(
    cors({
      origin: "*",
      methods: ["POST", "GET"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Content-Length",
        "X-Requested-With",
        "template_name",
        "completed_template",
      ],
    })
  );
  email_backend.enable("trust proxy");

  email_backend.use((request, response, next) => {
    console.log(`Request type: ${request.originalUrl}, ${request.method}`);
    next();
  });

  email_backend.get("/email_template_names", (request, response) =>
    response.status("200").send(
      _.chain(templates)
        .keys()
        .filter((template_name) => !/\.test$/.test(template_name))
        .value()
    )
  );

  email_backend.get("/email_template", (request, response) => {
    const { template_name } = get_request_content(request);

    const requested_template = templates[template_name];

    if (_.isUndefined(requested_template)) {
      const error_message =
        "Bad Request: email template request has invalid or missing `template_name` value";
      response.status("400").send(error_message);
      log_error_case(request, error_message);
    } else {
      response.status("200").json(templates[template_name]);
    }
  });

  // reassert DB connection
  email_backend.use("/submit_email", (req, res, next) => {
    if (!_.includes(["connected", "connecting"], get_db_connection_status())) {
      console.warn("Initial MongoDB connection lost, attempting reconnection");
      connect_db().catch(console.error);
    }

    next();
  });

  email_backend.post("/submit_email", async (request, response, next) => {
    const { template_name, completed_template } = get_request_content(request);

    const original_template = templates[template_name];

    if (
      _.isUndefined(original_template) ||
      !validate_completed_template(original_template, completed_template)
    ) {
      const error_message =
        "Bad Request: submitted email content either doesn't correspond to any templates, " +
        "or does not validate against its corresponding template";
      response.status("400").send(error_message);
      log_error_case(request, error_message);
    } else {
      const this_client_is_in_timeout = throttle_requests_by_client(
        `${request.ip}${completed_template.client_id || ""}`
      );
      if (process.env.IS_PROD_SERVER && this_client_is_in_timeout) {
        const error_message =
          "Bad Request: too many recent requests from your IP, try again later.";
        response.status("400").send(error_message);
        log_error_case(request, error_message);
        return null;
      } else {
        const email_config = get_email_config();
        const email_subject = make_email_subject_from_completed_template(
          original_template,
          completed_template
        );
        const email_body = make_email_body_from_completed_template(
          original_template,
          completed_template
        );

        const transport_config = await get_transport_config().catch(
          console.error
        );
        if (!_.isUndefined(transport_config)) {
          const transporter = nodemailer.createTransport(transport_config);

          const sent_mail_info = await transporter
            .sendMail({
              ...email_config,
              subject: email_subject,
              text: email_body,
            })
            .catch(next);

          if (!process.env.IS_PROD_SERVER) {
            console.log(
              `Test mail URL: ${nodemailer.getTestMessageUrl(sent_mail_info)}`
            );
          }

          const mail_sent_successfully =
            !_.isUndefined(sent_mail_info) &&
            /^2[0-9][0-9]/.test(sent_mail_info.response) &&
            _.isEmpty(sent_mail_info.rejected);

          if (mail_sent_successfully) {
            response.send("200");
            log_success_case(request);
          } else {
            const error_message = `Internal Server Error: mail was unable to send. ${
              _.isUndefined(sent_mail_info)
                ? ""
                : sent_mail_info.err
                ? `Had error: ${sent_mail_info.err}`
                : "Rejected by recipient"
            }`;
            response.status("500").send(error_message);
            log_error_case(request, error_message);
          }
        } else {
          const error_message = `Internal Server Error: failed to procure email transport config`;
          response.status("500").send(error_message);
          log_error_case(request, error_message);
        }

        // Note: async func but not awaited, free up the function to keep handling requests in cases where the DB
        // communication becomes a choke point. Also, this all happens post-reponse, so the client isn't waiting on
        // DB write either
        // Note: log to DB even if email fails to send
        log_email_and_meta_to_db(
          request,
          template_name,
          original_template,
          completed_template,
          email_config
        ).catch(console.error);
      }

      next();
    }
  });

  email_backend.use((err, req, res, next) => {
    console.error(err.stack);
    res.status("500").send("Internal server error");
    next(err);
  });

  return email_backend;
};

const run_email_backend = () => {
  const templates = get_templates();

  // Start connecting to the db early and let it happen fully async. Attempts to write to the DB
  // before the connection is ready will buffer until the connection is made
  connect_db().catch(console.error); // Note: async func, but not awaited

  const email_backend = make_email_backend(templates);

  if (!process.env.IS_PROD_SERVER) {
    email_backend.set("port", 7331);
    email_backend.listen(email_backend.get("port"), () => {
      const port = email_backend.get("port");
      console.log(`InfoBase email backend running at http://127.0.0.1:${port}`);
    });
  }

  return email_backend;
};

export { make_email_backend, run_email_backend };
