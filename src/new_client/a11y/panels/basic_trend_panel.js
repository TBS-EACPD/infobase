import gql from 'graphql-tag';
import { Panel } from '../../panel-components.js';
import { Year, Format } from '../../../util_components.js';


const MoneyFormat = ({ amt }) => <Format type="compact_written" content={amt} />;
const FTEFormat = ({ amt }) => <Format type="big_int_real" content={amt} />;
const PctFormat = ({ amt }) => <Format type="percentage1" content={amt} />;

const Component = ({ data: { tabular_data, spend_info, fte_info } }) => (
  <Panel title="Spending and Employment Trend">
    
    <table className="table">
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
            <td> <Year y={year} /> </td>
            <td> <MoneyFormat amt={spend} /> </td>
            <td> <FTEFormat amt={fte} /> </td>
          </tr>
        )}
      </tbody>
    </table>

    <table className="table">
      <thead>
        <tr>
          <th></th>
          <th scope="col"> Spending </th>
          <th scope="col"> Employment (FTEs) </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row"> Average spending (historical and planned) </th>
          <td> <MoneyFormat amt={spend_info.avg_all} /> </td>
          <td> <FTEFormat amt={fte_info.avg_all} /> </td>
        </tr>
        <tr>
          <th scope="row"> historical growth (2012-13 to 2016-17) </th>
          <td> <PctFormat amt={spend_info.historical_change_pct} /> </td>
          <td> <PctFormat amt={fte_info.historical_change_pct} /> </td>
        </tr>
        <tr>
          <th scope="row"> planned growth (2016-17 to 2019-20) </th>
          <td> <PctFormat amt={spend_info.planned_change_pct} /> </td>
          <td> <PctFormat amt={fte_info.planned_change_pct} /> </td>
        </tr>
      </tbody>
    </table>

  </Panel>
);






const subject_fragment = gql`
fragment basic_resources_trend on SubjectWithBasicResources {
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
    spend_info: basic_spend_trend {
      historical_change_pct
      planned_change_pct
      avg_all
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
    fte_info: basic_fte_trend {
      historical_change_pct
      planned_change_pct
      avg_all
    }
  }
}
`

const org_query = gql`
  query($lang: String!, $id: String!) {
    root(lang: $lang){
      org(org_id:$id){
        ...basic_resources_trend
      }
    }
  }
  ${subject_fragment}
`;


const gov_query = gql`
  query($lang: String!) {
    root(lang: $lang){
      gov {
        ...basic_resources_trend
      }
    }
  }
  ${subject_fragment}
`;


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

function data_to_props({ root }, level){

  const fields = (
    level === 'org' ? 
    root.org :
    root.gov
  );

  const {
    program_spending_data: {
      annual_spend_totals,
      spend_info,
    },
    program_fte_data: {
      annual_fte_totals,
      fte_info,
    },
  } = fields;

  const tabular_data = _.map(sorted_years, year => ({ 
    year,
    spend: annual_spend_totals[year],
    fte: annual_fte_totals[year],
  }));

  return {
    tabular_data,
    spend_info,
    fte_info,
  };  


}

export default {
  levels: [ "gov", "org" ],
  key: "basic_trend",
  query: {
    org: org_query,
    gov: gov_query,
  },
  component: Component,
  data_to_props, //we don't use the data at this layer, we just take advantage of the side-effect for cache to be pre-loaded
};