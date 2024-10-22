import { defineConfig } from "cypress";

export default defineConfig({
  video: false,
  screenshotOnRunFailure: false,
  //useRelativeSnapshots: true,
  //snapshotFileName: "cypress-snapshots.cy.js",
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require("./cypress/plugins/index")(on, config);
    },
    excludeSpecPattern: [
      "**/ignoredTestFiles/*.js",
      "**/cypress-snapshots.cy.js",
    ],
  },
});
