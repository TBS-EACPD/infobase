/**
 * @type {Cypress.PluginConfig}
 */

import fs from "fs";

// eslint-disable-next-line import/no-commonjs
module.exports = (on, config) => {
  on("task", require("@cypress/code-coverage/task")(on, config));
  on("task", {
    log(message) {
      console.log(message);

      return null;
    },
    table(message) {
      console.table(message);

      return null;
    },
    error(message) {
      console.error("\x1b[31m", "ERROR:", message, "\x1b[0m");
    },
    warn(message) {
      console.warn("\x1b[33m", "WARNING:", message, "\x1b[0m");
    },
    readFileMaybe(filename) {
      if (fs.existsSync(filename)) {
        return fs.readFileSync(filename, "utf8");
      }

      return null;
    },
  });

  return config;
};
