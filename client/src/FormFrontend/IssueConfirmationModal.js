import React from "react";

import { create_text_maker_component } from "src/components/misc_util_components";

import text from "./FormFrontend.yaml";

import "./IssueConfirmationModal.scss";

const { text_maker } = create_text_maker_component(text);

export const IssueConfirmationModal = ({ issueUrl, onClose }) => {
  return (
    <div className="issue-confirmation-modal-backdrop">
      <div className="issue-confirmation-modal">
        <div className="issue-confirmation-modal__content">
          <h3>{text_maker("issue_confirmation_title")}</h3>
          <p>{text_maker("form_frontend_has_sent_success")}</p>
          <p>
            {text_maker("github_issue_created")}
            <a href={issueUrl} target="_blank" rel="noopener noreferrer">
              {issueUrl}
            </a>
          </p>
          <div className="issue-confirmation-modal__actions">
            <button className="btn-sm btn btn-ib-primary" onClick={onClose}>
              {text_maker("issue_confirmation_close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
