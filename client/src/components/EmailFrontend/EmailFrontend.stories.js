import React from "react";

import { EmailFrontend } from "./EmailFrontend";

export default {
  title: "EmailFrontend",
  component: EmailFrontend,
};

const Template = (args) => {
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
