import _ from "lodash";
import React, { Fragment } from "react";
import Select from "react-select";

import { backgroundColor, textColor } from "src/core/color_defs.js";
import { is_IE } from "src/core/feature_detection.js";

import { IconCopy, IconDownload } from "../../icons/icons.js";
import { DropdownMenu } from "../DropdownMenu.js";
import { create_text_maker_component } from "../misc_util_components.js";
import { WriteToClipboard } from "../WriteToClipboard.js";

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

export const PageSelector = ({
  current_page,
  num_pages,
  change_page,
  show_select,
  num_col,
}) => {
  const options = _.map(_.range(0, num_pages + 1), (num) => ({
    value: num + 1, //have to add one to this too since searching is on both value AND label
    label: num + 1,
  }));

  return (
    <tr className="page-selector">
      <td colSpan={num_col}>
        <div style={{ padding: "10px" }}>
          <div className="frow">
            <div className="fcol-xs-4">
              {current_page !== 0 && (
                <Fragment>
                  <button
                    className="btn-ib-light"
                    style={{ marginRight: "5px" }}
                    onClick={() => change_page(0)}
                  >
                    First
                  </button>
                  <button
                    className="btn-ib-light"
                    onClick={() => change_page(current_page - 1)}
                  >
                    Previous
                  </button>
                </Fragment>
              )}
            </div>
            <div className="fcol-xs-4 d-flex justify-content-center">
              {_.map(
                _.range(current_page - 2, current_page + 3),
                (num) =>
                  num >= 0 &&
                  num <= num_pages && (
                    <button
                      key={num}
                      className={`btn-ib-light${
                        (num === current_page && "--reversed") || ""
                      }`}
                      style={{ margin: "0px 2.5px" }}
                      onClick={() => change_page(num)}
                    >
                      {num + 1}
                    </button>
                  )
              )}
            </div>
            <div className="fcol-xs-4 d-flex justify-content-end">
              {current_page !== num_pages && (
                <Fragment>
                  <button
                    className="btn-ib-light"
                    style={{ marginRight: "5px" }}
                    onClick={() => change_page(current_page + 1)}
                  >
                    Next
                  </button>
                  <button
                    className="btn-ib-light"
                    onClick={() => change_page(num_pages)}
                  >
                    Last
                  </button>
                </Fragment>
              )}
            </div>
          </div>
        </div>
        {show_select && (
          <div style={{ padding: "2.5px 10px 0px" }}>
            <Select
              options={options}
              placeholder="Select page"
              key={current_page}
              styles={{
                menu: (provided) => ({
                  ...provided,
                  zIndex: 10000,
                  color: textColor,
                }),
              }}
              onChange={(option) => change_page(option.value - 1)} //account for extra 1 added earlier
            />
          </div>
        )}
      </td>
    </tr>
  );
};

export const PageinateBySelector = ({ selected, on_select, num_items }) => {
  const options = _.filter([10, 25, 50, 100, num_items > 100 && num_items]);

  const dropdown_content = (
    <div className="paginate_by_dropdown">
      <div style={{ marginBottom: 10 }}>
        {_.map(options, (option) => (
          <div key={option}>
            <input
              type={"radio"}
              name={"paginate_by_dropdown"}
              onClick={() => on_select(option)}
              defaultChecked={selected === option}
            />
            <label className={"normal-radio-btn-label"}>{option}</label>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <DropdownMenu
      opened_button_class_name={"btn-ib-light--reversed"}
      closed_button_class_name={"btn-ib-light"}
      button_description={""}
      dropdown_trigger_txt={"Items per page"}
      dropdown_content={dropdown_content}
    />
  );
};
