import nodemailer from 'nodemailer';

const get_prod_account = () => ({
  user: process.env.PROD_EMAIL_USER,
  pass: process.env.PROD_EMAIL_PASS,
});

const get_dev_account = async () => await nodemailer.createTestAccount();


const get_account = async () => {
  if (process.env.IS_PROD_SERVER){
    return get_prod_account();
  } else {
    return await get_dev_account();
  }
}

export { get_account };