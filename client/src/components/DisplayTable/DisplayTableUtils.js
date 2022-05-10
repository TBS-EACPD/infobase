import _ from "lodash";
import React, { Fragment, useState } from "react";

import { CheckBox } from "src/components/CheckBox/CheckBox";
import { DebouncedTextInput } from "src/components/DebouncedTextInput/DebouncedTextInput";
import { DropdownMenu } from "src/components/DropdownMenu/DropdownMenu";
import { create_text_maker_component } from "src/components/misc_util_components";
import { SelectAllControl } from "src/components/SelectAllControl";
import { WriteToClipboard } from "src/components/WriteToClipboard/WriteToClipboard";

import { IconCopy, IconDownload, IconFilter } from "src/icons/icons";

import {
  backgroundColor,
  tertiaryColor,
  secondaryColor,
} from "src/style_constants/index";

import text from "./DisplayTable.yaml";
import "./DisplayTableUtils.scss";

const { text_maker, TM } = create_text_maker_component(text);

export const DropdownFilter = ({
  column_key,
  set_filter_options,
  filter_options_by_column,
  column_searches,
}) => {
  const [search, set_search] = useState("");
  const clean_search_string = (string) =>
    _.chain(string).deburr().toLower().trim().value();

  const list = filter_options_by_column[column_key];

  const is_filter_active = _.reject(list, "active").length > 0;

  const filtered_list = _.filter(list, ({ label }) => {
    const cleaned_label = clean_search_string(label);
    return (
      _.includes(cleaned_label, clean_search_string(search)) &&
      _.includes(cleaned_label, column_searches[column_key])
    );
  });

  return (
    <DropdownMenu
      opened_button_class_name={"button-unstyled"}
      closed_button_class_name={"button-unstyled"}
      dropdown_a11y_txt={text_maker("filter_data")}
      dropdown_trigger_txt={
        <IconFilter
          color={is_filter_active ? secondaryColor : tertiaryColor}
          alternate_color={is_filter_active ? tertiaryColor : secondaryColor}
        />
      }
      dropdown_content={
        <div>
          <DebouncedTextInput
            inputClassName={`search input-sm border-radius`}
            style={{ width: "100%" }}
            placeHolder={text_maker("search_filter_options")}
            a11y_label={text_maker("search_filter_options")}
            defaultValue={search}
            updateCallback={(search_value) => set_search(search_value)}
            debounceTime={300}
          />
          {filtered_list.length > 0 ? (
            <>
              <div className="display-table-dropdown-filter">
                {_.map(filtered_list, ({ id, label, active, color }) => (
                  <CheckBox
                    key={id}
                    color={color}
                    label={label}
                    active={active}
                    container_style={{ marginTop: "10px" }}
                    label_style={{ textAlign: "left" }}
                    onClick={() =>
                      set_filter_options({
                        ...filter_options_by_column,
                        [column_key]: _.map(list, (item) =>
                          item.id === id ? { ...item, active: !active } : item
                        ),
                      })
                    }
                  />
                ))}
              </div>
              <div style={{ marginBottom: "5px" }}>
                <SelectAllControl
                  SelectAllOnClick={() =>
                    set_filter_options({
                      ...filter_options_by_column,
                      [column_key]: _.map(list, (item) => ({
                        ...item,
                        active: true,
                      })),
                    })
                  }
                  SelectNoneOnClick={() =>
                    set_filter_options({
                      ...filter_options_by_column,
                      [column_key]: _.map(list, (item) => ({
                        ...item,
                        active: false,
                      })),
                    })
                  }
                />
              </div>
            </>
          ) : (
            <TM k="no_data" className="large_panel_text" />
          )}
        </div>
      }
    />
  );
};

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
    <button
      onClick={() => download_csv(csv_string, table_name)}
      className={"display_table__util-icon"}
    >
      <IconDownload
        aria_label={text_maker("download_table_data_desc")}
        color={backgroundColor}
      />
    </button>
  </Fragment>
);

const _is_ellipsis = (page_options, page_num, index) =>
  index !== 0 &&
  index !== page_options.length - 1 &&
  (page_options[index + 1] !== page_num + 1 ||
    page_options[index - 1] !== page_num - 1);

export const SelectPage = ({
  current_page,
  num_pages,
  change_page,
  num_col,
}) => {
  /*
   * TODO: refactor/clean up the following logic to be a lot more dense/simple to understand
   * To future devs: you probably don't need to understand how this logic works unless changes
   * are absolutely needed.
   */
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
      //option range sees page 1, add 2 to the end
      return [
        ...option_range,
        _.last(option_range) + 1,
        _.last(option_range) + 2,
      ];
    } else if (_.first(option_range) === 2) {
      //option range sees page 2 (page 1 is not visible so manually add it)
      return [1, ...option_range, _.last(option_range) + 1];
    } else if (_.first(option_range) === 3) {
      //option range sees page 3 (page 1 and 2 not visible, manually add it)
      return [1, 2, ...option_range];
    } else if (current_page === page_count - 3) {
      //being on the forth last page manages to be short 1 option
      return [
        1,
        _.first(option_range) - 2,
        _.first(option_range) - 1,
        ...option_range,
      ];
    } else if (current_page > page_count - 3) {
      //being in the last 3 pages manages to be short 2 options
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
      //being on the 4th or 5th last page doesn't capture the ending extremities
      return [
        ...option_range,
        ..._.range(_.last(option_range) + 1, page_count + 1),
      ];
    } else {
      return option_range;
    }
  };
  const get_page_options = (page_count, current_page, option_window = 2) => {
    //depending on the sze of the options, we may have to format to ensure the correct number of options are shown
    //the if check below is where we determine if we have the correct number of options
    const raw_page_options = _.chain(
      //get numbers from current page and go left/right option_windows number of times
      //ex: if current page is 10 and option_window is 2, we get [8,9,10,11,12]
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

    //option window * 2 because we go both left and right side by option window number of times
    //+5: 1 from the current page, 2 from the ellipsis number, and 2 for the extremities
    if (page_count > option_window * 2 + 5) {
      if (raw_page_options.length === option_window * 2 + 5) {
        //correct number of options
        return raw_page_options;
      } else if (raw_page_options.length === option_window * 2 + 1) {
        //we are missing 4 options (2 ellipses and 2 extremeties)
        return [
          1,
          _.first(raw_page_options) - 1,
          ...raw_page_options,
          _.last(raw_page_options) + 1,
          page_count,
        ];
      } else {
        //handling cases for being in the extremities
        if (!_.includes(raw_page_options, 1)) {
          //if we are close to the very front, we must manually add the ellipsis value and the very last value
          return [1, _.first(raw_page_options) - 1, ...raw_page_options];
        } else if (!_.includes(raw_page_options, page_count)) {
          //same thing here except we are close to the very end
          return [
            ...raw_page_options,
            _.last(raw_page_options) + 1,
            page_count,
          ];
        }
      }
    } else {
      //not enough pages, just show all options
      return raw_page_options;
    }
  };

  const page_options = get_page_options(num_pages, current_page + 1);
  return (
    <tr className="page-selector-controls">
      <td colSpan={num_col}>
        <div style={{ padding: "10px" }}>
          <div className="row">
            <div
              className="col-12 d-flex justify-content-center"
              style={{ flexWrap: "wrap" }}
              role="tablist"
              aria-label={text_maker("table_pagination")}
            >
              {_.map(page_options, (page_num, index) => (
                <button
                  key={page_num}
                  className={`btn-ib-light${
                    (page_num - 1 === current_page && "--reversed") || ""
                  } page-selector`}
                  onClick={() => change_page(page_num - 1)}
                  aria-label={
                    _is_ellipsis(page_options, page_num, index)
                      ? page_options[index + 1] !== page_num + 1
                        ? text_maker("ellipsis_end", { page_num: page_num })
                        : text_maker("ellipsis_start", { page_num: page_num })
                      : text_maker("page", { page_num: page_num })
                  }
                  role="tab"
                  aria-selected={page_num - 1 === current_page}
                  dangerouslySetInnerHTML={{
                    __html: _is_ellipsis(page_options, page_num, index)
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

  const radio_group_name = _.uniqueId("select_page_size_");

  const dropdown_content = (
    <form className="paginate_by_dropdown">
      <ul className="list-unstyled" style={{ marginBottom: 10 }}>
        {_.map(options, ({ label, value }) => (
          <li key={value}>
            <label className={"normal-radio-btn-label"}>
              <input
                onClick={() => on_select(value)}
                type={"radio"}
                name={radio_group_name}
                checked={selected === value}
                readOnly
              />
              <span style={{ marginLeft: "3px" }}>{label}</span>
            </label>
          </li>
        ))}
      </ul>
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
