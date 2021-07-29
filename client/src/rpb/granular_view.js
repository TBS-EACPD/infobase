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

import { TextMaker, text_maker } from "./rpb_text_provider";
import { ReportDetails, ReportDatasets } from "./shared";

class GranularView extends React.Component {
  render() {
    console.log("\n*** GranularView - RENDER ***");
    console.log(this.props);
    console.log(this.state);
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
      columns: data_columns,
      flat_data,
      sorted_key_columns,

      on_set_dimension,
      dimension,
      dimensions,
    } = this.props;

    const non_dept_key_cols = _.reject(sorted_key_columns, { nick: "dept" });

    const cols = [...non_dept_key_cols, ...data_columns];
    const is_matched_undefined = (column_collection, nick) =>
      _.isUndefined(_.find(column_collection, (col) => col.nick === nick));

    const dim_all_or_dept = dimension === "all" || dimension === "dept";

    const dept_and_legal_cols = dim_all_or_dept
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
              header: fully_qualified_name,
              is_searchable:
                is_searchable && !is_matched_undefined(non_dept_key_cols, nick),
              is_summable:
                is_summable && !is_matched_undefined(data_columns, nick),
              formatter: nick === "dept" ? "wide-str" : type,
            },
          ]
        )
        .fromPairs()
        .value(),
    };

    const table_data = dim_all_or_dept
      ? _.map(flat_data, (row) => {
          const org = Dept.store.lookup(row.dept);
          return {
            dept: org.name,
            legal_title: org.legal_title ? org.legal_title : org.name,
            ..._.chain(cols)
              .map(({ nick }) => [nick, row[nick]])
              .fromPairs()
              .value(),
          };
        })
      : flat_data;

    const dropdown_content = (
      <div className="group_filter_dropdown">
        {_.map(dimensions, (dim) => (
          <div style={{ marginBottom: 10 }} key={`${dim}-div`}>
            <div>
              <input
                type={"radio"}
                id={dim}
                name={"rpb_group_filter"}
                key={dim}
                onClick={() => {
                  on_set_dimension({
                    dimension: dim,
                  });
                }}
                defaultChecked={dim === dimension}
              />
              <label
                htmlFor={dim}
                className={"normal-radio-btn-label"}
                key={`${dim}-radio-btn-label`}
              >
                {/* TODO: not sure why text_maker doesn't work for some of them */}
                {/* {text_maker(dim)} */}
                {dim}
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
      />
    );
  }
}

export { GranularView };
