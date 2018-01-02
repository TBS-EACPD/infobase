const {
  TM,
} = require('../util_components.js');
require('./igoc_explorer.ib.yaml');
require('./igoc_explorer.css');

const {createSelector} = require('reselect');
const ROUTER = require("../core/router");

const { text_maker } =  require('../models/text.js');
const { reactAdapter } = require('../core/reactAdapter.js');

//treemap stuff
const { combineReducers, createStore } = require('redux');
const { Provider, connect } = require('react-redux');

const { create_igoc_hierarchy } = require('./hierarchies.js')
const { Explorer } = require('./explorer_view.js');

const { filter_hierarchy } = require('../gen_expl/hierarchy_tools.js');


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

const scheme = {
  key: 'igoc',

  get_props_selector: () => createSelector(
    _.property('igoc.grouping'),
    _.property('igoc.should_show_orgs_without_data'),
    (grouping, should_show_orgs_without_data) => {
      return {
        sort_func: _.identity,
        grouping,
        should_show_orgs_without_data,
      };
    }
  ),

  dispatch_to_props: dispatch => ({
    set_grouping: grouping => dispatch({
      type: 'set_grouping',
      payload: grouping,
    }),
    on_toggle_orgs_without_data: ()=> dispatch({
      type: 'toggle_orgs_without_data',
    }),
  }),

  reducer: (state={ grouping: 'portfolio', should_show_orgs_without_data: true}, action) => {
    const { type, payload } = action;
    switch(type){
      case 'toggle_orgs_without_data':
        return _.immutate(state, { should_show_orgs_without_data : !state.should_show_orgs_without_data });
      case 'set_grouping':
        return _.immutate(state, { grouping: payload});
      default: 
        return state;
    }
  },

  get_base_hierarchy_selector: () => createSelector( 
    _.property('igoc.grouping'),
    grouping => create_igoc_hierarchy(grouping)
  ),

  get_filter_func_selector: ()=> createSelector(
    _.property('igoc.should_show_orgs_without_data'), 
    should_show_orgs_without_data => (
      should_show_orgs_without_data ? 
      _.identity :
      nodes => filter_hierarchy(
        nodes,
        node => (_.get(node, 'data.subject.tables.length') || 0) > 1,
        { leaves_only: false, markSearchResults: false }
      )
    )
  ),
  
}


const ExplorerContainer = ({ initialGrouping}) => {
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
      grouping: initialGrouping,
      should_show_orgs_without_data: true,
    },
  };


  const connecter = connect(mapStateToProps, mapDispatchToProps);
  const Container = connecter(Explorer);
  const URLConnectedComponent = connecter(URLSynchronizer);
  const store = createStore(reducer,initialState);

  return [
    <Provider key={"a"} store={store}>
      <Container />
    </Provider>,
    <Provider key={"b"} store={store}>
      <URLConnectedComponent />
    </Provider>,
  ];
}

ROUTER.add_container_route("igoc/:grouping:","_igoc_explorer", function(container, grouping_param){

  this.add_title("igoc");
  this.add_crumbs([{html: text_maker("igoc")}]);
  container.appendChild( new Spinner({scale:4}).spin().el );
  
  const initialGrouping = (
    _.includes(['portfolio','all','historical','inst_form','pop_group'], grouping_param) ? 
    grouping_param :
    'portfolio'
  );

  container.innerHTML = `<div id="explorer-mount"></div>`;  

  reactAdapter.render(
    <div className="medium_panel_text">
      <div style={{marginBottom:"3em"}}>
        <TM k="about_inventory"/>
      </div>
      <ExplorerContainer 
        initialGrouping={initialGrouping}
      />
    </div>,
    container.querySelector('#explorer-mount')
  );

});

const props_to_url = ({ grouping }) => `#igoc/${grouping}`;

class URLSynchronizer extends React.Component {
  render(){ return null; }
  //this will only be called when the user switches data areas. 
  //If the infograph changes, this might have to change as well...
  componentWillReceiveProps(nextProps){
    if(
      _.nonEmpty(this.props.grouping) && 
      this.props.grouping !== nextProps.grouping
    ){
      this.updateURLImperatively(nextProps);
    }
  }
  updateURLImperatively(nextProps){
    const new_url = props_to_url(nextProps);
    ROUTER.navigate(new_url, {trigger:false});
  }
}

