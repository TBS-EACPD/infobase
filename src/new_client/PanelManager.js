//import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';

const Presentational = props => {
  const { panel_defs, subject_context } = props;

  const arePanelDepsLoading = !_.chain(panel_defs)
    .filter("query") //filter out static panels
    .reject( ({key}) => {
      //See apollo docs on networkStatus, the following values cover refetch's, fetchMore's and other special use-cases
      //in these cases, we don't want the entire infographic to block rendering.

      const networkStatus = _.get(props, `${key}.networkStatus`);
      return _.includes([2,3,4], networkStatus);

    }) 
    .every( ({key}) => _.get(props, `${key}.loading`) === false )
    .value(); 

  if(arePanelDepsLoading){
    return null;

  } else {

    const data_by_panel_key = _.pick(props, _.map(panel_defs,'key'));

    return _.map(panel_defs, ({key, data_to_props, component: Component}) => {
      const data_props = data_by_panel_key[key];

      return (
        <Component
          data={
            _.isFunction(data_to_props) ? 
            data_to_props(data_props) : 
            null  // static panels won't have data_to_props nor data_props
          }
          gql_props={
            _.pick(data_props, [
              'refetch',
              'variables',
              'loading', //note that in the case of refetches, component data may still be loading! 
            ])
          }
          subject_context={subject_context}
          key={key}
        />
      );
    });
  
  }

};


const global_graphql_vars = {
  lang: window.lang,
};

const dummy_query = gql`
  query dummy_query($lang: String!) {
    root(lang: $lang){
      non_field
    }
}
`;

function panel_def_to_connecter(panel_def, subject_context){

  const { key, query: query_func, vars: vars_func } = panel_def;

  if(!panel_def.query){
    return null;
  }
  
  let query = _.isFunction(query_func) ? query_func(subject_context) : query_func;
  if(!query){
    query = dummy_query;
  }
  let vars = _.isFunction(vars_func) ? vars_func(subject_context) : vars_func;

  
  return graphql(query, {
    name: key,
    options: ({subject_context}) => ({
      skip: !query,
      variables: Object.assign(
        {},
        global_graphql_vars,
        subject_context,
        vars
      ),
    }),
  });
};


export class PanelManager extends React.PureComponent {
  render(){
    const { 
      panel_defs,
      subject_context,
    } = this.props;

    const panel_connecters = _.chain(panel_defs)
      .map(def => panel_def_to_connecter(def, subject_context))
      .compact() //yank out the nulls created by static panels
      .value();

    const Component = compose(...panel_connecters)(Presentational);

    return <Component {...this.props} />;
  }

};