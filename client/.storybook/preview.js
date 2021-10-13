import React from "react";
import { addDecorator } from "@storybook/react";
import { withConsole } from "@storybook/addon-console";
import { MemoryRouter } from "react-router";

import "src/InfoBase/site.scss";
import "src/InfoBase/utils.scss";

import "src/handlebars/register_helpers.side-effects";

import { disable_analytics } from "src/core/analytics";

disable_analytics();

const a11y_options = {
  element: "#root",
  options: {
    runOnly: {
      values: ["wcag2a"],
    },
    rules: {
      "color-contrast": { enabled: false },
    },
  },
};

export const parameters = {
  a11y: a11y_options,
  actions: { argTypesRegex: "^on[A-Z].*" },
  options: {
    storySort: {
      method: "alphabetical",
    },
  },
};

addDecorator((storyFn, context) => withConsole()(storyFn)(context));

addDecorator((story) => (
  <MemoryRouter initialEntries={["/"]}>{story()}</MemoryRouter>
));
