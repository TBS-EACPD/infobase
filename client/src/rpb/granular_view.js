import _ from "lodash";
import React from "react";

import {
  LabeledBox,
  AlertBanner,
  DisplayTable,
  Details,
  DropdownMenu,
} from "src/components/index";

import { Dept } from "src/models/subjects";

import { lang } from "src/core/injected_build_constants";

import { TextMaker, text_maker } from "./rpb_text_provider";
import { ReportDetails, ReportDatasets } from "./shared";

class GranularView extends React.Component {
  render() {
    const { subject, table } = this.props;
    return (
      <div>
        <LabeledBox
          label={
            <TextMaker
              text_key="rpb_report_details"
              args={{ table_name: table.name }}
            />
          }
        >
          <Details
            summary_content={
              <div>
                {table.title} : {subject.name}
              </div>
            }
            content={<ReportDetails {...this.props} />}
          />
        </LabeledBox>
        <LabeledBox label={<TextMaker text_key="rpb_report_data_sources" />}>
          <ReportDatasets {...this.props} />
        </LabeledBox>

        {table.rpb_banner && <AlertBanner>{table.rpb_banner}</AlertBanner>}
        <div
          role="main"
          aria-label={text_maker("main_rpb_content")}
          id="rpb-main-content"
        >
          {this.get_table_content()}
        </div>
      </div>
    );
  }

  get_table_content() {
    const {
      table,
      columns: data_columns,
      flat_data,
      sorted_key_columns,

      on_set_grouping,
      grouping,
      groupings,
    } = this.props;

    const non_dept_key_cols = _.reject(sorted_key_columns, { nick: "dept" });
    const dropdown_filterable_cols = _.reject(
      sorted_key_columns,
      ({ nick }) =>
        nick === "dept" || nick === "prgm" || nick === "desc" || nick === "tp"
    );

    const cols = [...non_dept_key_cols, ...data_columns];
    const is_matched_undefined = (column_collection, nick) =>
      _.isUndefined(_.find(column_collection, (col) => col.nick === nick));

    const grouping_default_or_dept =
      grouping === "default" || grouping === "dept";

    const dept_and_legal_cols = grouping_default_or_dept
      ? {
          dept: {
            index: 0,
            header: text_maker("org"),
            is_searchable: true,
            formatter: "wide-str",
            visibility_toggleable: true,
          },
          legal_title: {
            index: 1,
            header: text_maker("org_legal_title"),
            is_searchable: true,
            formatter: "wide-str",
            initial_visible: false,
          },
        }
      : {};

    const column_configs = {
      ...dept_and_legal_cols,
      ..._.chain(cols)
        .filter((col) => _.has(flat_data[0], col.nick))
        .map(
          (
            {
              nick,
              type,
              fully_qualified_name,
              is_searchable = true,
              is_summable = true,
            },
            idx
          ) => [
            nick,
            {
              index: idx + 2,
              header: table.get_col_header(
                {
                  nick,
                  fully_qualified_name,
                },
                grouping
              ),
              is_searchable:
                is_searchable && !is_matched_undefined(non_dept_key_cols, nick),
              is_summable:
                is_summable && !is_matched_undefined(data_columns, nick),
              show_dropdown_filter:
                is_searchable && !is_matched_undefined(non_dept_key_cols, nick),
              formatter: type,
            },
          ]
        )
        .fromPairs()
        .value(),
    };

    const table_data = grouping_default_or_dept
      ? _.map(flat_data, (row) => {
          const org = Dept.store.lookup(row.dept);
          return {
            dept: org.name,
            legal_title: org.legal_title ? org.legal_title : org.name,
            ..._.chain(cols)
              .filter((col) => _.has(row, col.nick))
              .map(({ nick }) => [nick, row[nick]])
              .fromPairs()
              .value(),
          };
        })
      : flat_data;

    const dropdown_content = (
      <div className="group_filter_dropdown">
        {_.map(groupings, (current_grouping) => (
          <div style={{ marginBottom: 10 }} key={`${current_grouping}-div`}>
            <div>
              <input
                type={"radio"}
                id={current_grouping}
                name={"rpb_group_filter"}
                key={current_grouping}
                onClick={() => {
                  on_set_grouping({
                    grouping: current_grouping,
                  });
                }}
                defaultChecked={current_grouping === grouping}
              />
              <label
                htmlFor={current_grouping}
                className={"normal-radio-btn-label"}
                key={`${current_grouping}-radio-btn-label`}
              >
                {current_grouping === "default" ||
                !_.find(sorted_key_columns, ["nick", current_grouping])
                  ? text_maker(current_grouping)
                  : current_grouping === "dept"
                  ? text_maker("org")
                  : _.find(sorted_key_columns, ["nick", current_grouping])
                      .header[lang] ||
                    _.find(sorted_key_columns, ["nick", current_grouping])
                      .header["en"]}
              </label>
            </div>
          </div>
        ))}
      </div>
    );

    const display_table_custom_util = {
      rpb_group_data: (
        <DropdownMenu
          opened_button_class_name={"btn-ib-light--reversed"}
          closed_button_class_name={"btn-ib-light"}
          key={"rpb_group_data"}
          button_description={text_maker("group_data")}
          dropdown_trigger_txt={`${text_maker("group_by")}`}
          dropdown_content={dropdown_content}
        />
      ),
    };

    return (
      <DisplayTable
        data={table_data}
        column_configs={column_configs}
        util_components={display_table_custom_util}
        unsorted_initial={true}
      />
    );
  }
}

export { GranularView };
