import gql from 'graphql-tag';
import { Panel } from '../../panel-components.js';
import { Year, Format } from '../../../util_components.js';

//TODO: extract this to a common place, along with other year constants and helpers
const sorted_years = [
  "pa_last_year_5",
  "pa_last_year_4",
  "pa_last_year_3",
  "pa_last_year_2",
  'pa_last_year',
];

const MoneyFormat = ({ amt }) => <Format type="compact_written" content={amt} />;
const PctFormat = ({ amt }) => <Format type="percentage1" content={amt} />;

const Component = ({ data: { tp_data, historical_tp_exp_by_type } }) => (
  <Panel title="Transfer Payments (2016-17)">
    <section>
      <header> Historical Transfer Payment Expenditure by type </header>
      <table className="table">
        <thead>
          <tr>
            <td> Year </td>
            <td> Type </td>
            <td> Amount </td>
            <td> Proportion </td>
          </tr>
        </thead>
        <tbody>
          {_.map(historical_tp_exp_by_type, ({ year, type, exp, pct}) => 
            <tr>
              <td> <Year y={year} /> </td>
              <td> {type} </td>
              <td> <MoneyFormat amt={exp} /> </td>
              <td> <PctFormat amt={pct} /> </td>
            </tr>
          )}
        </tbody>
      </table>  
    </section>

    <section>
      <header> <Year y="pa_last_year" /> transfer payments </header>
      <table className="table">
        <thead>
          <tr>
            <th scope="col"> Payment Name </th>
            <th scope="col"> Type of Payment </th>
            <th scope="col"> Authority </th>
            <th scope="col"> Expenditure </th>
            <th scope="col"> Proportion of total </th>
          </tr>
        </thead>
        <tbody>
          {_.map(tp_data, ({type, name, auth, exp, pct }) =>
            <tr key={name}>
              <td> {name} </td>
              <td> {type} </td>
              <td> <MoneyFormat amt={auth} /> </td>
              <td> <MoneyFormat amt={exp} /> </td>
              <td> <PctFormat amt={pct} /> </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  </Panel>
);






const query = gql`
query TPQueryA11Y ($lang: String!, $id: String!){
  root(lang: $lang){
    org(org_id:$id){
      transfer_payments_data {
        collapsed {
          type
          year
          exp
        }
        data(year: pa_last_year) {
          type
          name
          auth
          exp
        }
      }
    }
  }
}
`;


function data_to_props({ root: { org } }, level){

  const data = _.get(org,"transfer_payments_data.data");
  const type_data = _.get(org, "transfer_payments_data.collapsed");

  const total = _.sumBy(data, 'exp');

  const tp_data = _.chain(data)
    .map(({ type, name, auth, exp, year }) => ({
      type,
      name,
      auth,
      exp,
      pct: exp/total,
    }))
    .sortBy('exp')
    .reverse()
    .value();

  const totals_by_year = _.chain(type_data)
    .groupBy('year')
    .map((group,year) => [ year, _.sumBy(group, 'exp') ] )
    .fromPairs()
    .value();    

  const historical_tp_exp_by_type = _.chain(type_data)
    .sortBy(
      ({year}) => _.indexOf(sorted_years, year), 
      'type'
    )
    .map( ({ year, exp, type }) => ({
      year,
      type,
      exp,
      pct: exp/totals_by_year[year],
    }))
    .value();

  return {
    tp_data,
    historical_tp_exp_by_type,
  };

}

export default {
  levels: [ "org" ],
  key: "transfer_payments",
  query,
  component: Component,
  data_to_props, //we don't use the data at this layer, we just take advantage of the side-effect for cache to be pre-loaded
};