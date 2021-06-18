const {
  route_load_tests_config,
} = require("../../fixtures/route-load-tests-config");

function terminalLog(violations) {
  cy.task(
    "log",
    `${violations.length} accessibility violation${
      violations.length === 1 ? "" : "s"
    } ${violations.length === 1 ? "was" : "were"} detected`
  );
  // pluck specific keys to keep the table readable
  const violationData = violations.map(
    ({ id, impact, description, nodes }) => ({
      id,
      impact,
      description,
      nodes: nodes.length,
    })
  );

  cy.task("table", violationData);
}

describe("Route tests", () => {
  route_load_tests_config.map((routes) => {
    describe(`${routes.name} route`, () => {
      routes.test_on.map((app) => {
        it(`Tested on ${app}`, () => {
          cy.visit(
            `http://localhost:8080/build/InfoBase/index-${app}.html#${routes.route}`
          );
          cy.injectAxe();
          cy.get(".leaf-spinner-inner-circle").should("not.exist");
          cy.checkA11y(null, null, terminalLog, true);
        });
      });
    });
  });
});
