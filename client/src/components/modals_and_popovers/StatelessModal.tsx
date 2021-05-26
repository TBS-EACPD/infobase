import classNames from "classnames";
import _ from "lodash";
import React from "react";
import { Modal } from "react-bootstrap";

import { trivial_text_maker } from "src/models/text";
import "./bootstrap_modal_exstension.scss";

interface StatelessModalProps {
  on_close_callback: Function;
  show: boolean;
  title: string | React.ReactNode;
  subtitle?: string;
  header?: React.ReactNode;
  body: React.ReactNode;
  footer?: React.ReactNode;
  close_text: string;
  include_close_button_in_header: boolean;
  additional_dialog_class_name: string;
}

export class StatelessModal extends React.Component<StatelessModalProps> {
  static defaultProps = {
    close_text: _.upperFirst(trivial_text_maker("close")),
    include_close_button_in_header: false,
  };
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
      include_close_button_in_header,
      additional_dialog_class_name,
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

    const common_layout = (
      content: React.ReactNode,
      include_close_button: boolean
    ) => (
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
      include_close_button_in_header
    );
    const footer_content =
      footer ||
      (!include_close_button_in_header &&
        common_layout(footer || <div />, !include_close_button_in_header));

    return (
      <Modal
        show={show}
        size="xl"
        onHide={this.closeModal}
        dialogClassName={classNames(
          `modal-dialog`,
          additional_dialog_class_name
        )}
        centered
      >
        <div>
          <Modal.Header closeButton={!close_text}>
            {header_content}
          </Modal.Header>
          {body && <Modal.Body>{body}</Modal.Body>}
          {footer_content && <Modal.Footer>{footer_content}</Modal.Footer>}
        </div>
        <div tabIndex={0} onFocus={this.closeModal} />
      </Modal>
    );
  }
}
