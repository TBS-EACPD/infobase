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

      return _.map(planning_years, yr => {
        const year_data = _.filter(data, ({col}) => _.startsWith(col,yr));
        const sort_values = {
          year: run_template(yr),
          net: _.find(year_data, ({col: yr}) ).value,
          gross: _.find(year_data, ({col}) => _.endsWith(col, "_gross")).value,
          spa: _.find(year_data, ({col}) => _.endsWith(col, "_spa")).value,
          rev: _.find(year_data, ({col}) => _.endsWith(col, "_rev")).value,
        };
        const display_values = {
          year: <span style={{fontWeight: 'bold'}}>{sort_values.year}</span>,
          net: <Format type={window.is_a11y_mode ? "compact1_written" : "compact1"} content={sort_values.net} />,
          gross: <Format type={window.is_a11y_mode ? "compact1_written" : "compact1"} content={sort_values.gross} />,
          spa: <Format type={window.is_a11y_mode ? "compact1_written" : "compact1"} content={sort_values.spa} />,
          rev: <Format type={window.is_a11y_mode ? "compact1_written" : "compact1"} content={sort_values.rev} />,
        };
        return {
          display_values: display_values,
          sort_values: sort_values,
        };
      });

    },
    render({calculations, footnotes, sources, glossary_keys}){
      const {
        panel_args: data,
      } = calculations;

      const column_names = {
        year: text_maker("year"),
        net: text_maker("dp_gross"),
        gross: text_maker("dp_revenue"),
        spa: text_maker("dp_spa"),
        rev: text_maker("dp_net"),
      };

      return (
        <InfographicPanel
          title={text_maker("dp_rev_split_title")}
          {...{footnotes, sources, glossary_keys}}
        >
          <DisplayTable
            table_name={text_maker("dp_rev_split_title")}
            rows={data}
            column_names={column_names}
            ordered_column_keys={_.keys(column_names)}
          />
        </InfographicPanel>
      );
    },
  }),
});


