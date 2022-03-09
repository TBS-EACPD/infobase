import body_parser from "body-parser";
import compression from "compression";
import cors from "cors";
import express from "express";
import _ from "lodash";

import {
  get_db_connection_status,
  connect_db,
  write_to_db,
} from "./db_utils/index.js";
import {
  make_slack_message_from_completed_template,
  send_to_slack,
} from "./slack_utils/index.js";
import {
  get_templates,
  validate_completed_template,
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

const make_form_backend = (templates) => {
  const form_backend = express();

  form_backend.use(body_parser.json({ limit: "50mb" }));
  form_backend.use(compression());
  form_backend.use(
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
  form_backend.enable("trust proxy");

  form_backend.use((request, response, next) => {
    console.log(`Request type: ${request.originalUrl}, ${request.method}`);
    next();
  });

  form_backend.get("/form_template_names", (request, response) =>
    response.status("200").send(
      _.chain(templates)
        .keys()
        .filter((template_name) => !/\.test$/.test(template_name))
        .value()
    )
  );

  form_backend.get("/form_template", (request, response) => {
    const { template_name } = get_request_content(request);

    const requested_template = templates[template_name];

    if (_.isUndefined(requested_template)) {
      const error_message =
        "Bad Request: form template request has invalid or missing `template_name` value";
      response.status("400").send(error_message);
      log_error_case(request, error_message);
    } else {
      response.status("200").json(templates[template_name]);
    }
  });

  // reassert DB connection
  form_backend.use("/submit_form", (req, res, next) => {
    if (!_.includes(["connected", "connecting"], get_db_connection_status())) {
      console.warn("Initial MongoDB connection lost, attempting reconnection");
      connect_db().catch(console.error);
    }

    next();
  });

  form_backend.post("/submit_form", async (request, response, next) => {
    const { template_name, completed_template } = get_request_content(request);

    const original_template = templates[template_name];

    if (
      _.isUndefined(original_template) ||
      !validate_completed_template(original_template, completed_template)
    ) {
      const error_message =
        "Bad Request: submitted form content either doesn't correspond to any templates, " +
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
        // send_to_slack(
        //   make_slack_message_from_completed_template(
        //     template_name,
        //     original_template,
        //     completed_template
        //   )
        // ).catch((error) => log_error_case(request, error));

        await write_to_db(
          request,
          template_name,
          original_template,
          completed_template
        )
          .then(() => {
            response.send("200");
            log_success_case(request);
          })
          .catch((error) => {
            response.status("500").send(`Internal Server Error: ${error}`);
            log_error_case(request, error);
          });
      }

      next();
    }
  });

  form_backend.use((err, req, res, next) => {
    console.error(err.stack);
    res.status("500").send("Internal server error");
    next(err);
  });

  return form_backend;
};

const run_form_backend = () => {
  const templates = get_templates();

  // Start connecting to the db early and let it happen fully async. Attempts to write to the DB
  // before the connection is ready will buffer until the connection is made
  connect_db().catch(console.error); // Note: async func, but not awaited

  const form_backend = make_form_backend(templates);

  if (!process.env.IS_PROD_SERVER) {
    form_backend.set("port", 7331);
    form_backend.listen(form_backend.get("port"), () => {
      const port = form_backend.get("port");
      console.log(`InfoBase form backend running at http://127.0.0.1:${port}`);
    });
  }

  return form_backend;
};

export { make_form_backend, run_form_backend };
