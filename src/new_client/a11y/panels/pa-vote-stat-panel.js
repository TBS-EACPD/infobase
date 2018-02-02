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

const Component = ({ data: { yearly_totals, vote_stat_items } }) => (
  <Panel title="Authorities and Expenditures">
    

    <section>
      <header> Annual totals </header>
      <table className="table">
        <thead>
          <tr>
            <th scope="col"> Fiscal Year </th>
            <th scope="col"> Authorities </th>
            <th scope="col"> Expenditures </th>
            <th scope="col"> Unused Authorities </th>
            <th scope="col"> Portion of unused authorities </th>
          </tr>
        </thead>
        <tbody>
          {_.map(yearly_totals, ({year, auth, exp, lapse, lapse_pct }) =>
            <tr key={year}>
              <td> <Year y={year} /> </td>
              <td> <MoneyFormat amt={auth} /> </td>
              <td> <MoneyFormat amt={exp} /> </td>
              <td> <MoneyFormat amt={lapse} /> </td>
              <td> <PctFormat amt={lapse_pct} /> </td>
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
            <th scope="col"> Item </th>
            <th scope="col"> Authority </th>
            <th scope="col"> Expenditure </th>
            <th scope="col"> Proportion of expenditures </th>
          </tr>
        </thead>
        <tbody>
          {_.map(vote_stat_items, ({ auth, exp, name, vote_num, exp_pct }) =>
            <tr key={`${name}-${vote_num}`}>
              <td>
                <strong>{vote_num}</strong>
              </td>
              <td>
                {name}
              </td>
              <td>
                <MoneyFormat amt={auth} />
              </td>
              <td>
                <MoneyFormat amt={exp} />
              </td>
              <td>
                <PctFormat amt={exp_pct} />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>


  </Panel>
);






const query = gql`
query PaVoteStatOrgqQuery ($lang: String!, $id: String!){
  root(lang: $lang){
    org(org_id:$id){
      pa_vote_stat {
        data(year: pa_last_year) {
          auth
          exp
          vote_num
          vs_type
          name
        }
        info {
          yearly_totals {
            auth
            exp
            year
          }
        }
      }
    }
  }
}`;


function data_to_props({ root: { org : { pa_vote_stat } } }, level){

  let { 
    data: vote_stat_items,
    info: {
      yearly_totals,
    },
  } = pa_vote_stat;

  yearly_totals = _.chain(yearly_totals)
    .map( ({auth, exp, year}) => {
      const lapse = auth-exp;
      const lapse_pct = lapse/auth;
      return {
        year,
        auth,
        exp,
        lapse,
        lapse_pct,
      };
    })
    .sortBy(({year})=> _.indexOf(sorted_years, year) )
    .value();


  const total_last_year = _.sumBy(vote_stat_items, 'exp');

  vote_stat_items = _.chain(vote_stat_items)
    .sortBy('exp')
    .reverse()
    .map( record => _.immutate(record, {
      exp_pct: record.exp/total_last_year,
    }))
    .value();

  return {
    yearly_totals,
    vote_stat_items,
  };

}

export default {
  levels: [ "org" ],
  key: "pa_vote_stat",
  query,
  component: Component,
  data_to_props, //we don't use the data at this layer, we just take advantage of the side-effect for cache to be pre-loaded
};