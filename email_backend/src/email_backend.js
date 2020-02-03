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
  make_email_subject_from_completed_template,
  make_email_body_from_completed_template,
} from './template_utils';

import { throttle_requests_by_client } from './throttle_requests_by_client.js';

const get_request_content = (request) => (!_.isEmpty(request.body) && request.body) || (!_.isEmpty(request.query) && request.query);

const log_email_request = (request, log_message) => {
  const request_content = get_request_content(request);
  //eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        ..._.pickBy({
          log_message,
          request_content,
        }),
        sha: process.env.CURRENT_SHA || "dev, no sha env var set",
      },
      null,
      2
    )
  );
};

const make_email_backend = (templates) => {
  const email_backend = express();

  email_backend.use( body_parser.json({ limit: '50mb' }) );
  email_backend.use( compression() );
  process.env.IS_PROD_SERVER && email_backend.use( cors() );
  email_backend.enable('trust proxy');
  email_backend.use(
    (request, response, next) => {
      response.header('Access-Control-Allow-Origin', '*');
      response.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
      response.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, Content-Length, X-Requested-With, template_name, completed_template'
      );
      
      if (request.method === 'OPTIONS'){
        response.sendStatus(200);
      } else {
        next();
      }
    }
  );


  email_backend.get(
    '/email_template_names',
    (request, response) => response.status("200").send( 
      _.chain(templates)
        .keys()
        .filter( (template_name) => !/\.test$/.test(template_name) )
        .value()
    )
  );

  
  email_backend.get(
    '/email_template',
    (request, response) => {
      const {
        template_name,
      } = get_request_content(request);
  
      const requested_template = templates[template_name];

      if ( _.isUndefined(requested_template) ){
        const error_message = "Bad Request: email template request has invalid or missing `template_name` value";
        response.status("400").send(error_message);
        log_email_request(request, error_message);
      } else {
        response.status("200").json(templates[template_name]);
      }
    }
  );
  
 
  email_backend.post(
    '/submit_email',
    async (request, response) => {  
      const {
        template_name,
        completed_template,
      } = get_request_content(request);

      const original_template = templates[template_name];

      if ( _.isUndefined(original_template) || !validate_completed_template(original_template, completed_template) ){
        const error_message = "Bad Request: submitted email content either doesn't correspond to any templates, " + 
          "or does not validate against its corresponding template";
        response.status("400").send(error_message);
        log_email_request(request, error_message);
      } else {
        const this_client_is_in_timeout = throttle_requests_by_client(`${request.ip}${completed_template.client_id || ''}`);
        if (process.env.IS_PROD_SERVER && this_client_is_in_timeout){
          const error_message = "Bad Request: too many recent requests from your IP, try again later.";
          response.status("400").send(error_message);
          log_email_request(request, error_message);
          return null;
        }

        const email_config = get_email_config();
        const email_subject = make_email_subject_from_completed_template(original_template, completed_template);
        const email_body = make_email_body_from_completed_template(original_template, completed_template);

        const transport_config = await get_transport_config();
        const transporter = nodemailer.createTransport(transport_config);

        const sent_mail_info = await transporter.sendMail({
          ...email_config,
          subject: email_subject,
          text: email_body,
        });

        if (!process.env.IS_PROD_SERVER){
          // eslint-disable-next-line no-console
          console.log(`Test mail URL: ${nodemailer.getTestMessageUrl(sent_mail_info)}`);
        }

        const mail_sent_successfully = ( 
          sent_mail_info && 
          /^2[0-9][0-9]/.test(sent_mail_info.response) && 
          _.isEmpty(sent_mail_info.rejected)
        );
        if (mail_sent_successfully){
          response.send("200");
        } else {
          const error_message = `Internal Server Error: mail was unable to send. ${ 
            sent_mail_info.err ? 
              `Had error: ${sent_mail_info.err}` : 
              'Rejected by recipient'
          }`;
          response.status("500").send(error_message);
          log_email_request(request, error_message);
        }
      }
    }
  );


  return email_backend;
}

export { make_email_backend };