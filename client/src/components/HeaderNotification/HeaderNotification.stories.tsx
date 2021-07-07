import { Story, Meta } from "@storybook/react";
import _ from "lodash";
import React from "react";

import { HeaderNotification } from "./HeaderNotification";

export default {
  title: "HeaderNotification",
  component: HeaderNotification,
} as Meta;

type HeaderNotificationProps = React.ComponentProps<typeof HeaderNotification>;

const Template: Story<HeaderNotificationProps> = (args) => (
  <HeaderNotification {...args} />
);

export const Basic = Template.bind({});
Basic.args = {
  list_of_text: [
    "Header Notification",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque semper dapibus bibendum. Donec sed dolor justo. Donec sed lorem nec ligula blandit auctor. Maecenas eget vestibulum nisi, vel dignissim libero. Mauris iaculis cursus congue. Fusce vitae tempus orci. Suspendisse rutrum sem et libero sagittis dictum.",
  ],
  hideNotification: () => {
    console.log("Console is hidden now.");
  },
};
