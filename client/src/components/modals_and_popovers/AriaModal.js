import classNames from "classnames";
import React from "react";
import { Modal } from "react-bootstrap";
import FocusLock from "react-focus-lock";

import "./bootstrap_modal_exstension.scss";

export class AriaModal extends React.Component {
  constructor(props) {
    super(props);

    if (!props.titleId) {
      throw new Error("Must have a prop titleId");
    }
  }

  //takes a string value
  hide_application_node_aria = (value) => {
    const { getApplicationNode } = this.props;

    const applicationNode = getApplicationNode();
    applicationNode.setAttribute("aria-hidden", value);
  };

  componentDidMount() {
    this.hide_application_node_aria("true");
  }

  componentWillUnmount() {
    this.hide_application_node_aria("false");
  }

  render() {
    const {
      mounted,
      children,
      additional_dialog_class,
      onExit,
      titleId,
    } = this.props;

    return (
      <Modal
        show={mounted}
        size="xl"
        onHide={onExit}
        dialogClassName={classNames(`modal-dialog`, additional_dialog_class)}
        aria-labelledby={titleId}
        centered
      >
        <Modal.Body style={{ padding: 0 }}>
          <FocusLock autoFocus={false}>{children}</FocusLock>
        </Modal.Body>
      </Modal>
    );
  }
}
