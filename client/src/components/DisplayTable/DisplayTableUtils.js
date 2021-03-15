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
  const get_shifted_option_range = (
    page_count,
    current_page,
    option_window
  ) => {
    const window_start = current_page - option_window;
    const window_end = current_page + option_window;
    if (window_start < 1) {
      return _.range(1, window_end + 1 - (window_start - 1));
    } else if (window_end > page_count) {
      return _.range(window_start - (window_end - page_count), page_count + 1);
    } else {
      return _.range(window_start, window_end + 1);
    }
  };
  const extend_options_left = (option_range, page_count, current_page) => {
    if (_.first(option_range) === 1) {
      return [
        ...option_range,
        _.last(option_range) + 1,
        _.last(option_range) + 2,
      ];
    } else if (_.first(option_range) === 2) {
      return [1, ...option_range, _.last(option_range) + 1];
    } else if (_.first(option_range) === 3) {
      return [1, 2, ...option_range];
    } else if (current_page === page_count - 3) {
      return [
        1,
        _.first(option_range) - 2,
        _.first(option_range) - 1,
        ...option_range,
      ];
    } else if (current_page > page_count - 3) {
      return [
        1,
        _.first(option_range) - 3,
        _.first(option_range) - 2,
        _.first(option_range) - 1,
        ...option_range,
      ];
    } else {
      return option_range;
    }
  };
  const extend_options_right = (option_range, page_count, option_window) => {
    if (
      _.includes(option_range, page_count - option_window) &&
      _.last(option_range) !== page_count
    ) {
      return [
        ...option_range,
        ..._.range(_.last(option_range) + 1, page_count + 1),
      ];
    } else {
      return option_range;
    }
  };
  const get_page_options = (page_count, current_page, option_window = 2) => {
    const raw_page_options = _.chain(
      //without ellipsis
      get_shifted_option_range(page_count, current_page, option_window)
    )
      .thru((option_range) =>
        extend_options_left(option_range, page_count, current_page)
      )
      .thru((option_range) =>
        extend_options_right(option_range, page_count, option_window)
      )
      .filter((page_index) => _.inRange(page_index, 1, page_count + 1))
      .uniq()
      .sortBy()
      .value();

    if (page_count > option_window * 2 + 5) {
      if (raw_page_options.length === option_window * 2 + 5) {
        return raw_page_options;
      } else if (raw_page_options.length === option_window * 2 + 1) {
        return [
          1,
          _.first(raw_page_options) - 1,
          ...raw_page_options,
          _.last(raw_page_options) + 1,
          page_count,
        ];
      } else {
        if (!_.includes(raw_page_options, 1)) {
          return [1, _.first(raw_page_options) - 1, ...raw_page_options];
        } else if (!_.includes(raw_page_options, page_count)) {
          return [
            ...raw_page_options,
            _.last(raw_page_options) + 1,
            page_count,
          ];
        }
      }
    } else {
      return raw_page_options;
    }
  };

  const page_options = get_page_options(num_pages, current_page + 1);
  return (
    <tr className="page-selector-controls">
      <td colSpan={num_col}>
        <div style={{ padding: "10px" }}>
          <div className="frow">
            <div
              className="fcol-xs-12 d-flex justify-content-center page-selector"
              style={{ flexWrap: "wrap" }}
            >
              {_.map(page_options, (page_num, index) => (
                <button
                  key={page_num}
                  className={`btn-ib-light${
                    (page_num - 1 === current_page && "--reversed") || ""
                  }`}
                  onClick={() => change_page(page_num - 1)}
                  aria-label={text_maker("page", { page_num: page_num })}
                  role="tab"
                  aria-selected={`${page_num - 1 === current_page}`}
                  dangerouslySetInnerHTML={{
                    __html:
                      index !== 0 &&
                      index !== page_options.length - 1 &&
                      (page_options[index + 1] !== page_num + 1 ||
                        page_options[index - 1] !== page_num - 1)
                        ? "&hellip;"
                        : page_num,
                  }}
                ></button>
              ))}
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
