import { addDecorator } from "@storybook/react";
import { withConsole } from "@storybook/addon-console";
import "bootstrap/dist/css/bootstrap.min.css";
import "src/extended_bootstrap_css/wet-bootstrap3-holdovers.scss";
import "src/extended_bootstrap_css/bootstrap-wet-fixes-extensions.scss";
import "src/extended_bootstrap_css/container-page.scss";

import "src/common_css/site.scss";
import "src/common_css/grid-system.scss";
import "src/common_css/flexbox-grid.scss";
import "src/common_css/charts.scss";
import "src/common_css/tables.scss";

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
