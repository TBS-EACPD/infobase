import { Fragment } from "react";
import { StatelessModal } from "./StatelessModal";

export class ModalButton extends React.Component {
  state = {
    show_modal: false,
  };

  toggle_modal = () =>
    this.setState((prev_state) => ({ show_modal: !prev_state.show_modal }));

  render() {
    const { button_text, title, children } = this.props;
    const { show_modal } = this.state;

    return (
      <Fragment>
        <button
          className="btn-link"
          onClick={this.toggle_modal}
          aria-label="TODO"
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
