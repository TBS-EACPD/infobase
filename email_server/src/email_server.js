import express from 'express';
import body_parser from 'body-parser';
import compression from 'compression';

const log_email_request = (request) => {
  const request_is_empty = (_.isEmpty(request.body) || !request.body) && (_.isEmpty(request.query) || !request.query);
  if (request_is_empty){
    console.log( /* eslint-disable-line no-console */
      "Empty request"
    );
  } else {
    console.log( /* eslint-disable-line no-console */
      `
        body: ${request.body},
        query: ${request.query},
      `
    );
  }
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
    !global.IS_DEV_SERVER && log_email_request(request);
    next();
  }
});


// TODO: what can I do to prevent spam hammering? Is that in-scope right now?


email_server.get(
  'email_template',
  (request, response) => "TODO" //TODO, function from some other module, take query param as argument for name of template
);


email_server.post(
  'email', 
  (request, response) => {
    // request body will be JSON, containing name of template and filled out template
    // 1) validate template (check against template, also security/content check?)
    // 2) if valid, construct email string from template, else log and respond with rejected
    // 3) send and respond with accepted
  }
);


export { email_server };