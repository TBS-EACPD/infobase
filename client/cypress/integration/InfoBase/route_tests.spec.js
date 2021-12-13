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
    route: "start",
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
    name: "Infographic - Gov - Services",
    route: "orgs/gov/gov/infograph/services",
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
    name: "Infographic - Dept - Services",
    route: "orgs/dept/326/infograph/services",
    test_on: ["eng", "basic-eng"],
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
    name: "Infographic - Program - Services",
    route: "orgs/program/TBC-BXC04/infograph/services",
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
    name: "Infographic - Service - Intro",
    route: "infographic/service/136/intro",
    test_on: ["eng", "basic-eng"],
  },

  {
    name: "Report Builder - Table Picker",
    route: "rpb",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Report Builder - Report",
    route: "rpb/.-.-(table.-.-'orgEmployeeType)",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Tag Explorer",
    route: "tag-explorer",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Indicator text comparison - TBS",
    route: "diff/326",
    test_on: ["eng", "basic-eng"],
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

        // Spinner(s) should eventually end. Subsequent spinners may appear; recursively wait for all spinners to start and end
        const spinner_selector = ".leaf-spinner__inner-circle";
        const wait_on_all_spinners = () =>
          // eslint-disable-next-line cypress/no-unnecessary-waiting
          cy
            .get(spinner_selector, { timeout: 10000 })
            .should("not.exist")
            // Wait before checking that no new spinners have started. If this _wasn't_ necessary, then the initial not.exist assertion
            // would have been sufficient, but there's cases where a new spinner takes a split second to render
            .wait(250) // Note: if any routes with lots of loading layers start flaking, may need to increase this (or optimzie those routes!)
            .then(() =>
              cy.document().then((document) => {
                if (document.querySelector(spinner_selector)) {
                  return wait_on_all_spinners();
                } else {
                  // Seems some errors that can be caught by the error boundary may skate by cypress. For an extra
                  // sanity check, make sure we've not wound up on the error boundary at the end of all loading states
                  // TODO: try and better identify what case causes this, see if we can make cypress see and display them directly
                  return cy
                    .get("#error-boundary-icon", { timeout: 0 })
                    .should("not.exist");
                }
              })
            );
        wait_on_all_spinners();

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
      return _.chain(route_load_tests_config)
        .flatMap((test_config) => [
          test_config,
          ..._.fill(Array(test_config.test_on.length - 1), false),
        ])
        .thru((padded_test_configs) =>
          _.chunk(
            padded_test_configs,
            _.ceil(padded_test_configs.length / BATCH_COUNT)
          )
        )
        .map(_.compact)
        .nth(BATCH_INDEX)
        .value();
    }
  })();

  _.each(route_configs_to_test, run_tests_from_config);
});
