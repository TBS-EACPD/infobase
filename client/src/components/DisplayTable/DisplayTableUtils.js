import "./DisplayTableUtils.scss";
import text from "./DisplayTable.yaml";
import { create_text_maker_component } from "../misc_util_components.js";

import { WriteToClipboard } from "../WriteToClipboard.js";
import { IconCopy } from "../../icons/icons.js";

const { text_maker } = create_text_maker_component(text);

export class DisplayTableUtils extends React.Component {
  render() {
    const { data_to_csv_string } = this.props;

    return (
      <div className="dp-utils-heading-container">
        <WriteToClipboard
          text_to_copy={data_to_csv_string}
          button_class_name={"dp-utils-heading"}
          button_description={text_maker("copy_table_data_desc")}
          IconComponent={IconCopy}
          icon_color={window.infobase_color_constants.backgroundColor}
        />
      </div>
    );
  }
}
