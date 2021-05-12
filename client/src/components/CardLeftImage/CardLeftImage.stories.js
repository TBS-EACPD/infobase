import _ from "lodash";
import React from "react";

import { trivial_text_maker } from "src/models/text.js";

import { CardLeftImage } from "./CardLeftImage.js";

export default {
  title: "CardLeftImage",
  component: CardLeftImage,
};

// not sure if the component works or not
const Template = (args) => <CardLeftImage {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  img_src: "",
  link_href: "",
  tmf: trivial_text_maker,

  // keys don't work
  title_key: "new",
  text_key: "survey",
  button_text_key: "performance",

  // text
  text_args: "",
};
