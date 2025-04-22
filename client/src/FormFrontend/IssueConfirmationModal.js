import React from "react";

import {
  ExternalLink,
  create_text_maker_component,
} from "src/components/misc_util_components";

import text from "./FormFrontend.yaml";

const { TM } = create_text_maker_component(text);

export const IssueConfirmationModal = ({ issueUrl }) => {
  return (
    <div className="issue-confirmation-modal">
      <TM k="github_issue_success" />
      <p>
        <ExternalLink href={issueUrl}>{issueUrl}</ExternalLink>
      </p>
    </div>
  );
};
