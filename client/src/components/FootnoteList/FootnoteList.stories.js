import React from "react";

import { TextMaker } from "src/components/index";

import { create_text_maker } from "src/models/text";

import { FootnoteList } from "./FootnoteList";

import footnote_list_text from "./FootnoteList.yaml";

export default {
  title: "FootnoteList",
  component: FootnoteList,
};

const Template = (args) => <FootnoteList {...args} />;

// having issues with inputing year1 and year2 values
const footnotes = [
  {
    text: "text1",
    year1: "",
    year2: "",
    topic_keys: 1,
    subject: {
      name: "name1",
      plural: "plural1",
    },
  },
  {
    text: "text2",
    year1: "",
    year2: "",
    topic_keys: 2,
    subject: {
      name: "name2",
      plural: "plural2",
    },
  },
];

export const Basic = Template.bind({});
Basic.args = {
  footnotes,
};
