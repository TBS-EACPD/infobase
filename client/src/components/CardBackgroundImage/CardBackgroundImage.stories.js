import _ from "lodash";
import React from "react";

import { trivial_text_maker } from "src/models/text.js";

import { CardBackgroundImage } from "./CardBackgroundImage.js";

export default {
  title: "CardBackgroundImage",
  component: CardBackgroundImage,
};

// not sure if the component works or not
const Template = (args) => <CardBackgroundImage {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  img_src: "",
  link_href: "",
  tmf: trivial_text_maker,

  // keys don't work
  title_key: "new",
  text_key: "survey",
  link_key: "performance",

  // text
  text_args: "",
};
