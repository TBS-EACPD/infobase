import './dp_rev_split.ib.yaml';

import {
  reactAdapter,
  PanelGraph,
  util_components,
  years,
  run_template,
} from "../shared";

const { planning_years } = years;

const { 
  Format,
  TM,
} = util_components;

const special_cols = _.flatMap(planning_years, year => [ `${year}_gross`, `${year}_rev`, `${year}_spa`]);
const dp_cols = [...planning_years, ...special_cols];

_.each(["dept","crso","program"], level => {

  new PanelGraph({
    level,
    key: 'dp_rev_split',
    depends_on :  ['table6'],
    layout: {
      full: {graph: 12},       
    },
    machinery_footnotes : false,
    title :"dp_rev_split_title",
    text : "dp_rev_split_text",
    calculate(subject,info){
      const { table6 } = this.tables;
      const q = table6.q(subject);

      const data = _.map(dp_cols, col => ({
        col,
        value: q.sum(col),
      }));

      const has_special_vals = _.chain(special_cols)
        .map(col => _.find(data, {col}).value )  
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
        }
      });

    },
    render(panel, calculations){
      const {
        subject,
        graph_args: data,
      } = calculations;

      const { graph_area } = panel.areas();

      reactAdapter.render(
        <div>
          <table>
            <thead>
              <tr>
                <th scope="col"> <TM k="year" /> </th>
                <th scope="col"> <TM k="dp_gross" /> </th>
                <th scope="col"> <TM k="dp_revenue" /> </th>
                <th scope="col"> <TM k="dp_spa" /> </th>
                <th scope="col"> <TM k="dp_net" /> </th>
              </tr>
            </thead>     
            <tbody>
              {_.map(data, ({year, gross, rev, spa, net }) => 
                <tr key={year}>
                  <th scope="row">
                    {run_template(year)}
                  </th>
                  <td> <Format type="compact2" content={gross} /> </td>
                  <td> <Format type="compact2" content={rev} /> </td>
                  <td> <Format type="compact2" content={spa} /> </td>
                  <td> <Format type="compact2" content={net} /> </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>,
        graph_area.node()
      );
      

    },
  });
})


