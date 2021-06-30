import { Story, Meta } from "@storybook/react";
import _ from "lodash";

import React from "react";

import {
  IconHTML,
  IconNodeJS,
  IconReact,
  IconGit,
  IconGitHub,
  IconPython,
  IconSass,
  IconGraphQL,
  IconBaselineCloud,
} from "src/icons/icons";

import { IconGrid, IconGridProps } from "./IconGrid";

export default {
  title: "IconGrid",
  component: IconGrid,
} as Meta;

const tech_icon_list = _.chain([
  IconHTML,
  IconNodeJS,
  IconReact,
  IconGit,
  IconGitHub,
  IconPython,
  IconSass,
  IconGraphQL,
  IconBaselineCloud,
])
  .map((SVG) => ({ svg: <SVG alternate_color={false} width="1.25em" /> }))
  .value();

const Template: Story<IconGridProps> = (args) => <IconGrid {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  icons: tech_icon_list,
};
