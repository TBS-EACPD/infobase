import React, { Fragment } from "react";

import { withRouter, RouteComponentProps } from "react-router-dom";

import { SafeJSURL } from "src/general_utils";

import { StatelessModal } from "./StatelessModal";

type ModalButtonProps = RouteComponentProps<{ options: string }> & {
  show_condition: { name: string; value: string };
  button_text: string;
  title: string;
  children: React.ReactNode;
  aria_label: string;
};

interface ModalButtonState {
  show_modal: boolean;
}

class ModalButton_ extends React.Component<ModalButtonProps, ModalButtonState> {
  constructor(props: ModalButtonProps) {
    super(props);

    const {
      show_condition,
      match: {
        params: { options },
      },
    } = this.props;

    const options_object = SafeJSURL.parse(options);

    this.state = {
      show_modal:
        show_condition &&
        options_object[show_condition.name] &&
        show_condition.value === options_object[show_condition.name],
    };
  }

  toggle_modal = () =>
    this.setState((prev_state) => ({ show_modal: !prev_state.show_modal }));

  render() {
    const { button_text, title, children, aria_label } = this.props;
    const { show_modal } = this.state;

    return (
      <Fragment>
        <button
          className="btn btn-link"
          onClick={this.toggle_modal}
          aria-label={aria_label}
          style={{ color: "#0275d8" }}
        >
          {button_text}
        </button>
        <StatelessModal
          show={show_modal}
          title={title}
          body={children}
          on_close_callback={this.toggle_modal}
          additional_dialog_class={"modal-responsive"}
        />
      </Fragment>
    );
  }
}

const ModalButton = withRouter(ModalButton_);
export { ModalButton };
