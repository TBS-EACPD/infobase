import express from 'express';
import compression from 'compression';

const log_email_request = (req) => {
  const request_content = (!_.isEmpty(req.body) && req.body) || (!_.isEmpty(req.query) && req.query);
  request_content && 
    console.log( /* eslint-disable-line no-console */
      request_content
    );
};


const email_server = express();

email_server.use( body_parser.json({ limit: '50mb' }) );
email_server.use( compression() );

email_server.use("/", function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

  !global.IS_DEV_SERVER && log_email_request(req);
  
  //TODO
});

export { email_server };