import _ from "lodash";
import React from "react";

import { CardBackgroundImage } from "./CardBackgroundImage.js";

export default {
  title: "CardBackgroundImage",
  component: CardBackgroundImage,
};

// not sure if the component works or not
const Template = (args) => <CardBackgroundImage {...args} />;

const text_args = <div>Text_Args</div>;

// Doesn't work for some reason, has to do with TM in CardBackgroundImage.js
// export const Basic = Template.bind({});
// Basic.args = {
//   title_key: "0",
//   text_key: "1",
//   link_key: "2",
//   text_args,
// };
