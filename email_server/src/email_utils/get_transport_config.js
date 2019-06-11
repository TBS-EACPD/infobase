import nodemailer from 'nodemailer';

const get_prod_auth = () => ({
  user: process.env.PROD_EMAIL_USER,
  pass: process.env.PROD_EMAIL_PASS,
});

const get_dev_auth = async () => await nodemailer.createTestAccount();

const get_auth = async () => {
  if (process.env.IS_PROD_SERVER){
    return get_prod_auth();
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