import React from "react";

import { StatelessModal } from "./StatelessModal";

type ModalButtonState = {
  show_modal: boolean;
};

type ModalButtonProps = {
  title?: React.ReactNode;
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
    const { title, body } = this.props;
    const { show_modal } = this.state;

    return (
      <StatelessModal
        title={title}
        show={show_modal}
        size="lg"
        body={body}
        on_close_callback={this.close_modal}
      />
    );
  }
}
