import axios from "axios";

export const send_to_slack = (message) => {
  if (process.env.SLACK_BOT_SERVICE_LINK) {
    return axios.post(
      process.env.SLACK_BOT_SERVICE_LINK,
      { text: message, mrkdwn: false },
      {
        headers: { "content-type": "application/json" },
      }
    );
  } else {
    console.log(message);
    return Promise.resolve();
  }
};
