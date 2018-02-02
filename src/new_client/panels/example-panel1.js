import gql from 'graphql-tag';
import { Panel } from '../panel-components.js';

const Component = ({ data: { programs } }) => (
  <Panel title="example panel 2">
    <ul>
      {_.map(programs, ({name}) =>
        <li key={name}>
          { name }
        </li>
      )}
    </ul>
  </Panel>
);


const query = gql`
  query($lang: String!, $id: String!) {
    root(lang: $lang){
      org(org_id:$id){
        programs {
          name
        }
      }
    }
  }
`

function data_to_props({ root: { org: { programs  }} }){
  return { programs };
}

export default {
  levels: [ 'org' ],
  key: "example1",
  query,
  component: Component,
  data_to_props, //we don't use the data at this layer, we just take advantage of the side-effect for cache to be pre-loaded
};