import gql from 'graphql-tag';

const Component = ({ data: { programs } }) => <div>
  <ul>
    {_.map(programs, ({name}) =>
      <li key={name}>
        { name }
      </li>
    )}
  </ul>
</div>;


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
  key: "example1",
  query,
  component: Component,
  data_to_props, //we don't use the data at this layer, we just take advantage of the side-effect for cache to be pre-loaded
};