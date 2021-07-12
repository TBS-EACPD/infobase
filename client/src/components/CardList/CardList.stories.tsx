import { Story, Meta } from "@storybook/react";
import React from "react";

import { CardList, CardListElementProps } from "./CardList";

export default {
  title: "CardList",
  component: CardList,
} as Meta;

type CardListProps = React.ComponentProps<typeof CardList>;

const Template: Story<CardListProps> = (args) => <CardList {...args} />;

const elements: CardListElementProps[] = [
  {
    display: "Non-link Title",
    href: "#",
    children: [
      { display: "Non-link Title 1", href: "" },
      { display: "Non-link Title 2", href: "" },
      { display: "Non-link Title 3", href: "" },
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
