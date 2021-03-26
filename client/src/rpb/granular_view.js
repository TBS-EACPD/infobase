import _ from "lodash";
import React from "react";

import { fetchServices } from "src/models/populate_services.js";

import {
  LabeledBox,
  AlertBanner,
  SmartDisplayTable,
  Details,
  DropdownMenu,
  SpinnerWrapper,
} from "../components/index.js";
import { Subject } from "../models/subject.js";

import { TextMaker, text_maker } from "./rpb_text_provider.js";
import { ReportDetails, ReportDatasets } from "./shared.js";

const { Dept } = Subject;

const TableContent = ({ props }) => {
  const {
    columns: data_columns,
    subject,
    flat_data,
    sorted_key_columns,

    on_set_filter,
    filters_by_dimension,
    dimension,
    filter,
    table,
  } = props;

  const non_dept_key_cols = _.reject(sorted_key_columns, { nick: "dept" });

  const cols = [...non_dept_key_cols, ...data_columns];

  const { data, loading } = (() => {
    if (table.is_graphql_only) {
      const res = fetchServices({
        id: subject.id,
      });
      const processed_data = _.map(res.data, (row) => {
        const org = Dept.lookup(row.org_id);
        return {
          ...row,
          dept: org.name,
          legal_title: org.legal_title ? org.legal_title : org.name,
        };
      });
      return { ...res, data: processed_data };
    } else {
      return {
        data: _.map(flat_data, (row) => {
          const org = Dept.lookup(row.dept);
          return {
            dept: org.name,
            legal_title: org.legal_title ? org.legal_title : org.name,
            ..._.chain(cols)
              .map(({ nick }) => [nick, row[nick]])
              .fromPairs()
              .value(),
          };
        }),
      };
    }
  })();
  if (loading) {
    return <SpinnerWrapper config_name="sub_route" />;
  }

  const is_matched_undefined = (column_collection, nick) =>
    _.isUndefined(_.find(column_collection, (col) => col.nick === nick));

  const column_configs = {
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
    ..._.chain(cols)
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
            formatter: type,
          },
        ]
      )
      .fromPairs()
      .value(),
  };

  const group_filter_options = _.map(filters_by_dimension, (filter_by_dim) => ({
    ...filter_by_dim,
    children: _.sortBy(filter_by_dim.children, "display"),
  }));
  const dropdown_content = (
    <div className="group_filter_dropdown">
      {_.map(group_filter_options, (group) => (
        <div style={{ marginBottom: 10 }} key={group.id}>
          <span key={group.id} style={{ fontWeight: 700 }}>
            {group.display}
          </span>
          {_.map(group.children, (child) => (
            <div key={`${group.id}_${child.filter}__${child.dimension}`}>
              <input
                type={"radio"}
                id={`${child.filter}__${child.dimension}`}
                name={"rpb_group_filter"}
                key={`${child.filter}__${child.dimension}`}
                onClick={() => {
                  on_set_filter({
                    filter: child.filter,
                    dimension: child.dimension,
                  });
                }}
                defaultChecked={
                  child.filter === filter && child.dimension === dimension
                }
              />
              <label
                htmlFor={`${child.filter}__${child.dimension}`}
                className={"normal-radio-btn-label"}
                key={child.display}
              >
                {child.display}
              </label>
            </div>
          ))}
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
    <SmartDisplayTable
      data={data}
      column_configs={column_configs}
      util_components={display_table_custom_util}
    />
  );
};

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
          <TableContent props={this.props} />
        </div>
      </div>
    );
  }
}

export { GranularView };
