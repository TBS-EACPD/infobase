import { Story, Meta } from "@storybook/react";
import React, { useState } from "react";

import { CheckBox } from "./CheckBox";

export default {
  title: "Input/CheckBox",
  component: CheckBox,
} as Meta;

type ComponentProps<T> = T extends
  | React.ComponentType<infer P>
  | React.Component<infer P>
  ? JSX.LibraryManagedAttributes<T, P>
  : never;

type CheckBoxProps = ComponentProps<typeof CheckBox>;

const Template: Story<CheckBoxProps> = (args) => {
  const [is_active, set_active] = useState(true);
  return (
    <CheckBox
      active={is_active}
      onClick={() => {
        console.log("clicked");
        set_active(!is_active);
      }}
      {...args}
    />
  );
};

export const Regular = Template.bind({});
Regular.args = {
  id: "1",
  color: "#26374A",
  label: "Regular checkbox",
  isSolidBox: false,
};
export const Solid = Template.bind({});
Solid.args = {
  color: "#2C70C9",
  label: "Solid checkbox, not really a checkbox",
  active: true,
  isSolidBox: true,
};
export const Styled = Template.bind({});
Styled.args = {
  id: "1",
  color: "#26374A",
  label: "Container, checkbox, label styled checkbox",
  isSolidBox: false,
  container_style: {
    backgroundColor: "#f7e4e4",
  },
  checkbox_style: {
    marginTop: "10px",
    border: "3px dotted #008000",
  },
  label_style: {
    color: "purple",
    fontSize: "70px",
    fontWeight: "bold",
  },
};
