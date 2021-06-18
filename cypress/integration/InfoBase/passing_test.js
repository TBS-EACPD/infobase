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
  it("Should pass", () => {
    cy.visit("http://localhost:8080/build/InfoBase/index-eng.html");
    cy.injectAxe();
    cy.get('[href="#glossary"]').click();
    cy.url().should(
      "eq",
      "http://localhost:8080/build/InfoBase/index-eng.html#glossary"
    );
    cy.get(".leaf-spinner-inner-circle").should("not.exist");
    cy.checkA11y(null, null, terminalLog, true);
  });
});
