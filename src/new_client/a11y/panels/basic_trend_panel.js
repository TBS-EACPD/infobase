import gql from 'graphql-tag';
import { Panel } from '../../panel-components.js';

const Component = ({ data: { tabular_data } }) => (
  <Panel title="Spending and Employment Trend">
    
    <table>
      <thead>
        <tr>
          <th scope="col"> Fiscal Year </th>
          <th scope="col"> Spending </th>
          <th scope="col"> Employment (FTEs) </th>
        </tr>
      </thead>
      <tbody>
        {_.map(tabular_data, ({year, fte, spend}) =>
          <tr key={year}>
            <td> { year } </td>
            <td> { spend } </td>
            <td> { fte } </td>
          </tr>
        )}
      </tbody>
    </table>

  </Panel>
);







const query = gql`
  query($lang: String!, $id: String!) {
    root(lang: $lang){
      org(org_id:$id){
        program_spending_data {
          annual_spend_totals: basic_spend_trend{
            pa_last_year: pa_last_year_exp
            pa_last_year_2: pa_last_year_2_exp
            pa_last_year_3: pa_last_year_3_exp
            pa_last_year_4: pa_last_year_4_exp
            pa_last_year_5: pa_last_year_5_exp
            
            planning_year_1
            planning_year_2
            planning_year_3
          }
        }
        program_fte_data {
          annual_fte_totals: basic_fte_trend {
            pa_last_year
            pa_last_year_2
            pa_last_year_3
            pa_last_year_4
            pa_last_year_5
            
            planning_year_1
            planning_year_2
            planning_year_3
          }
        }
      }
    }
  }
`


//TODO: extract this to a common place, along with other year constants and helpers
const sorted_years = [
  "pa_last_year_5",
  "pa_last_year_4",
  "pa_last_year_3",
  "pa_last_year_2",
  'pa_last_year',

  'planning_year_1',
  'planning_year_2',
  'planning_year_3',
];

function data_to_props({ root: { org: {
  program_spending_data: {
    annual_spend_totals,
  },
  program_fte_data: {
    annual_fte_totals,
  },
}}}){


  const tabular_data = _.map(sorted_years, year => ({ 
    year,
    spend: annual_spend_totals[year],
    fte: annual_fte_totals[year],
  }));

  return {
    tabular_data,
  }


}

export default {
  key: "basic_trend",
  query,
  component: Component,
  data_to_props, //we don't use the data at this layer, we just take advantage of the side-effect for cache to be pre-loaded
};