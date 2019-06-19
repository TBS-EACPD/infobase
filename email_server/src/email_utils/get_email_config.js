const get_email_config = () => ({
  from: (
    process.env.IS_PROD_SERVER ?
      process.env.EMAIL_SERVER_SENDING_ADDRESS : 
      "Sender Name <sender@example.com>"
  ),
  to: (
    process.env.IS_PROD_SERVER ?
      process.env.EMAIL_SERVER_RECEIVING_ADDRESS : 
      "Recipient <recipient@example.com>"
  ),
  // Should subject be here? If so, will want to pass some args from the request in to generate an identifiable subject line
  subject: "Bluh", //TODO
});

export { get_email_config };