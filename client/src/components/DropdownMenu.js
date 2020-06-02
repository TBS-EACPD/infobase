import "./DropdownMenu.scss";
import classNames from "classnames";

export class DropdownMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
    };
  }
  render() {
    const {
      dropdown_content,
      opened_button_class_name,
      closed_button_class_name,
      dropdown_content_class_name,
      button_description,
      custom_dropdown_trigger,
    } = this.props;
    const { isOpen } = this.state;

    return (
      <div className="dropdown">
        <button
          className={
            isOpen ? opened_button_class_name : closed_button_class_name
          }
          onClick={() => this.setState({ isOpen: !isOpen })}
          title={button_description}
        >
          {custom_dropdown_trigger}
        </button>
        <div
          aria-hidden={true}
          className={classNames(
            dropdown_content_class_name,
            "dropdown__content",
            isOpen && "dropdown__content__is-open"
          )}
        >
          {dropdown_content}
        </div>
      </div>
    );
  }
}
