import classNames from "classnames";
import React from "react";
import { Modal } from "react-bootstrap";

import { trivial_text_maker } from "../../models/text.js";
import "./bootstrap_modal_exstension.scss";

export class StatelessModal extends React.Component {
  constructor(props) {
    super(props);
  }
  componentWillUnmount() {
    this.closeModal();
  }
  closeModal = () => {
    this.props.on_close_callback();
  };
  render() {
    const {
      show,
      title,
      subtitle,
      header,
      body,
      footer,
      close_text,
      close_button_in_header,
      additional_dialog_class,
    } = this.props;

    const default_header = (
      <div className="modal-dialog__title-layout">
        {title && (
          <Modal.Title style={{ fontSize: "130%" }}>{title}</Modal.Title>
        )}
        {subtitle && (
          <Modal.Title style={{ fontSize: "100%", marginTop: "7px" }}>
            {subtitle}
          </Modal.Title>
        )}
      </div>
    );

    const common_layout = (content, include_close_button) => (
      <div className="modal-dialog__header-footer-layout">
        {
          content || (
            <div />
          ) /* empty div fallback so that space-between justification consistently positions the close button */
        }
        {include_close_button && (
          <button className="btn btn-ib-primary" onClick={this.closeModal}>
            {close_text}
          </button>
        )}
      </div>
    );
    const header_content = common_layout(
      header || default_header,
      close_button_in_header
    );
    const footer_content =
      footer ||
      (!close_button_in_header &&
        common_layout(footer || <div />, !close_button_in_header));

    return (
      <Modal
        show={show}
        onHide={this.closeModal}
        dialogClassName={classNames(`modal-dialog`, additional_dialog_class)}
      >
        <div>
          <Modal.Header closeButton={!close_text}>
            {header_content}
          </Modal.Header>
          {body && <Modal.Body>{body}</Modal.Body>}
          {footer_content && <Modal.Footer>{footer_content}</Modal.Footer>}
        </div>
        <div tabIndex="0" onFocus={this.closeModal} />
      </Modal>
    );
  }
}
StatelessModal.defaultProps = {
  close_text: _.upperFirst(trivial_text_maker("close")),
  close_button_in_header: false,
};
