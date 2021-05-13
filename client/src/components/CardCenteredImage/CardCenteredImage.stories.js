import React from "react";

import { trivial_text_maker } from "src/models/text.js";

import { CardCenteredImage } from "./CardCenteredImage.tsx";

export default {
  title: "CardCenteredImage",
  component: CardCenteredImage,
};

const Template = (args) => <CardCenteredImage {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  img_src: "",
  link_href: "",
  tmf: trivial_text_maker,

  // keys
  title_key: "new",
  text_key: "survey",
  link_key: "performance",

  // text
  text_args: "",
};
