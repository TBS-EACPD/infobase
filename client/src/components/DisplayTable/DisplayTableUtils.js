import "./DisplayTableUtils.scss";
import text from "./DisplayTable.yaml";
import { create_text_maker_component } from "../misc_util_components.js";

import { WriteToClipboard } from "../WriteToClipboard.js";
import { IconCopy, IconDownload } from "../../icons/icons.js";

const { text_maker } = create_text_maker_component(text);

export class DisplayTableUtils extends React.Component {
  downloadCsv() {
    const { csv_string, table_name } = this.props;
    const uri = "data:text/csv;charset=UTF-8," + encodeURIComponent(csv_string);

    const temporary_anchor = document.createElement("a");
    temporary_anchor.setAttribute(
      "download",
      `${table_name ? table_name : "table"}.csv`
    );
    temporary_anchor.setAttribute("href", uri);
    temporary_anchor.dispatchEvent(new MouseEvent("click"));
  }
  render() {
    const { csv_string } = this.props;

    return (
      <div className="dp-utils-heading-container">
        {!window.feature_detection.is_IE() && (
          <button
            onClick={() => this.downloadCsv()}
            className={"dp-utils-heading"}
          >
            <IconDownload
              title={text_maker("download_table_data_desc")}
              color={window.infobase_color_constants.backgroundColor}
            />
          </button>
        )}
        <WriteToClipboard
          text_to_copy={csv_string}
          button_class_name={"dp-utils-heading"}
          button_description={text_maker("copy_table_data_desc")}
          IconComponent={IconCopy}
          icon_color={window.infobase_color_constants.backgroundColor}
        />
      </div>
    );
  }
}
