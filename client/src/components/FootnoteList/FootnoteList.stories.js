import _ from "lodash";
import React from "react";

import { FootnoteList } from "./FootnoteList.js";

export default {
  title: "FootnoteList",
  component: FootnoteList,
};

const Template = (args) => <FootnoteList {...args} />;

// not completed yet
const footnotes = [
  {
    display: "Display 1",
    href: "",
    children: [
      { display: "Child 1", href: "" },
      { display: "Child 2", href: "" },
      { display: "Child 3", href: "" },
    ],
  },
  {
    display: "Display 2",
    href: "",
    children: [
      { display: "Child 1", href: "" },
      { display: "Child 2", href: "" },
      { display: "Child 3", href: "" },
    ],
  },
];

export const Basic = Template.bind({});
Basic.args = {};
