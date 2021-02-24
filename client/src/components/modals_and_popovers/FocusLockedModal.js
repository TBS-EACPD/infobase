import classNames from "classnames";
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

    return (
      <FocusLock>
        <Modal
          show={mounted}
          size="xl"
          onHide={onExit}
          dialogClassName={classNames(`modal-dialog`, additional_dialog_class)}
          aria-label={ariaLabel}
          data-autofocus
          centered
        >
          <Modal.Body style={{ padding: 0 }}>{children}</Modal.Body>
        </Modal>
      </FocusLock>
    );
  }
}
