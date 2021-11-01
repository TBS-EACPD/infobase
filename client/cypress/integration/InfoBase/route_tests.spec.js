import _ from "lodash";

const route_load_tests_config = [
  {
    name: "Always failing route, to test error boundary",
    route: "error-boundary-test",
    test_on: ["eng", "fra", "basic-eng", "basic-fra"],
    expect_to_fail: true,
  },
  {
    name: "Homepage",
    route: "",
    test_on: ["eng", "fra", "basic-eng", "basic-fra"],
  },
  {
    name: "About",
    route: "about",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Treemap Explorer",
    route: "treemap",
    test_on: ["eng"],
  },
  {
    name: "Datasets",
    route: "metadata",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Estimates Comparison",
    route: "compare_estimates",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Glossary",
    route: "glossary",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Government at a Glance",
    route: "partition/dept/exp",
    test_on: ["eng"],
  },
  {
    name: "IGOC",
    route: "igoc",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Gov - About",
    route: "orgs/gov/gov/infograph/intro",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Gov - Finance",
    route: "orgs/gov/gov/infograph/financial",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Gov - COVID-19 Response",
    route: "orgs/gov/gov/infograph/covid",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Gov - People",
    route: "orgs/gov/gov/infograph/people",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Gov - Results",
    route: "orgs/gov/gov/infograph/results",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Gov - Where can I go from here?",
    route: "orgs/gov/gov/infograph/related",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Gov - All data",
    route: "orgs/gov/gov/infograph/all_data",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Dept - About",
    route: "orgs/dept/326/infograph/intro",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Dept - Finance",
    route: "orgs/dept/326/infograph/financial",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Dept - COVID-19 Response",
    route: "orgs/dept/1/infograph/covid",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Dept - People",
    route: "orgs/dept/326/infograph/people",
    test_on: ["eng", "fra", "basic-eng"],
  },
  {
    name: "Infographic - Dept - Results",
    route: "orgs/dept/326/infograph/results",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Dept - Where can I go from here?",
    route: "orgs/dept/326/infograph/related",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Dept - All data",
    route: "orgs/dept/326/infograph/all_data",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - CRSO - About",
    route: "orgs/crso/TBC-BXA00/infograph/intro",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - CRSO - Finance",
    route: "orgs/crso/TBC-BXA00/infograph/financial",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - CRSO - People",
    route: "orgs/crso/TBC-BXA00/infograph/people",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - CRSO - Results",
    route: "orgs/crso/TBC-BXA00/infograph/results",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - CRSO - Where can I go from here?",
    route: "orgs/crso/TBC-BXA00/infograph/related",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - CRSO - All data",
    route: "orgs/crso/TBC-BXA00/infograph/all_data",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Program - About",
    route: "orgs/program/TBC-BXC04/infograph/intro",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Program - Finance",
    route: "orgs/program/TBC-BXC04/infograph/financial",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Program - Results",
    route: "orgs/program/TBC-BXC04/infograph/results",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Program - Where can I go from here?",
    route: "orgs/program/TBC-BXC04/infograph/related",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Tag - About",
    route: "orgs/tag/GOC002/infograph/intro",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Tag - Tagged Programs",
    route: "orgs/tag/GOC002/infograph/structure",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Tag - Where can I go from here?",
    route: "orgs/tag/GOC002/infograph/related",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Crown Corp - About",
    route: "orgs/dept/146/infograph/intro",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Crown Corp - Finance",
    route: "orgs/dept/146/infograph/financial",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Crown Corp - Where can I go from here?",
    route: "orgs/dept/146/infograph/related",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Inactive Program - About",
    route: "orgs/program/PPP-AHZ00/infograph/intro",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Inactive Program - Finance",
    route: "orgs/program/PPP-AHZ00/infograph/financial",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Inactive Program - Where can I go from here?",
    route: "orgs/program/PPP-AHZ00/infograph/related",
    test_on: ["eng", "basic-eng"],
  },

  {
    name: "Report Builder - Table Picker",
    route: "rpb",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Report Builder - Report",
    route:
      "rpb/~(columns~(~'thisyearexpenditures)~subject~'gov_gov~'dimension~'major_voted_stat~table~'orgVoteStatQfr~sort_col~'dept~descending~false~filter~'All)",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Tag Explorer",
    route: "tag-explorer",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "InfoLab landing page",
    route: "lab",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Indicator text comparison - TBS",
    route: "diff/326",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Footnote Inventory - all footnotes",
    route: "footnote-inventory",
    test_on: ["eng", "basic-eng", "fra"],
    skip_axe: true,
  },
];

const run_tests_from_config = ({
  name,
  route,
  test_on,
  expect_to_fail,
  skip_axe,
}) =>
  describe(`${name}`, () => {
    _.map(test_on, (app) => {
      it(`Tested on index-${app}.html#${route}`, () => {
        cy.visit(
          `http://localhost:8080/build/InfoBase/index-${app}.html#${route}`
        );

        cy.get(".leaf-spinner__inner-circle", { timeout: 10000 }).should(
          "not.exist"
        );

        //Once basic routes a11y critical issues are fix, can remove this if statement
        if (!skip_axe && (app == "eng" || app == "fra")) {
          cy.injectAxe();
          cy.checkA11y(
            null,
            { includedImpacts: ["critical"] },
            cy.terminalLog,
            false
          );
        }

        cy.on("fail", (e, test) => {
          if (expect_to_fail) {
            console.log("Test expected to fail.", e);
          } else {
            throw e;
          }
        });
      });
    });
  });

describe("Route tests", () => {
  const { BATCH_COUNT, BATCH_INDEX } = Cypress.env();

  const batching = BATCH_COUNT || BATCH_INDEX;

  if (batching && (!_.isInteger(BATCH_COUNT) || !_.isInteger(BATCH_INDEX))) {
    throw new Error(
      "When batching route load tests, set cypess env vars with integer values for both BATCH_COUNT and BATCH_INDEX. " +
        `Provided values were "${BATCH_COUNT}" and "${BATCH_INDEX}" respectively.`
    );
  }

  const route_configs_to_test = (() => {
    if (!batching) {
      return route_load_tests_config;
    } else {
      // TODO would prefer to chunk by route x test_on.length, this is just the simple version to test the basic idea
      return _.chunk(
        route_load_tests_config,
        _.ceil(route_load_tests_config.length / BATCH_COUNT)
      )[BATCH_INDEX];
    }
  })();

  _.each(route_configs_to_test, run_tests_from_config);
});
