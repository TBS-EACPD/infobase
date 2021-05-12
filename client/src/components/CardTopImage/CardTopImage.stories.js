import _ from "lodash";
import React from "react";

import { trivial_text_maker } from "src/models/text.js";

import { CardTopImage } from "./CardTopImage.tsx";

export default {
  title: "CardTopImage",
  component: CardTopImage,
};

const Template = (args) => <CardTopImage {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  img_src: "",
  link_href: "",
  link_open_in_new_tab: "",
  tmf: trivial_text_maker,
  text_args: "",

  // keys
  title_key: "new",
  text_key: "survey",
  link_key: "performance",
};
