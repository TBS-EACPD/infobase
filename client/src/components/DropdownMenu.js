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
      dropdown_trigger_txt,
    } = this.props;
    const { isOpen } = this.state;

    return (
      <div className="dropdown">
        <button
          className={
            isOpen ? opened_button_class_name : closed_button_class_name
          }
          style={{ marginRight: 5 }}
          onClick={() => this.setState({ isOpen: !isOpen })}
          title={button_description}
        >
          {isOpen ? (
            <div className="close-dropdown">
              <span className="close-dropdown__x">X </span>
              {dropdown_trigger_txt}
            </div>
          ) : (
            dropdown_trigger_txt
          )}
        </button>
        <div
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
