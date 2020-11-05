import { google } from "googleapis";
import nodemailer from "nodemailer";
const OAuth2 = google.auth.OAuth2;

const get_prod_auth = async () => {
  // See ./transport_config_auth.md for some documentation on this stuff
  const {
    EMAIL_BACKEND_SENDING_ADDRESS: email_address,
    EMAIL_BACKEND_CLIENT_ID: client_id,
    EMAIL_BACKEND_CLIENT_SECRET: client_secret,
    EMAIL_BACKEND_REFRESH_TOKEN: refresh_token,
  } = process.env;

  const oauth2Client = new OAuth2(
    client_id,
    client_secret,
    "https://developers.google.com/oauthplayground"
  );
  oauth2Client.setCredentials({ refresh_token });

  const accessToken = await oauth2Client.getAccessToken();

  return {
    type: "OAuth2",
    user: email_address,
    clientId: client_id,
    clientSecret: client_secret,
    refreshToken: refresh_token,
    accessToken,
  };
};

const get_dev_auth = async () => await nodemailer.createTestAccount();

const get_auth = async () => {
  if (process.env.IS_PROD_SERVER) {
    return await get_prod_auth();
  } else {
    return await get_dev_auth();
  }
};

const get_transport_config = async () => ({
  host: process.env.IS_PROD_SERVER ? "smtp.gmail.com" : "smtp.ethereal.email",
  port: process.env.IS_PROD_SERVER ? 465 : 587,
  secure: !!process.env.IS_PROD_SERVER,
  auth: await get_auth(),
});

export { get_transport_config };
