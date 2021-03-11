import React, { Fragment } from "react";

import { DropdownMenu } from "src/components/DropdownMenu.js";
import { create_text_maker_component } from "src/components/misc_util_components.js";
import { WriteToClipboard } from "src/components/WriteToClipboard.js";

import { backgroundColor } from "src/core/color_defs.js";
import { is_IE } from "src/core/feature_detection.js";

import { IconCopy, IconDownload } from "src/icons/icons.js";

import text from "./DisplayTable.yaml";
import "./DisplayTableUtils.scss";

const { text_maker } = create_text_maker_component(text);

export const DisplayTableCopyCsv = ({ csv_string }) => (
  <WriteToClipboard
    text_to_copy={csv_string}
    button_class_name={"display_table__util-icon"}
    button_description={text_maker("copy_table_data_desc")}
    IconComponent={IconCopy}
    icon_color={backgroundColor}
  />
);

export const DisplayTableColumnToggle = ({ columns }) => (
  <DropdownMenu
    opened_button_class_name={"btn-ib-light--reversed"}
    closed_button_class_name={"btn-ib-light"}
    button_description={text_maker("select_columns")}
    dropdown_content={columns}
    dropdown_content_class_name={"no-right"}
    dropdown_trigger_txt={text_maker("select_columns")}
  />
);

const download_csv = (csv_string, table_name) => {
  const uri =
    "data:text/csv;charset=UTF-8,\uFEFF" + encodeURIComponent(csv_string);

  const temporary_anchor = document.createElement("a");
  temporary_anchor.setAttribute(
    "download",
    `${table_name ? table_name : text_maker("table")}.csv`
  );
  temporary_anchor.setAttribute("href", uri);
  temporary_anchor.dispatchEvent(new MouseEvent("click"));
};
export const DisplayTableDownloadCsv = ({ csv_string, table_name }) => (
  <Fragment>
    {!is_IE() && (
      <button
        onClick={() => download_csv(csv_string, table_name)}
        className={"display_table__util-icon"}
      >
        <IconDownload
          title={text_maker("download_table_data_desc")}
          color={backgroundColor}
        />
      </button>
    )}
  </Fragment>
);
