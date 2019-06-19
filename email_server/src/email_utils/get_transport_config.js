import nodemailer from 'nodemailer';
import { google } from 'googleapis';
const OAuth2 = google.auth.OAuth2;

const get_prod_auth = async () => {
  const {
    REPORT_A_PROBLEM_EMAIL_ADDRESS: email_address,
    REPORT_A_PROBLEM_CLIENT_ID: client_id,
    REPORT_A_PROBLEM_CLIENT_SECRET: client_secret,
    REPORT_A_PROBLEM_REFRESH_TOKEN: refresh_token,
  } = process.env;

  const oauth2Client = new OAuth2(
    client_id,
    client_secret,
    "https://developers.google.com/oauthplayground"
  );
  oauth2Client.setCredentials({refresh_token});

  const tokens = await oauth2Client.refreshAccessToken();

  return {
    type: "OAuth2",
    user: email_address, 
    clientId: client_id,
    clientSecret: client_secret,
    refreshToken: refresh_token,
    accessToken: tokens.credentials.access_token,
  };
};

const get_dev_auth = async () => await nodemailer.createTestAccount();

const get_auth = async () => {
  if (process.env.IS_PROD_SERVER){
    return await get_prod_auth();
  } else {
    return await get_dev_auth();
  }
};


const get_transport_config = async () => ({
  host: process.env.IS_PROD_SERVER ? "smtp.gmail.com" : "smtp.ethereal.email",
  port: process.env.IS_PROD_SERVER ? 465 : 587,
  secure: !!(process.env.IS_PROD_SERVER),
  auth: await get_auth(),
});

export { get_transport_config };