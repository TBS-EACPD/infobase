Cypress.Commands.add("terminalLog", (violations) => {
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
});

Cypress.on("window:before:load", (win) => {
  cy.stub(win.console, "error", (msg) => {
    if (msg.includes('No reducer provided for key "app"')) {
      return null;
    }

    cy.now("task", "error", msg);
    throw new Error(msg);
  });

  cy.stub(win.console, "warn", (msg) => {
    cy.now("task", "warn", msg);
  });
});
