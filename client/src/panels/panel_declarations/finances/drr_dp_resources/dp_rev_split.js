import text from './dp_rev_split.yaml';
import {
  util_components,
  year_templates,
  run_template,
  InfographicPanel,
  create_text_maker_component,
  get_source_links,

  declare_panel,
} from "../../shared.js";

const { text_maker } = create_text_maker_component(text);

const { planning_years } = year_templates;

const { Format, DisplayTable } = util_components;

const special_cols = _.flatMap(planning_years, year => [ `${year}_gross`, `${year}_rev`, `${year}_spa`]);
const dp_cols = [...planning_years, ...special_cols];

export const declare_dp_rev_split_panel = () => declare_panel({
  panel_key: "dp_rev_split",
  levels: ["dept", "crso", "program"],
  panel_config_func: (level, panel_key) => ({
    depends_on: ['programSpending'],
    machinery_footnotes: false,
    footnotes: ["PLANNED_GROSS", "PLANNED_EXP", "PLANNED_FTE"],
    glossary_keys: ["SPA"],
    source: (subject) => get_source_links(["DP"]),
    calculate(subject,info){
      const { programSpending } = this.tables;
      const q = programSpending.q(subject);

      const data = _.map(dp_cols, col => ({
        col,
        value: q.sum(col),
      }));

      const has_special_vals = _.chain(data)
        .filter( ({col}) => _.endsWith(col, "spa") || _.endsWith(col, "rev") )
        .map('value')
        .some()
        .value();

      if(!has_special_vals){
        return false;
      }
      const find_year_data_ends_with =
        (year_data, end_str) => _.find( year_data, ({col}) => _.endsWith(col, end_str) ).value;
      
      const table_data = _.map(planning_years, yr => {
        const year_data = _.filter(data, ({col}) => _.startsWith(col,yr));
        return {
          year: run_template(yr),
          net: _.find(year_data, ({col: yr}) ).value,
          gross: find_year_data_ends_with(year_data, "_gross"),
          spa: find_year_data_ends_with(year_data, "_spa"),
          rev: find_year_data_ends_with(year_data, "_rev"),
        };
      });
      const amt_type = window.is_a11y_mode ? "compact1_written" : "compact1";
      const column_configs = {
        year: {
          index: 0,
          header: text_maker("year"),
          formatter: (value) => <span style={{fontWeight: 'bold'}}> {value} </span>,
        },
        net: {
          index: 1,
          header: text_maker("dp_gross"),
          is_summable: true,
          formatter: amt_type,
        },
        gross: {
          index: 2,
          header: text_maker("dp_revenue"),
          is_summable: true,
          formatter: amt_type,
        },
        spa: {
          index: 3,
          header: text_maker("dp_spa"),
          is_summable: true,
          formatter: amt_type,
        },
        rev: {
          index: 4,
          header: text_maker("dp_net"),
          is_summable: true,
          formatter: amt_type,
        },
      };

      return {
        table_data,
        column_configs,
      };

    },
    render({calculations, footnotes, sources, glossary_keys}){
      const { panel_args } = calculations;
      const {
        table_data,
        column_configs,
      } = panel_args;

      return (
        <InfographicPanel
          title={text_maker("dp_rev_split_title")}
          {...{footnotes, sources, glossary_keys}}
        >
          <DisplayTable
            table_name={text_maker("dp_rev_split_title")}
            data={table_data}
            column_configs={column_configs}
          />
        </InfographicPanel>
      );
    },
  }),
});


