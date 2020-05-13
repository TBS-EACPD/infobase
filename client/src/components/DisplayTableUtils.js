import "./DisplayTableUtils.scss";

import { WriteToClipboard } from "./WriteToClipboard.js";
import { IconCopy } from "../icons/icons.js";

export class DisplayTableUtils extends React.Component {
  render() {
    const { data_to_csv_string } = this.props;

    return (
      <div className="heading-container">
        <WriteToClipboard
          text_to_copy={data_to_csv_string}
          button_class_name={"heading-utils"}
          IconComponent={IconCopy}
          icon_color={window.infobase_color_constants.backgroundColor}
        />
      </div>
    );
  }
}
