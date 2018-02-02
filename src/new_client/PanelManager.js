//import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';




/*

# Panel API 


Panels definitions are of the form: {
  key: String,
  levels: LevelArg,
  query: gql query document OR level-indexed gql query documents OR null
  data_to_props: ({ root }, subject ) => any kind of props
  component: ({ 
    data: ...props_returned_from_above_data_to_props,
    subject_context: { id, level },

  }) => ReactElement
}

LevelArg = "*", ["org", "gov", "program"]







*/ 








//hacky duck-typing check to separate cases of just query  vs level-indexed queries
const is_gql_query = obj => obj && obj.kind === "Document" && obj.loc;


const dummy_query = gql`
  query dummy_query($lang: String!) {
    root(lang: $lang){
      non_field
    }
}
`;
const get_level_appropriate_query_for_panel = (panel_def, level) => {

  const { levels, query, key } = panel_def;


  if(!_.includes(levels, level) && levels !== "*"){
    throw `Panel ${key} does not support ${level}`;
  }

  //if the query is not a level-indexed object of queries, or if it's empty, use that
  if(is_gql_query(query)){
    return query;
  }

  if(!query){
    return dummy_query;
  }

  if(query){
    return query[level]  || query["*"];
  }
  

};

const Presentational = props => {
  const { panel_defs, subject_context, a11y_mode } = props;

  const { level } = subject_context;

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


  let children;
  if(arePanelDepsLoading){
    children = null;

  } else {

    const data_by_panel_key = _.pick(props, _.map(panel_defs,'key'));

    children = _.map(panel_defs, ({key, data_to_props, component: Component}) => {
      const data_props = data_by_panel_key[key];

      return (
        <Component
          data={
            _.isFunction(data_to_props) ? 
            data_to_props(data_props, level) : 
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

  if(a11y_mode){

    return <div>
      <div
        role="alert"
        aria-live="assertive"
        className="sr-only"
      >
        { arePanelDepsLoading ? 
          "Content is loading, please wait..." :
          "Content is loaded"
        }
      </div>
      { children } 
    </div>;

  } else {
    return children;
  }

};


const global_graphql_vars = {
  lang: window.lang,
};



function panel_def_to_connecter(panel_def, subject_context){

  const { key, vars: vars_func } = panel_def;

  if(!panel_def.query){
    return null;
  }
  
  let query = get_level_appropriate_query_for_panel(panel_def, subject_context.level);
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