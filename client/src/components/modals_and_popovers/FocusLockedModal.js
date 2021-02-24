import classNames from "classnames";
import DOMPurify from "dompurify";
import React from "react";
import { Modal } from "react-bootstrap";
import FocusLock from "react-focus-lock";

import "./bootstrap_modal_exstension.scss";

export class FocusLockedModal extends React.Component {
  constructor(props) {
    super(props);

    if (!props.ariaLabel) {
      throw new Error("Must have a prop ariaLabel");
    }
  }

  render() {
    const {
      mounted,
      children,
      additional_dialog_class,
      onExit,
      ariaLabel,
    } = this.props;

    const aria_label = DOMPurify.sanitize(ariaLabel, { ALLOWED_TAGS: [] });

    return (
      <Modal
        show={mounted}
        size="xl"
        onHide={onExit}
        dialogClassName={classNames(`modal-dialog`, additional_dialog_class)}
        aria-label={aria_label}
        centered
      >
        <Modal.Body style={{ padding: 0 }}>
          <FocusLock>{children}</FocusLock>
        </Modal.Body>
      </Modal>
    );
  }
}
