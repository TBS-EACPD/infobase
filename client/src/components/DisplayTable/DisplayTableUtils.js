import _ from "lodash";
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

export const SelectPage = ({
  current_page,
  num_pages,
  change_page,
  num_col,
}) => {
  return (
    <tr className="page-selector-controls">
      <td colSpan={num_col}>
        <div style={{ padding: "10px" }}>
          <div className="frow">
            <div
              className="fcol-xs-12 d-flex justify-content-center page-selector"
              style={{ flexWrap: "wrap" }}
            >
              {current_page > 2 && (
                <Fragment>
                  <button
                    className="btn-ib-light"
                    onClick={() => change_page(0)}
                    aria-label={text_maker("page", { page_num: 1 })}
                    role="tab"
                  >
                    1
                  </button>
                  {current_page > 3 && (
                    <button
                      className="btn-ib-light"
                      tabIndex="-1"
                      onClick={() => change_page(current_page - 3)}
                      aria-label={text_maker("page", {
                        page_num: current_page - 2,
                      })}
                      role="tab"
                    >
                      &hellip;
                    </button>
                  )}
                </Fragment>
              )}
              {_.map(
                _.range(current_page - 2, current_page + 3),
                (num) =>
                  num >= 0 &&
                  num <= num_pages - 1 && (
                    <button
                      key={num}
                      className={`btn-ib-light${
                        (num === current_page && "--reversed") || ""
                      }`}
                      onClick={() => change_page(num)}
                      aria-label={text_maker("page", { page_num: num + 1 })}
                      role="tab"
                      aria-selected={`${num === current_page}`}
                    >
                      {num + 1}
                    </button>
                  )
              )}
              {current_page < num_pages - 3 && (
                <Fragment>
                  {current_page < num_pages - 4 && (
                    <button
                      className="btn-ib-light"
                      tabIndex="-1"
                      onClick={() => change_page(current_page + 3)}
                      aria-label={text_maker("page", {
                        page_num: current_page + 4,
                      })}
                      role="tab"
                    >
                      &hellip;
                    </button>
                  )}
                  <button
                    className="btn-ib-light"
                    onClick={() => change_page(num_pages - 1)}
                    aria-label={text_maker("page", {
                      page_num: num_pages,
                    })}
                    role="tab"
                  >
                    {num_pages}
                  </button>
                </Fragment>
              )}
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
};

export const SelectPageSize = ({
  selected,
  on_select,
  page_size_increment,
  num_items,
  num_options_max,
}) => {
  const num_options =
    _.ceil(num_items / page_size_increment) > num_options_max
      ? num_options_max
      : _.ceil(num_items / page_size_increment);

  const options = _.chain(num_options + 1)
    .range()
    .map((_, ix) => {
      if (ix === num_options) {
        return { value: num_items, label: text_maker("show_all") };
      } else {
        return {
          value: (ix + 1) * page_size_increment,
          label: (ix + 1) * page_size_increment,
        };
      }
    })
    .value();

  const dropdown_content = (
    <form className="paginate_by_dropdown">
      <div style={{ marginBottom: 10 }}>
        {_.map(options, ({ label, value }) => (
          <div key={value} onClick={() => on_select(value)}>
            <input
              type={"radio"}
              name={"paginate_by_dropdown"}
              checked={selected === value}
              readOnly
            />
            <label className={"normal-radio-btn-label"}>{label}</label>
          </div>
        ))}
      </div>
    </form>
  );

  return (
    <DropdownMenu
      opened_button_class_name={"btn-ib-light--reversed"}
      closed_button_class_name={"btn-ib-light"}
      button_description={text_maker("items_per_page_description")}
      dropdown_trigger_txt={text_maker("items_per_page")}
      dropdown_content={dropdown_content}
    />
  );
};
