import React from "react";

import { FootnoteList } from "./FootnoteList";

export default {
  title: "FootnoteList",
  component: FootnoteList,
};

const Template = (args) => <FootnoteList {...args} />;

// having issues with inputing year1 and year2 values, seems to be a textmaker handlebar issue
const footnotes = [
  {
    text: "Example footnote for all organizations, with year range",
    year1: 2019,
    year2: 2020,
    topic_keys: ["PEOPLE", "AGE"],
    subject: {
      subject_type: "dept",
      subject_name: "Organizations",
    },
  },
  {
    text: "Example footnote for specific organization, single year",
    year1: 2020,
    year2: 2020,
    topic_keys: ["RESULTS", "DP"],
    subject: {
      subject_type: "dept",
      name: "Some specific organization",
      id: 1,
    },
  },
  {
    text: "Second example footnote for same organization, also for a single year",
    year1: 2019,
    year2: null,
    topic_keys: ["RESULTS", "DRR"],
    subject: {
      subject_type: "dept",
      name: "Some specific organization",
      id: 1,
    },
  },

  {
    text: "Example footnote for specific program, no year range",
    year1: null,
    year2: null,
    topic_keys: ["RESULTS"],
    subject: {
      subject_type: "program",
      name: "Some specific program",
      id: 1,
    },
  },
];

export const Basic = Template.bind({});
Basic.args = {
  footnotes,
};
