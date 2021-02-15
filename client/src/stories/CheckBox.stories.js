import React, { useState } from "react";

import { CheckBox } from "../components/CheckBox.js";

export default {
  title: "CheckBox",
  component: CheckBox,
};

const Template = (args) => {
  const [is_active, set_active] = useState(true);
  return (
    <CheckBox
      active={is_active}
      onClick={() => set_active(!is_active)}
      {...args}
    />
  );
};

export const Solid = Template.bind({});
Solid.args = {
  color: "#2C70C9",
  label: "Solid checkbox, not really a checkbox",
  active: true,
  isSolidBox: true,
};
export const Regular = Template.bind({});
Regular.args = {
  id: 1,
  color: "#26374A",
  label: "Regular checkbox",
  isSolidBox: false,
};
export const Styled = Template.bind({});
Styled.args = {
  id: 1,
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
