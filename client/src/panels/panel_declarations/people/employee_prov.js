import { sum } from "d3-array";
import { scaleLinear } from "d3-scale";
import _ from "lodash";
import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils";
import { StdPanel, Col } from "src/panels/panel_declarations/InfographicPanel";

import {
  create_text_maker_component,
  DisplayTable,
} from "src/components/index";

import { businessConstants } from "src/models/businessConstants";
import { run_template } from "src/models/text";

import { year_templates } from "src/models/years";

import { formats } from "src/core/format";

import { is_a11y_mode } from "src/core/injected_build_constants";

import { Canada } from "src/charts/canada/index";

import { calculate_common_text_args } from "./calculate_common_text_args";

import text from "./employee_prov.yaml";

const { text_maker, TM } = create_text_maker_component(text);
const { people_years } = year_templates;
const years = _.map(people_years, (y) => run_template(y));
const formatter = formats["big_int_raw"];

const { provinces } = businessConstants;

const prepare_data_for_a11y_table = (data) => {
  const all_year_headcount_total = _.chain(data)
    .map((row) => sum(_.values(row)))
    .reduce((sum, value) => sum + value, 0)
    .value();
  const table_data = _.chain(provinces)
    .map((val, key) => ({ key, label: val.text }))
    .reject(({ key }) => _.includes(["qclessncr", "onlessncr"], key))
    .map((province) => {
      const yearly_headcounts = _.map(data, (row) => row[province.key]);
      const zipped_data = _.chain(years)
        .zip(yearly_headcounts)
        .fromPairs()
        .value();
      const five_year_avg_share =
        sum(yearly_headcounts) / all_year_headcount_total;
      return (
        five_year_avg_share !== 0 && {
          label: province.label,
          five_year_avg_share,
          ...zipped_data,
        }
      );
    })
    .filter()
    .value();
  return table_data;
};

class ProvPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      prov: "Canada",
    };
  }
  render() {
    const { title, calculations, footnotes, sources, subject_type } =
      this.props.render_args;

    const { panel_args, subject } = calculations;
    const { data } = panel_args;

    const employees_by_year = _.map(data, (year) =>
      _.chain(year).values().sum().value()
    );

    const first_active_year_index = _.findIndex(
      employees_by_year,
      (employees) => employees !== 0
    );

    const last_active_year_index = _.findLastIndex(
      employees_by_year,
      (employees) => employees !== 0
    );

    const duration = last_active_year_index - first_active_year_index + 1;

    const pre_formatted_data = _.reduce(
      data,
      (result, year) => {
        if (_.isEmpty(result)) {
          return _.map(year, (region_value, region) => ({
            label: region,
            data: [region_value],
          }));
        }
        return _.map(result, (region) => ({
          label: region.label,
          data: [...region.data, year[region.label]],
        }));
      },
      []
    );

    const formatted_data = _.map(pre_formatted_data, (region) => ({
      ...region,
      five_year_percent:
        _.sum(region.data) / duration / (_.sum(employees_by_year) / duration),
    }));

    const common_text_args = calculate_common_text_args(formatted_data);

    const text_calculations = {
      ...common_text_args,
      subject,
      top_avg_group: provinces[common_text_args.top_avg_group].text,
    };

    return (
      <StdPanel {...{ title, footnotes, sources }}>
        <Col size={12} isText>
          <TM
            k={subject_type + "_employee_prov_text"}
            args={text_calculations}
          />
        </Col>
        {!is_a11y_mode && (
          <Col size={12} isGraph>
            <Canada graph_args={panel_args} />
          </Col>
        )}
        {is_a11y_mode && (
          <Col size={12} isGraph>
            <DisplayTable
              column_configs={{
                label: {
                  index: 0,
                  header: text_maker("prov"),
                  is_searchable: true,
                },
                five_year_avg_share: {
                  index: years.length + 1,
                  header: text_maker("five_year_percent_header"),
                  formatter: "percentage1",
                },
                ..._.chain(years)
                  .map((year, idx) => [
                    year,
                    {
                      index: idx + 1,
                      header: year,
                      formatter: "big_int",
                    },
                  ])
                  .fromPairs()
                  .value(),
              }}
              data={prepare_data_for_a11y_table(data)}
            />
          </Col>
        )}
      </StdPanel>
    );
  }
}

const calculate_common = (data) => {
  const max = _.chain(data).last().values().max().value();
  const color_scale = scaleLinear().domain([0, max]).range([0.2, 1]);

  return {
    data,
    color_scale,
    years: people_years,
    formatter,
  };
};
const calculate_funcs_by_subject_type = {
  gov: function () {
    const { orgEmployeeRegion } = this.tables;
    return calculate_common(
      people_years.map((year) =>
        orgEmployeeRegion.sum_cols_by_grouped_data(year, "region_code")
      )
    );
  },
  dept: function (subject) {
    const { orgEmployeeRegion } = this.tables;
    return calculate_common(
      people_years.map((year) =>
        orgEmployeeRegion.sum_cols_by_grouped_data(year, "region_code", subject)
      )
    );
  },
};

export const declare_employee_prov_panel = () =>
  declare_panel({
    panel_key: "employee_prov",
    subject_types: ["gov", "dept"],
    panel_config_func: (subject_type) => ({
      table_dependencies: ["orgEmployeeRegion"],
      calculate: calculate_funcs_by_subject_type[subject_type],
      title: text_maker("employee_prov_title"),
      render(render_args) {
        return <ProvPanel render_args={{ ...render_args, subject_type }} />;
      },
    }),
  });
