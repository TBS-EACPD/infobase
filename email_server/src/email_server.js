import express from 'express';
import body_parser from 'body-parser';
import compression from 'compression';
import _ from 'lodash';

import report_a_problem from '../templates/report_a_problem.json';

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
email_server.use(function (request, response, next) {

  response.header('Access-Control-Allow-Origin', '*');
  response.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  
  if (request.method === 'OPTIONS') {
    response.sendStatus(200);
  } else {
    next();
  }
});


// TODO: what can I do to mitigate endpoint spam? Is that in-scope right now?


email_server.get(
  'email_template',
  (request, response) => {
    const {
      lang,
      template_name,
    } = get_request_content(request);

    // will need to re-implement if we ever need a second email template, but for now it's just the one version of report_a_problem
    if (!_.includes(["en", "fr"], lang) || template_name !== "report_a_problem"){
      log_email_request(request, "Error: email template request has invalid or missing lanuage or template_name value(s)");
      response.sendStatus("400");
    } else {
      response.json(report_a_problem[lang]);
    }
  }
);


email_server.post(
  'submit_email', 
  (request, response) => {
    // request body will be JSON, containing name of template and filled out template
    // 1) validate template (check against template, also security/content check?)
    // 2) if valid, construct email string from template, else log and respond with rejected
    // 3) send and respond with accepted
  }
);


export { email_server };