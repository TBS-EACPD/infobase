import React from "react";
import { addDecorator } from "@storybook/react";
import { withConsole } from "@storybook/addon-console";
import { MemoryRouter } from "react-router";

import "src/common_css/common_css_index.side-effects.js";

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
