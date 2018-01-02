require('./mandate_letter_tracker.ib.yaml');
require('./mandate_letter_tracker.css');
const {createSelector} = require('reselect');
const ROUTER = require("../core/router");

const { text_maker } =  require('../models/text.js');
const { reactAdapter } = require('../core/reactAdapter.js');

//treemap stuff
const { combineReducers, createStore } = require('redux');
const { Provider, connect } = require('react-redux');

const { create_ml_hierarchy } = require('./hierarchies.js')
const { Explorer } = require('./explorer-view.js');


const {
  get_memoized_funcs,
  initial_root_state,
  root_reducer,
  map_state_to_root_props_from_memoized_funcs,
  map_dispatch_to_root_props,
} = require('../gen_expl/state_and_memoizing');


const map_state_to_props_from_memoized_funcs = memoized_funcs => {

  const  { get_scheme_props } = memoized_funcs;
  const mapRootStateToRootProps = map_state_to_root_props_from_memoized_funcs(memoized_funcs);

  return state => _.immutate(
    mapRootStateToRootProps(state),
    get_scheme_props(state)
  );
}

const ml_scheme = {
  key: 'ml_scheme',

  get_props_selector: () => createSelector(
    _.property('ml_scheme.grouping'),
    (grouping) => {
      return {
        sort_func: _.identity,
        grouping,
      };
    }
  ),

  get_filter_func_selector: ()=> createSelector(_.constant(true), () => nodes => nodes ),

  dispatch_to_props: dispatch => ({
    set_grouping: grouping => dispatch({
      type: 'set_grouping',
      payload: grouping,
    }),
  }),

  reducer: (state={ grouping: 'priority'}, action) => {
    const { type, payload } = action;
    switch(type){
      case 'set_grouping':
        return _.immutate(state, { grouping: payload});
      default: 
        return state;
    }
  },

  get_base_hierarchy_selector: () => createSelector( 
    _.property('ml_scheme.data'),
    _.property('ml_scheme.grouping'),
    (data, grouping)=> {
      return create_ml_hierarchy(data, grouping);
    }
  ),

  shouldUpdateFlatNodes: (oldSchemeState, newSchemeState) => oldSchemeState !== newSchemeState,
}


const ExplorerContainer = ({data}) => {
  const scheme = ml_scheme;
  const scheme_key = scheme.key;

  const reducer = combineReducers({
    root: root_reducer, 
    [scheme_key]: scheme.reducer,
  });

  const mapStateToProps = map_state_to_props_from_memoized_funcs(get_memoized_funcs([scheme]));

  const mapDispatchToProps = dispatch => _.immutate(
    map_dispatch_to_root_props(dispatch),
    scheme.dispatch_to_props(dispatch)
  );

  const initialState = {
    root: _.immutate(initial_root_state, {scheme_key}),
    [scheme_key]: { 
      data, 
      grouping: "priority",
    },
  };


  const Container = connect(mapStateToProps, mapDispatchToProps)(Explorer)

  return (
    <Provider store={createStore(reducer,initialState)}>
      <Container />
    </Provider>
  );
}

ROUTER.add_container_route("mandate_letter_tracker/","_mandate_letter_tracker", function(container){

  this.add_title("ml_title");
  this.add_crumbs([{html: text_maker("ml_title")}]);
  container.appendChild( new Spinner({scale:4}).spin().el );
  
  require.ensure(['./data.json'],()=> {
    const data = _.map(require('./data.json'), (row,ix) => _.immutate(row, {id: ix}) );

    container.innerHTML = `<div id="explorer-mount"></div>`;  

    reactAdapter.render(
      <div>
        <ExplorerContainer data={data} />
      </div>,
      container.querySelector('#explorer-mount')
    );

  })
});

