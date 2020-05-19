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
    const { dropdownContent } = this.props;
    const { isOpen } = this.state;
    return (
      <div className="dropdown">
        <button onClick={() => this.setState({ isOpen: !isOpen })}>
          TODO: column visible toggle btn design
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
