import { make_github_issue_from_completed_template } from "./create_github_issue.js";

describe("make_github_issue_from_completed_template", () => {
  it("builds a user-reported issue with expected title/body/labels", () => {
    const original_template = {};
    const completed_template = {
      issue_type: ["bug", "navigation"],
      issue_details: "Steps to reproduce:\n1) Do thing\n2) It breaks",
      route: "foo",
      lang: "en",
      app_version: "standard",
      sha: "abc1234",
    };

    const issue = make_github_issue_from_completed_template(
      "report_a_problem",
      original_template,
      completed_template
    );

    expect(issue.title).toBe("[User Report] bug, navigation");
    expect(issue.body).toContain("### Issue Details");
    expect(issue.body).toContain(completed_template.issue_details);
    expect(issue.body).toContain("### Page Information");
    expect(issue.body).toContain(`Route: ${completed_template.route}`);
    expect(issue.body).toContain(`Language: ${completed_template.lang}`);
    expect(issue.body).toContain(`Version: ${completed_template.app_version}`);
    expect(issue.body).toContain("### Additional Context");
    expect(issue.body).toContain("Template: report_a_problem");
    expect(issue.body).toContain(`SHA: ${completed_template.sha}`);

    // note: mapping currently returns "UX" for navigation
    expect(issue.labels).toEqual(["user-reported", "bug", "UX"]);
  });
});

