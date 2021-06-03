import React from "react";

import { trivial_text_maker } from "src/models/text";

import Info from "src/svg/backbanner.svg";

import { CardImage } from "./CardImage";

export default {
  title: "CardImage",
  component: CardImage,
};

const Template = (args) => {
  return <CardImage {...args} />;
};

const svg = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="-300 50 1200 1200"
    onClick={() => console.log("Clicked!")}
  >
    <path
      d="M300,69a230.14,230.14,0,1,1-89.91,18.14A229.56,229.56,0,0,1,300,69m0-23C159.72,46,46,159.72,46,300S159.72,554,300,554,554,440.28,554,300,440.28,46,300,46Z"
      fill="#2C70C9"
    />
    <path
      d="M365.88,417c-22.95,46.35-53.92,69.46-72.39,73.14-17.38,3.47-26.16-12.29-24.29-53.88,1.89-50.06,3.43-82,4.65-126.85.34-18.13-.85-24.11-7.36-22.81-7.61,1.52-18.59,14.43-26.31,26.7l-6.4-6.63c19.14-34.3,53.7-67.73,74.34-71.84,19-3.79,23,13.48,22.11,62.78-1.44,40.95-2.88,81.89-4.43,122.29-.77,16,2.92,20.31,7.8,19.34,3.81-.76,13.15-7.71,26-28.33ZM323.93,144.16c3.68,18.47-4.81,38.23-23.27,41.91-15.21,3-27-5.34-30.5-22.72-3.14-15.75,3.82-37.47,25-41.69C310.91,118.52,321.11,130,323.93,144.16Z"
      fill="#2C70C9"
    />
  </svg>
);

export const Basic = Template.bind({});
Basic.args = {
  svg,
  link_href: "",
  link_open_in_new_tab: "",
  tmf: trivial_text_maker,
  text_args: "",

  // keys
  title_key: "new",
  text_key: "survey",
  link_key: "performance",
};
