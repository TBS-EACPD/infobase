import React from "react";

import { trivial_text_maker } from "src/models/text.js";

import { CardLeftImage } from "./CardLeftImage.tsx";

export default {
  title: "CardLeftImage",
  component: CardLeftImage,
};

const Template = (args) => <CardLeftImage {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  img_src: "",
  link_href: "",
  tmf: trivial_text_maker,
  text_args: "",

  // keys
  title_key: "new",
  text_key: "survey",
  button_text_key: "performance",
};
