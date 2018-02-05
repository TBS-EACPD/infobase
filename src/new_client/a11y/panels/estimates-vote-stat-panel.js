import gql from 'graphql-tag';
import { Panel } from '../../panel-components.js';
import { Year, Format } from '../../../util_components.js';


//TODO: extract this to a common place, along with other year constants and helpers
const sorted_estimates_years = [
  "est_in_year",
  "est_last_year",
  "est_last_year_2",
  "est_last_year_3",
];

const MoneyFormat = ({ amt }) => <Format type="compact_written" content={amt} />;
const PctFormat = ({ amt }) => <Format type="percentage1" content={amt} />;

const Component = ({ data: { yearly_totals, vote_stat_items } }) => (
  <Panel title="Estimates">

    <section>
      <header> Annual totals </header>
      <table className="table">
        <thead>
          <tr>
            <th scope="col"> Fiscal Year </th>
            <th scope="col"> Authorities </th>
          </tr>
        </thead>
        <tbody>
          {_.map(yearly_totals, ({year, amount }) =>
            <tr key={year}>
              <td> <Year y={year} /> </td>
              <td> <MoneyFormat amt={amount} /> </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>

    <section style={{maxHeight: "400px", overflow: "auto"}}>
      <header>  detailed voted and statutory items (<Year y="pa_last_year" />) </header>
      <table className="table">
        <thead>
          <tr>
            <th scope="col"> Vote Number </th>
            <th scope="col"> Estimates Mechanism </th>
            <th scope="col"> Item </th>
            <th scope="col"> Authority </th>
            <th scope="col"> Proportion of Authorities </th>
          </tr>
        </thead>
        <tbody>
          {_.map(vote_stat_items, ({ auth, amount, name, vote_num, pct, doc }) =>
            <tr key={`${name}-${vote_num}`}>
              <td>
                <strong>{vote_num}</strong>
              </td>
              <td>
                <strong>{doc}</strong>
              </td>
              <td>
                {name}
              </td>
              <td>
                <MoneyFormat amt={amount} />
              </td>
              <td>
                <PctFormat amt={pct} />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>


  </Panel>
);






const query = gql`
query EstimatesVoteStatOrgA11YQuery ($lang: String!, $id: String!){
  root(lang: $lang){
    org(org_id:$id){
      estimates_vote_stat {
        data(year:est_in_year ) {
          amount
          vote_num
          vs_type
          name
          doc
        }
        info {
          yearly_totals {
            amount
            year
          }
        }
      }
    }
  }
}`;


function data_to_props({ root: { org : { estimates_vote_stat } } }, level){

  let { 
    data: vote_stat_items,
    info: {
      yearly_totals,
    },
  } = estimates_vote_stat;



  const total_last_year = _.sumBy(vote_stat_items, 'amount');

  vote_stat_items = _.chain(vote_stat_items)
    .sortBy('amount')
    .reverse()
    .map( record => _.immutate(record, {
      pct: record.amount/total_last_year,
    }))
    .value();

  return {
    yearly_totals: _.sortBy(yearly_totals, ({year}) => _.indexOf(sorted_estimates_years, year)),
    vote_stat_items,
  };

}

export default {
  levels: [ "org" ],
  key: "estimates_vote_stat",
  query,
  component: Component,
  data_to_props, //we don't use the data at this layer, we just take advantage of the side-effect for cache to be pre-loaded
};