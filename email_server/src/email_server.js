import express from 'express';
import body_parser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import nodemailer from 'nodemailer';
import _ from 'lodash';

import { 
  get_transport_config,
  get_email_config,
} from './email_utils';

import {

  validate_completed_template,
  make_email_body_from_completed_template,
} from './template_utils';

const get_request_content = (request) => (!_.isEmpty(request.body) && request.body) || (!_.isEmpty(request.query) && request.query);

const log_email_request = (request, log_message) => {
  const request_content = get_request_content(request);
  //eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      _.pickBy({
        log_message,
        request_content,
      })
    )
  );
};

const make_email_server = (templates) => {
  const email_server = express();

  email_server.use( body_parser.json({ limit: '50mb' }) );
  email_server.use( compression() );
  process.env.IS_PROD_SERVER && email_server.use( cors() );
  email_server.use(
    (request, response, next) => {
      response.header('Access-Control-Allow-Origin', '*');
      response.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
      response.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, Content-Length, X-Requested-With, lang, template_name, completed_template'
      );
      
      if (request.method === 'OPTIONS'){
        response.sendStatus(200);
      } else {
        next();
      }
    }
  );


  // TODO: what can I do to mitigate endpoint spam? Is that in-scope right now? I want it to be, at least
  

  email_server.get(
    '/email_template_names',
    (request, response) => response.status("200").send( _.keys(templates) )
  );

  
  email_server.get(
    '/email_template',
    (request, response) => {
      const {
        lang,
        template_name,
      } = get_request_content(request);
  
      const requested_template = _.get(templates, `${template_name}.${lang}`);

      if ( _.isUndefined(requested_template) ){
        const error_message = "Bad Request: email template request has invalid or missing value for `lang` or `template_name`";
        log_email_request(request, error_message);
        response.status("400").send(error_message);
      } else {
        response.status("200").json(templates[template_name][lang]);
      }
    }
  );
  
  
  email_server.post(
    '/submit_email',
    async (request, response) => {  
      const {
        lang,
        template_name,
        completed_template,
      } = get_request_content(request);

      const original_template = _.get(templates, `${template_name}.${lang}`);

      if ( _.isUndefined(original_template) || !validate_completed_template(original_template, completed_template) ){
        const error_message = "Bad Request: submitted email content either doesn't correspond to any templates, " + 
          "or does not validate aginst its corresponding template";
        log_email_request(request, error_message);
        response.status("400").send(error_message);
      } else {
        const email_body = make_email_body_from_completed_template(original_template, completed_template);

        const transport_config = await get_transport_config();
        const transporter = nodemailer.createTransport(transport_config);
  
        const email_config = get_email_config();
        const sent_mail_info = await transporter.sendMail({
          ...email_config,
          text: email_body,
        });

        if (process.env.IS_PROD_SERVER){
          // eslint-disable-next-line no-console
          console.log(`Test mail URL: ${nodemailer.getTestMessageUrl(sent_mail_info)}`);
        }

        const mail_sent_successully = !sent_mail_info.err && _.isEmpty(sent_mail_info.rejected);
        if (mail_sent_successully){
          response.send("200");
        } else {
          const error_message = `Internal Server Error: mail was unable to send. ${ 
            sent_mail_info.err ? 
              `Had error: ${sent_mail_info.err}` : 
              'Rejected by recipient'
          }`;
          log_email_request(request, error_message);
          response.status("500").send(error_message);
        }
      }
    }
  );


  return email_server;
}

export { make_email_server };