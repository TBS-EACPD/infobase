import fetchMock from "fetch-mock";
import React from "react";

import { is_dev, local_ip, is_ci } from "src/core/injected_build_constants";

import { EmailFrontend } from "./EmailFrontend";

export default {
  title: "EmailFrontend",
  component: EmailFrontend,
};

const Template = (args) => {
  // const email_backend_url =
  //   is_dev && !is_ci ? `https://${local_ip || "127.0.0.1"}:7331` : null;
  // : "https://us-central1-report-a-problem-email-244220.cloudfunctions.net/prod-email-backend";

  // Mocks http requests made using fetch, since storybook doesn't allow server calls directly
  // fetchMock.get(
  //   `https://${
  //     local_ip || "127.0.0.1"
  //   }:7331/email_template?template_name=feedback_simplified`,
  //   200
  // );
  const on_submitted = () => {
    console.log("Submitted");
  };
  return (
    <div>
      <EmailFrontend {...args} on_submitted={on_submitted} />
    </div>
  );
};

export const Basic = Template.bind({});
Basic.args = {
  template_name: "Template name",
  include_privacy: true,
};
