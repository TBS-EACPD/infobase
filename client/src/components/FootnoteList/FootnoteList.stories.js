import _ from "lodash";
import React from "react";

import { FootnoteList } from "./FootnoteList";

export default {
  title: "FootnoteList",
  component: FootnoteList,
};

const Template = (args) => <FootnoteList {...args} />;

// not completed yet
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
