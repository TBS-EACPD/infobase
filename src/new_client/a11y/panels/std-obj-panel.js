import gql from 'graphql-tag';
import { Panel } from '../../panel-components.js';
import { Format } from '../../../util_components.js';


const MoneyFormat = ({ amt }) => <Format type="compact_written" content={amt} />;
const PctFormat = ({ amt }) => <Format type="percentage1" content={amt} />;

const Component = ({ data: { dept_totals, program_sobjs } }) => (
  <Panel title="Spending by Standard Object (2016-17)">
    

    <section>
      <header> Departmental Expenditures </header>
      <table className="table">
        <thead>
          <tr>
            <th scope="col"> Standard Object </th>
            <th scope="col"> Amount </th>
            <th scope="col"> Proportion of total </th>
          </tr>
        </thead>
        <tbody>
          {_.map(dept_totals, ({amount, sobj, pct }) =>
            <tr key={sobj}>
              <td> <strong>{sobj}</strong> </td>
              <td> <MoneyFormat amt={amount} /> </td>
              <td> <PctFormat amt={pct} /> </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>


    { !_.isEmpty(program_sobjs) && 
      <section className="mrgn-tp-lg" style={{maxHeight: "400px", overflow: "auto"}}>
        <header> Detailed Program Expenditures by Standard Object </header>
        <ul>
          {_.map(program_sobjs, ({ name, id, sobjs }) => 
            <li key={id}>
              <section>
                <header> {name} </header>
                <table className="table">
                  <thead>
                    <th scope="col"> Standard Object </th>
                    <th scope="col"> Amount </th>
                    <th scope="col"> Proportion of total </th>
                  </thead>
                  <tbody>
                    {_.map(sobjs, ({ amount, sobj, pct }) => 
                      <tr key={sobj}>
                        <td> {sobj} </td>
                        <td> <MoneyFormat amt={amount} /> </td>
                        <td> <PctFormat amt={pct} /> </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </section>
            </li>
          )}
        </ul>
      </section>
    }

  </Panel>
);






const query = gql`
query StandardObjectA11YQuery ($lang: String!, $id: String!){
  root(lang: $lang){
    org(org_id:$id){
      standard_object_data {
        data(year: "pa_last_year") {
          so_num
          amount
        }
      }
      programs {
        id: activity_code
        name
        standard_object_data {
          data(year: "pa_last_year") {
            so_num
            amount
          }
        }
      }
    }
  }
}
`;


function data_to_props({ root: { org } }, level){

  const programs = _.get(org, 'programs');
  const sobj_data = _.get(org, "standard_object_data.data");
  

  const dept_total = _.sumBy(sobj_data, "amount");
  const dept_totals = _.chain(sobj_data)
    .map( ({amount, so_num }) => ({
      amount,
      sobj: so_num,
      pct: amount/dept_total,
    }))
    .sortBy('amount')
    .reverse()
    .value();

  const program_sobjs = _.chain(programs)
    .filter(prog => _.nonEmpty(_.get(prog,'standard_object_data.data')))
    .map( ({name, id, standard_object_data }) => {

      const total = _.sumBy(standard_object_data.data, 'amount');
      
      return {
        name,
        id,
        total,
        sobjs: _.map(standard_object_data.data, ({ amount, so_num }) => ({
          sobj: so_num,
          amount,
          pct: amount/total,
        })),
      };

    })
    .sortBy('total')
    .reverse()
    .value();

  return {
    dept_totals,
    program_sobjs,
  };

}

export default {
  levels: [ "org" ],
  key: "pa_vote_stat",
  query,
  component: Component,
  data_to_props, //we don't use the data at this layer, we just take advantage of the side-effect for cache to be pre-loaded
};