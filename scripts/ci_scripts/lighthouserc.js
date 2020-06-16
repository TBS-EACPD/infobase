const _ = require("lodash");

const {
  route_load_tests_config,
} = require("../../client/browser-tests/route-load-tests-config.js");

module.exports = {
  ci: {
    collect: {
      numberOfRuns: 1,
      url: _.map(
        route_load_tests_config,
        ({ route }) =>
          `https://dev.ea-ad.ca/${process.env.CIRCLE_BRANCH}/index-eng.html#${route}`
      ),
    },
    upload: {
      target: "lhci",
      serverBaseUrl: "https://infobase-lhci.herokuapp.com/",
      token: process.env.LHCI_TOKEN,
    },
  },
};
