import nodemailer from "nodemailer";

const get_prod_auth = async () => {
  const {
    EMAIL_BACKEND_SENDING_ADDRESS: email_address,
    EMAIL_BACKEND_OAUTH_SERVICE_ID: service_client,
    EMAIL_BACKEND_OAUTH_SERVICE_PRIVATE_KEY: service_private_key,
  } = process.env;

  return {
    type: "OAuth2",
    user: email_address,
    serviceClient: service_client,
    privateKey: service_private_key,
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
