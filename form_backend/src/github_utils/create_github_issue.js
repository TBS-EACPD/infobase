import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN,
});

export async function create_github_issue(issueContent) {
  // Validate and clean input data
  const cleanedContent = {
    title: issueContent.title || "Untitled Issue",
    body: issueContent.body || "",
    labels: Array.isArray(issueContent.labels)
      ? issueContent.labels.filter(Boolean)
      : [],
  };

  try {
    const response = await octokit.issues.create({
      owner: "TBS-EACPD",
      repo: "infobase",
      ...cleanedContent,
    });

    const issueUrl = response.data.html_url;
    console.log("GitHub issue created successfully:", issueUrl);
    return {
      success: true,
      url: issueUrl,
      issueNumber: response.data.number,
      title: response.data.title,
    };
  } catch (error) {
    console.error("Error creating GitHub issue:", error);
    return { success: false, error: error.message };
  }
}

function mapIssueTypeToLabels(issueTypes) {
  if (!issueTypes) return [];

  const labelMap = {
    bug: "bug",
    typo: "content",
    inaccurate: "content",
    outdated: "content",
    accessibility: "accessibility",
    navigation: "UX",
    other: null,
  };

  return issueTypes
    .map((type) => labelMap[type])
    .filter((label) => label !== null);
}

export function make_github_issue_from_completed_template(
  template_name,
  original_template,
  completed_template
) {
  // Extract relevant information
  const issueType = completed_template.issue_type?.join(", ");
  const issueDetails = completed_template.issue_details;
  const pageInfo = `Route: ${completed_template.route}\nLanguage: ${completed_template.lang}\nVersion: ${completed_template.app_version}`;

  return {
    title: `[User Report] ${issueType || "Issue Report"}`,
    body: `### Issue Details
${issueDetails}

### Page Information
${pageInfo}

### Additional Context
Template: ${template_name}
SHA: ${completed_template.sha}`,
    labels: [
      "user-reported",
      ...mapIssueTypeToLabels(completed_template.issue_type),
    ],
  };
}
