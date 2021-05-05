import classNames from "classnames";
import DOMPurify from "dompurify";
import React from "react";
import { Modal } from "react-bootstrap";
import FocusLock from "react-focus-lock";

import "./bootstrap_modal_exstension.scss";

interface FocusLockedModalProps {
  mounted: boolean;
  children: React.ReactNode;
  additional_dialog_class: string | Object;
  on_exit: () => void;
  aria_label: string;
}

export class FocusLockedModal extends React.Component<
  FocusLockedModalProps,
  {}
> {
  constructor(props: FocusLockedModalProps) {
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
