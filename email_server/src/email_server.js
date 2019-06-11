import express from 'express';
import body_parser from 'body-parser';
import compression from 'compression';
import _ from 'lodash';

import report_a_problem from '../templates/report_a_problem.json';
import { get_transport_config } from './get_transport_config.js';

const get_request_content = (request) => (!_.isEmpty(request.body) && request.body) || (!_.isEmpty(request.query) && request.query);

const log_email_request = (request, log_message) => {
  const request_content = get_request_content(request);
  console.log( /* eslint-disable-line no-console */
    JSON.stringify(
      _.pickBy({
        log_message,
        request_content,
      })
    )
  );
};


const email_server = express();

email_server.use( body_parser.json({ limit: '50mb' }) );
email_server.use( compression() );
email_server.use(
  function(request, response, next){
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    response.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    
    if (request.method === 'OPTIONS'){
      response.sendStatus(200);
    } else {
      next();
    }
  }
);


// TODO: what can I do to mitigate endpoint spam? Is that in-scope right now? I want it to be, at least


email_server.get(
  'email_template',
  (request, response) => {
    const {
      lang,
      template_name,
    } = get_request_content(request);

    // will need to re-implement if we ever need a second email template, but for now the only option's "report_a_problem"
    if (!_.includes(["en", "fr"], lang) || template_name !== "report_a_problem"){
      const error_message = "Bad Request: email template request has invalid or missing lanuage or template_name value(s)";
      log_email_request(request, error_message);
      response.status("400").send(error_message);
    } else {
      response.json(report_a_problem[lang]);
    }
  }
);


email_server.post(
  'submit_email', 
  async (request, response) => {
    // request body will be JSON, containing name of template and filled out template

    const request_content = get_request_content(request);
    const email_is_valid = ( // TODO
      (request_content) => {
        // will be its own module, get template based on name in request_content,
        // validate the fields in request_content against the template
        return true;
      }
    )();

    if (!email_is_valid){
      const error_message = "Bad Request: submitted email content either doesn't correspond to any templates, or does not validate aginst its corresponding template";
      log_email_request(request, error_message);
      response.send("400", error_message);
    } else {
      // construct email string from template and request_content
      // TODO

      // send mail
      const transport_config = await get_transport_config();
      let transporter = nodemailer.createTransport(transport_config);
      let info = await transporter.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: "bar@example.com, baz@example.com", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>" // html body
      });
    }
  }
);


export { email_server };