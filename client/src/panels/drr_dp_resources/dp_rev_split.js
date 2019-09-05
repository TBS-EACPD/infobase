import text from './dp_rev_split.yaml';
import { GlossaryEntry } from '../../models/glossary.js';
import {
  declare_panel,
  util_components,
  years,
  run_template,
  Panel,
  create_text_maker_component,
  get_source_links,
} from "../shared.js";

const { text_maker, TM } = create_text_maker_component(text);

const { planning_years } = years;

const { Format } = util_components;

const special_cols = _.flatMap(planning_years, year => [ `${year}_gross`, `${year}_rev`, `${year}_spa`]);
const dp_cols = [...planning_years, ...special_cols];

export const declare_dp_rev_split_panel = () => declare_panel({
  panel_key: "dp_rev_split",
  levels: ["dept", "crso", "program"],
  panel_config_func: (level, panel_key) => ({
    depends_on: ['programSpending'],
    machinery_footnotes: false,
    footnotes: ["PLANNED_GROSS", "PLANNED_EXP", "PLANNED_FTE"],
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
        return {
          year: yr,
          net: _.find(year_data, ({col: yr}) ).value,
          gross: _.find(year_data, ({col}) => _.endsWith(col, "_gross")).value,
          spa: _.find(year_data, ({col}) => _.endsWith(col, "_spa")).value,
          rev: _.find(year_data, ({col}) => _.endsWith(col, "_rev")).value,
        };
      });

    },
    render({calculations, footnotes, sources}){
      const {
        graph_args: data,
        info,
      } = calculations;

      const new_footnotes = footnotes.concat([
        { text: GlossaryEntry.lookup("SPA").definition },
      ]);

      return (
        <Panel
          title={text_maker("dp_rev_split_title")}
          footnotes={new_footnotes}
          sources={sources}
        >
          <div>
            <TM k="dp_rev_split_text" args={info} />
          </div>
          <div>
            <table className="table infobase-table table-bordered">
              <thead>
                <tr>
                  <th scope="col"> <TM k="year" /> </th>
                  <th scope="col"> <TM k="dp_gross" /> </th>
                  <th scope="col"> <TM k="dp_revenue" /> </th>
                  <th style={{maxWidth: "150px"}} scope="col"> <TM k="dp_spa" /> </th>
                  <th scope="col"> <TM k="dp_net" /> </th>
                </tr>
              </thead>     
              <tbody>
                {_.map(data, ({year, gross, rev, spa, net }) => 
                  <tr key={year}>
                    <th scope="row">
                      {run_template(year)}
                    </th>
                    <td className="data-col-cell"> <Format type="compact1" content={gross} /> </td>
                    <td className="data-col-cell"> <Format type="compact1" content={rev} /> </td>
                    <td className="data-col-cell"> <Format type="compact1" content={spa} /> </td>
                    <td className="data-col-cell"> <Format type="compact1" content={net} /> </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
        </Panel>
      );
    },
  }),
});


