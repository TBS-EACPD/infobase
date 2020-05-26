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
      dropdownContent,
      button_class_name,
      button_description,
      IconComponent,
      icon_color,
    } = this.props;
    const { isOpen } = this.state;

    return (
      <div className="dropdown">
        <button
          className={button_class_name}
          onClick={() => this.setState({ isOpen: !isOpen })}
        >
          <IconComponent
            title={button_description}
            color={icon_color}
            alternate_color={false}
          />
        </button>
        <div
          className={classNames(
            "dropdown-content",
            isOpen && "dropdown-is-open"
          )}
        >
          {dropdownContent}
        </div>
      </div>
    );
  }
}
