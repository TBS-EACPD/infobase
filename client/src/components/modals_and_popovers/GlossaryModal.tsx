import React from "react";

import { StatelessModal } from "./StatelessModal";

type GlossaryModalState = {
  show_modal: boolean;
};

type GlossaryModalProps = {
  text: string;
  body: React.ReactNode;
};

export class GlossaryModal extends React.Component<
  GlossaryModalProps,
  GlossaryModalState
> {
  state = { show_modal: true };

  toggle_modal = () =>
    this.setState((prev_state) => ({ show_modal: !prev_state.show_modal }));

  render() {
    const { text, body } = this.props;
    const { show_modal } = this.state;
    console.log("\nGlossaryModal - render");
    console.log(this.props);
    console.log(this.state);

    return (
      <>
        <button onClick={this.toggle_modal}>{text}</button>
        <StatelessModal
          show={show_modal}
          size="sm"
          body={body}
          on_close_callback={this.toggle_modal}
        />
      </>
    );
  }
}
