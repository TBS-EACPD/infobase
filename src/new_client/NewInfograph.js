//import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';


const PresentationalInfograph = props => {
  const { panel_defs } = props;
  const isLoading = !_.every(panel_defs, ({key}) => _.get(props, `${key}.loading`) === false );

  if(isLoading){
    return <p> Loading... </p>;
  } else {
    const data_by_panel_key = _.pick(props, _.map(panel_defs,'key'));
    return <div>
      {_.map(panel_defs, ({key, data_to_props, component: Component}) => {
        const data_props = data_by_panel_key[key];
        return (
          <Component
            {...data_to_props(data_props)}
            refetch={data_props.refetch}
            key={key}
          />
        );
      })}
    </div>

  }


};



const panel_def_to_connecter = ({ 
  key,
  query,
}) => graphql(query, {
  name: key,
  options: ({subject_context}) => ({ 
    variables: subject_context,
  }),
});


export function InfoGraph(props){
  
  const { panel_defs } = props;

  const Component = compose(..._.map(panel_defs, panel_def_to_connecter))(PresentationalInfograph)

  return <Component {...props} />;

}; 