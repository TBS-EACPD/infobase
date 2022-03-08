import classNames from "classnames";
import _ from "lodash";
import React from "react";
import { Modal } from "react-bootstrap";

import { trivial_text_maker } from "src/models/text";
import "./bootstrap_modal_exstension.scss";

const StatelessModalDefaultProps = {
  close_text: _.upperFirst(trivial_text_maker("close")) as React.ReactNode,
  include_close_button_in_header: false,
};
type StatelessModalProps = typeof StatelessModalDefaultProps & {
  on_close_callback: () => void;
  show: boolean;
  title: string;
  subtitle?: React.ReactNode;
  footer?: React.ReactNode;
  additional_dialog_class?: string;
  children?: React.ReactNode;
};

export class StatelessModal extends React.Component<
  StatelessModalProps,
  { title_id: string }
> {
  static defaultProps = StatelessModalDefaultProps;
  constructor(props: StatelessModalProps) {
    super(props);

    this.state = { title_id: _.uniqueId("modal-title-") };
  }
  componentWillUnmount() {
    this.closeModal();
  }
  closeModal = () => {
    this.props.on_close_callback();
  };
  render() {
    const { title_id } = this.state;

    const {
      show,
      title,
      subtitle,
      footer,
      close_text,
      include_close_button_in_header,
      additional_dialog_class,
      children,
    } = this.props;

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
      <div className="modal-dialog__title-layout">
        <Modal.Title style={{ fontSize: "130%" }}>
          <h1 id={title_id}>{title}</h1>
        </Modal.Title>
        {subtitle && (
          <Modal.Title style={{ fontSize: "100%", marginTop: "7px" }}>
            {subtitle}
          </Modal.Title>
        )}
      </div>,
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
        dialogClassName={classNames("modal-dialog", additional_dialog_class)}
        centered
        aria-labelledby={title_id}
      >
        <div role="main">
          <Modal.Header closeButton={!close_text}>
            {header_content}
          </Modal.Header>
          {children && <Modal.Body>{children}</Modal.Body>}
          {footer_content && <Modal.Footer>{footer_content}</Modal.Footer>}
        </div>
      </Modal>
    );
  }
}
