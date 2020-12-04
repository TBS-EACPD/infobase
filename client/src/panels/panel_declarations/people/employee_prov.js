import React from "react";

import d3 from "src/app_bootstrap/d3-bundle.js";
import { is_a11y_mode } from "src/app_bootstrap/globals.js";

import { Canada } from "../../../charts/canada/index.js";
import {
  formats,
  run_template,
  year_templates,
  businessConstants,
  create_text_maker_component,
  StdPanel,
  Col,
  declare_panel,
  util_components,
} from "../shared.js";

import { calculate_common_text_args } from "./calculate_common_text_args.js";

import text from "./employee_prov.yaml";

const { text_maker, TM } = create_text_maker_component(text);
const { SmartDisplayTable } = util_components;

const { people_years } = year_templates;
const years = _.map(people_years, (y) => run_template(y));
const formatter = formats["big_int_raw"];

const { provinces } = businessConstants;

const prepare_data_for_a11y_table = (data) => {
  const all_year_headcount_total = _.chain(data)
    .map((row) => d3.sum(_.values(row)))
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
        d3.sum(yearly_headcounts) / all_year_headcount_total;
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
    const { calculations, footnotes, sources, level } = this.props.render_args;

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
      <StdPanel
        title={text_maker("employee_prov_title")}
        {...{ footnotes, sources }}
      >
        <Col size={12} isText>
          <TM k={level + "_employee_prov_text"} args={text_calculations} />
        </Col>
        {!is_a11y_mode && (
          <Col size={12} isGraph>
            <Canada graph_args={panel_args} />
          </Col>
        )}
        {is_a11y_mode && (
          <Col size={12} isGraph>
            <SmartDisplayTable
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
  const max = d3.max(d3.values(_.last(data)));
  const color_scale = d3.scaleLinear().domain([0, max]).range([0.2, 1]);

  return {
    data,
    color_scale,
    years: people_years,
    formatter,
  };
};
const calculate_funcs_by_level = {
  gov: function () {
    const { orgEmployeeRegion } = this.tables;
    return calculate_common(
      people_years.map((year) => orgEmployeeRegion.prov_code(year, false))
    );
  },
  dept: function (subject) {
    const { orgEmployeeRegion } = this.tables;
    return calculate_common(
      people_years.map((year) =>
        orgEmployeeRegion.prov_code(year, subject.unique_id)
      )
    );
  },
};

export const declare_employee_prov_panel = () =>
  declare_panel({
    panel_key: "employee_prov",
    levels: ["gov", "dept"],
    panel_config_func: (level, panel_key) => ({
      depends_on: ["orgEmployeeRegion"],
      calculate: calculate_funcs_by_level[level],

      render(render_args) {
        return <ProvPanel render_args={{ ...render_args, level }} />;
      },
    }),
  });
