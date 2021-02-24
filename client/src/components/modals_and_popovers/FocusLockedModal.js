import classNames from "classnames";
import DOMPurify from "dompurify";
import PropTypes from "prop-types";
import React from "react";
import { Modal } from "react-bootstrap";
import FocusLock from "react-focus-lock";

import "./bootstrap_modal_exstension.scss";

export class FocusLockedModal extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      mounted,
      children,
      additional_dialog_class,
      on_exit,
      aria_label,
    } = this.props;

    const cleaned_aria_label = DOMPurify.sanitize(aria_label, {
      ALLOWED_TAGS: [],
    });

    return (
      <Modal
        show={mounted}
        size="xl"
        onHide={on_exit}
        dialogClassName={classNames(`modal-dialog`, additional_dialog_class)}
        aria-label={cleaned_aria_label}
        centered
      >
        <Modal.Body style={{ padding: 0 }}>
          <FocusLock>{children}</FocusLock>
        </Modal.Body>
      </Modal>
    );
  }
}

FocusLockedModal.propTypes = {
  aria_label: PropTypes.string.isRequired,
};
