import { Story, Meta } from "@storybook/react";
import React from "react";

import { CardList } from "./CardList";

export default {
  title: "CardList",
  component: CardList,
} as Meta;

type CardListProps = React.ComponentProps<typeof CardList>;

const Template: Story<CardListProps> = (args) => <CardList {...args} />;

const elements = [
  {
    display: "Non-link Title",
    href: "#",
    children: [
      { display: "Non-link Title 1" },
      { display: "Non-link Title 2" },
      { display: "Non-link Title 3" },
    ],
  },
  {
    display: "Title with href",
    href: "#",
    children: [
      { display: "Href 1", href: "#" },
      { display: "Href 2", href: "#" },
      { display: "Href 3", href: "#" },
    ],
  },
];

export const Basic = Template.bind({});
Basic.args = {
  elements,
};
