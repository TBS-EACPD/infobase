import React from "react";

import { CardBackgroundImage } from "./CardBackgroundImage";

export default {
  title: "CardBackgroundImage",
  component: CardBackgroundImage,
};

// not sure if the component works or not
const Template = (args) => <CardBackgroundImage {...args} />;

const text_args = <div>Text_Args</div>;

export const Basic = Template.bind({});
Basic.args = {
  img_src: "",
  link_href: "",

  // keys don't work
  // title_key: "",
  // text_key: "",
  // link_key: "",

  // text
  text_args,
};
