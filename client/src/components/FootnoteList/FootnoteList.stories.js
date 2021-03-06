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

// having issues with inputing year1 and year2 values, seems to be a textmaker handlebar issue
const footnotes = [
  {
    text: "text1",
    year1: "",
    year2: "",

    // TODO: topic_keys should be an array of strings (text keys from footnote_topics.yaml)
    topic_keys: null,
    subject: {
      name: "name1",
      plural: "plural1",
    },
  },
  {
    text: "text2",
    year1: "",
    year2: "",

    // TODO: topic_keys should be an array of strings (text keys from footnote_topics.yaml)
    topic_keys: null,
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
