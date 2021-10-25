import React from "react";

import { StatelessModal } from "./StatelessModal";

type ModalButtonState = {
  show_modal: boolean;
};

type ModalButtonProps = {
  body: React.ReactNode;
};

export class ModalButton extends React.Component<
  ModalButtonProps,
  ModalButtonState
> {
  state = { show_modal: true };

  close_modal = () => {
    this.setState({ show_modal: false });
  };

  render() {
    const { body } = this.props;
    const { show_modal } = this.state;

    return (
      <StatelessModal
        show={show_modal}
        size="sm"
        body={body}
        on_close_callback={this.close_modal}
      />
    );
  }
}
