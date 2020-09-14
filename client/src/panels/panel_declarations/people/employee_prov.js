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

    const { info, panel_args } = calculations;
    const { data } = panel_args;

    return (
      <StdPanel
        title={text_maker("employee_prov_title")}
        {...{ footnotes, sources }}
      >
        <Col size={12} isText>
          <TM k={level + "_employee_prov_text"} args={info} />
        </Col>
        {!window.is_a11y_mode && (
          <Col size={12} isGraph>
            <Canada graph_args={panel_args} />
          </Col>
        )}
        {window.is_a11y_mode && (
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

const info_deps_by_level = {
  gov: ["orgEmployeeRegion_gov_info"],
  dept: ["orgEmployeeRegion_gov_info", "orgEmployeeRegion_dept_info"],
};

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
      info_deps: info_deps_by_level[level],
      calculate: calculate_funcs_by_level[level],

      render(render_args) {
        return <ProvPanel render_args={{ ...render_args, level }} />;
      },
    }),
  });
