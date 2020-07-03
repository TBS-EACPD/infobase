const _ = require("lodash");

const lighthouse_test_routes = [
  "",
  "igoc",
  "orgs/gov/gov/infograph/financial",
  "orgs/gov/gov/infograph/people",
  "orgs/gov/gov/infograph/results",
  "orgs/dept/326/infograph/financial",
  "orgs/dept/326/infograph/people",
  "orgs/dept/326/infograph/results",
  "orgs/dept/326/infograph/services",
  "rpb/~(columns~(~'thisyearexpenditures)~subject~'gov_gov~'dimension~'major_voted_stat~table~'orgVoteStatQfr~sort_col~'dept~descending~false~filter~'All)",
];

module.exports = {
  ci: {
    collect: {
      numberOfRuns: 2,
      url: _.map(
        lighthouse_test_routes,
        (route) =>
          `${process.env.CDN_BASE_URL}/${process.env.CIRCLE_BRANCH}/index-eng.html#${route}`
      ),
    },
    upload: {
      target: "lhci",
      serverBaseUrl: "https://infobase-lhci.herokuapp.com/",
      token: process.env.LHCI_TOKEN,
    },
  },
};
