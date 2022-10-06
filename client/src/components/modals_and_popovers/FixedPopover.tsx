import classNames from "classnames";
import _ from "lodash";
import React from "react";
import { Modal } from "react-bootstrap";

import { CountdownCircle } from "src/components/CountdownCircle/CountdownCircle";

import { trivial_text_maker } from "src/models/text";

import { is_a11y_mode } from "src/core/injected_build_constants";

import "./bootstrap_modal_exstension.scss";
import "./FixedPopover.scss";

// Lots of StatlessModal DNA in here, but conciously not DRYed against it! Don't want to couple
// them, I actually want to encourage them to diverge further in the future to the point that
// they should eventually not be grouped in the same directory.
// They've got totally different behaviour and use cases, they shouldn't feel interchangeable!

// FixedPopover should stop hacking over top of Bootstrap's Modal sooner rather than later too.
// (TODO, but likely only after we've updated to Bootstrap 4)

type FixedPopoverProps = {
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  header?: string;
  body?: string | React.ReactNode;
  footer?: string;
  additional_dialog_class?: string;
  auto_close_time?: number | boolean | null;
} & typeof FixedPopover.defaultProps;

type FixedPopoverState = {
  timeout_stopped: boolean;
};

export class FixedPopover extends React.Component<
  FixedPopoverProps,
  FixedPopoverState
> {
  static defaultProps = {
    show: false,
    dialog_position: "left",
    close_text: _.upperFirst(trivial_text_maker("close")),
    close_button_in_header: false,
    on_close_callback: _.noop as () => void,

    // Always restore focus in a11y mode, otherwise probably don't want to restore focus if the window could scroll
    // since it will (unexpectedly for the user) jump the window back when focus returns.
    restore_focus: is_a11y_mode,

    // if the popup gets too tall, it will be cut-off (and possibly non-interactable for it) on mobile
    // 40vh is a bit arbitrary as a default, but leaves room for long header/footer content
    max_body_height: "40vh",
  };
  constructor(props: FixedPopoverProps) {
    super(props);

    this.state = { timeout_stopped: false };
  }
  componentDidUpdate() {
    const { show } = this.props;

    if (show) {
      // Bootstrap modals prevent scrolling by temporarily adding the 'modal-open' class to <body>
      // Add our own alongside it to override that
      document.body.classList.add("modal-open--allow-scroll");
    }
  }
  componentWillUnmount() {
    this.closeModal();
  }
  closeModal = () => {
    // Reset
    document.body.classList.remove("modal-open--allow-scroll");
    this.setState({ timeout_stopped: false });

    this.props.on_close_callback();
  };

  render() {
    const {
      max_body_height,
      show,
      title,
      subtitle,
      header,
      body,
      footer,
      dialog_position,
      additional_dialog_class,
      close_text,
      close_button_in_header,
      restore_focus,
      auto_close_time,
    } = this.props;

    const { timeout_stopped } = this.state;

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

    const close_button_and_timer = (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          height: "3em",
        }}
      >
        {typeof auto_close_time === "number" && !timeout_stopped && (
          <CountdownCircle
            time={auto_close_time}
            show_numbers={auto_close_time >= 2000}
            size="3em"
            on_end_callback={this.closeModal}
          />
        )}
        {close_text && (
          <button className="btn btn-ib-primary" onClick={this.closeModal}>
            {close_text}
          </button>
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
        {include_close_button && close_button_and_timer}
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
        modal-without-backdrop={"true"}
        backdrop={false}
        dialogClassName={classNames(
          `modal-dialog--${dialog_position}`,
          additional_dialog_class
        )}
        onHide={this.closeModal}
        restoreFocus={restore_focus}
      >
        <div
          onFocus={() => this.setState({ timeout_stopped: show })}
          onMouseOver={() => this.setState({ timeout_stopped: show })}
        >
          <Modal.Header closeButton={!close_text}>
            {header_content}
          </Modal.Header>
          {body && (
            <Modal.Body
              style={
                max_body_height
                  ? { maxHeight: max_body_height, overflowY: "auto" }
                  : {}
              }
            >
              {body}
            </Modal.Body>
          )}
          {footer_content && (
            <Modal.Footer style={{ marginTop: 10 }}>
              {footer_content}
            </Modal.Footer>
          )}
        </div>
      </Modal>
    );
  }
}
