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

describe("Passing test", () => {
  beforeEach(() => {
    Cypress.automation("remote:debugger:protocol", {
      command: "Network.enable",
      params: {},
    });
    Cypress.automation("remote:debugger:protocol", {
      command: "Network.setCacheDisabled",
      params: { cacheDisabled: true },
    });
  });

  //Simple test for updated docker image
  it("Should pass", () => {
    cy.intercept("/graphql?*").as("graphql");
    cy.visit(
      "http://localhost:8080/build/InfoBase/index-eng.html#orgs/gov/gov/infograph/covid"
    );
  });
});
