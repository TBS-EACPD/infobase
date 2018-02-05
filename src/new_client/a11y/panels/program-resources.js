import gql from 'graphql-tag';
import { Panel } from '../../panel-components.js';
import { Format, TM } from '../../../util_components.js';

const MoneyFormat = ({ amt }) => <Format type="compact_written" content={amt} />;
const FTEFormat = ({ amt }) => <Format type="big_int_real" content={amt} />;



class Component extends React.Component {
  constructor(){
    super();
    this.state = {
      doc: "drr16",
    };
  }
  render(){
    const { doc } = this.state;
    const { data: { programs } } = this.props;

    const mapped_programs = _.chain(programs)
      .map(prog=> program_mapper(prog, doc))
      .filter( ({ spend, ftes }) => spend || ftes )
      .sortBy('spend')
      .reverse()
      .value();

    return <Panel title="Resources by Program">
      <label>
        Select data by year
        <select
          style={{marginLeft: "5px"}}
          value={doc}
          onChange={ evt => this.setState({ doc: evt.target.value }) }
        >
          <option value="drr16"> Drr 16-17 </option>
          <option value="dp17"> DP 17-18 </option>
        </select>
      </label>
      <ul style={{maxHeight: "600px", overflow: "auto"}}>
        {_.map(mapped_programs, prog => 
          <li key={prog.id}>
            <Node {...prog} />
          </li>
        )}
      </ul>
    </Panel>


  }
}


function program_mapper(program, doc){
  const { name, description, sub_programs, id } = program;
  const is_drr = doc==="drr16";
  const spend = _.get(program, `program_spending_data.basic_spend_trend.${is_drr ? "pa_last_year_exp" : "planning_year_1"}`);
  const ftes = _.get(program, `program_fte_data.basic_fte_trend.${is_drr ? "pa_last_year" : "planning_year_1"}`); 
   

  return {
    id,
    name,
    description,
    level: "program",
    spend,
    ftes,
    sub_programs: _.chain(sub_programs)
      .map(sub => sub_program_mapper(sub, doc))
      .filter(({ spend, ftes}) => spend || ftes )
      .sortBy('spend')
      .reverse()
      .value(),
  }
}


function sub_program_mapper(sub, doc){
  const { 
    name,
    description,
    id,

    spend_planning_year_1,
    fte_planning_year_1,
            
    spend_pa_last_year,
    fte_pa_last_year,

    sub_programs,
  } = sub;
  const is_drr = doc==="drr16";

  const spend = is_drr ? spend_pa_last_year : spend_planning_year_1;
  const ftes = is_drr ? fte_pa_last_year : fte_planning_year_1;
   

  return {
    id,
    name,
    description,
    spend,
    ftes,
    sub_programs: _.chain(sub_programs)
      .map(sub => sub_program_mapper(sub, doc))
      .filter(({ spend, ftes}) => spend || ftes )
      .sortBy('spend')
      .reverse()
      .value(),
  }

}


const Node = ({ id, level, name, spend, ftes, description, sub_programs }) => <dl>
  
  <dt> <TM k="name" /> </dt>
  <dd> {name} </dd>

  <dt> Description </dt>
  <dd> {description} </dd>

  <dt> Spending </dt>
  <dd> <MoneyFormat amt={spend} /> </dd>

  <dt> Employment </dt>
  <dd> <FTEFormat amt={ftes} /> </dd>

  {!_.isEmpty(sub_programs) && [
    <dt key="dt"> {level === "program" ? "Sub programs" : "Sub-sub-programs" }  </dt>,
    <dd key="dd"> 
      <ul>
        {_.map( sub_programs, sub => 
          <li key={sub.id}>
            <Node {...sub} />
          </li>
        )}
      </ul>  
    </dd>,
  ]}
</dl>



const fragment = gql`
fragment sub_program_finances on SubProgram {
  id
  name
  description
          
          
  spend_planning_year_1
  fte_planning_year_1
          
  spend_pa_last_year
  fte_pa_last_year
}`;


const query = gql`
query ProgramResourcesQuery($lang: String!, $id: String!){
  root(lang: $lang){
    org(org_id: $id){
      programs {
        name
        description
        program_spending_data {
          basic_spend_trend {
            planning_year_1
            pa_last_year_exp
          }
        }
        program_fte_data {
          basic_fte_trend {
            pa_last_year
            planning_year_1
          }
        }
        sub_programs {
          ...sub_program_finances
          sub_programs {
            ...sub_program_finances
          }
        }
      }
  
    }
    
  }
}
${fragment}
`;




function data_to_props({ root: { org : { programs } } }, level){

  return { programs };

}

export default {
  levels: [ "org" ],
  key: "pa_vote_stat",
  query,
  component: Component,
  data_to_props, //we don't use the data at this layer, we just take advantage of the side-effect for cache to be pre-loaded
};