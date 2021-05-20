import _ from "lodash";
import React from "react";

import { CardList } from "./CardList";

export default {
  title: "CardList",
  component: CardList,
};

const Template = (args) => <CardList {...args} />;

const elements = [
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
Basic.args = {
  elements,
};
