/* eslint-disable react/no-unescaped-entities */
require('./explorer-styles.scss');

const { TextMaker } = require('../util_components.js');

const classNames = require('classnames');
const { reactAdapter } = require('../core/reactAdapter.js');
const ROUTER = require('../core/router.js');

const { ensure_loaded } = require('../core/lazy_loader.js');
const { results_scheme } = require('./results_scheme');
const { igoc_scheme } = require('./igoc_scheme');
const { datasets_scheme } = require('./datasets_scheme.js');


const {
  SpinnerWrapper,
  DebouncedUncontrolledInput,
} = require('../util_components.js');

const {
  get_root,
} = require('./hierarchy_tools.js');


const { GeneralTree } = require('./GeneralTree.js');

const { combineReducers, createStore } = require('redux');

const { Provider, connect } = require('react-redux');

const {
  get_memoized_funcs,
  initial_root_state,
  root_reducer,
  map_state_to_root_props_from_memoized_funcs,
  map_dispatch_to_root_props,
} = require('./state_and_memoizing');


ROUTER.add_container_route( "gen_expl", '_gen_expl', function(container){

  this.add_crumbs([{html: 'new thing'}]);
  this.add_title($('<h1>').html('new thing'));

  reactAdapter.render(
    <SubApp />, 
    container
  );
  
});


const sort_funcs = {
  name_asc: list => _.sortBy(list, node => node.data.name),
  name_desc: list => _.sortBy(list, node => node.data.name).reverse(),
};

class SubApp extends React.Component {
  constructor(){
    super();
    this.state = { 
      loading: true,
    };
    this.schemes = {
      results: results_scheme,
      igoc: igoc_scheme,
      datasets: datasets_scheme,
    };
  }
  componentDidMount(){
    ensure_loaded({
      results: true, 
      table_keys: [ 'table12', 'table6' ],
    }).then( ()=> {
      this.setState({ loading: false });
    });

    this.memoized_funcs = get_memoized_funcs(this.schemes);

  }
  render(){

    const { 
      loading, 
    } = this.state;
    

    if(loading){
      return <div>
        <SpinnerWrapper scale={3} />
      </div>;
    }
  
    const { 
      memoized_funcs,
      schemes,
    } = this;

    const reducer = combineReducers({
      root: root_reducer, 
      results: results_scheme.reducer,
      igoc: igoc_scheme.reducer,
      datasets: datasets_scheme.reducer,
    });

    const mapStateToProps = map_state_to_props_from_memoized_funcs(memoized_funcs);
    const mapDispatchToProps = mapDispatchToProps_fromSchemes(schemes);
    const initialState = {
      root: initial_root_state,
      results:  results_scheme.initial_state,
      igoc: igoc_scheme.initial_state,
      datasets: datasets_scheme.initial_state,
    };


    const Container = connect(mapStateToProps, mapDispatchToProps)(Explorer)

    return (
      <Provider store={createStore(reducer,initialState)}>
        <Container />
      </Provider>
    );
  }
}


const negative_search_relevance_func = ({ is_search_match }) => is_search_match ? 0 : 1;
const main_sort_func = list => _.chain(list) //sort by search relevance, than the initial sort func
  .pipe(sort_funcs.name_asc)
  .sortBy(negative_search_relevance_func)
  .value();

const SearchTips = () => <div>
  <details>
    <summary> Search tips </summary>
    <div>
      <p> We are not google, here's how to best use our search bar </p>
      <ul>
        <li> <p> Each word you search must be contained in names, titles, acronyms and descriptions </p> </li>
        <li> <p> You don't need to match cases </p> </li>
        <li> <p> Synonyms and similar words are not matched. E.g. <i>Agriculture</i> will not match <i>Agricultural</i>. To account for these strange cases, try searching for <i>Agricult</i> </p> </li>
      </ul>
    </div>
  </details>
</div>;

class Explorer extends React.PureComponent {
  render(){
    const schemes = {
      results: results_scheme,
      igoc: igoc_scheme,
      datasets: datasets_scheme,
    };

    const {
      root: {
        flat_nodes,
        loading,
        scheme_key,
        is_filtering,
        query,
      },
      scheme_props,

      set_query,
      toggle_node,
      switch_mode,
      clear_query, 
      enable_loading,
      scheme_dispatch_props,
    } = this.props;

    const sort_func = main_sort_func;

    const active_scheme = schemes[scheme_key];


    const root = get_root(flat_nodes);

    const sidebar_content = active_scheme.get_sidebar_content(_.immutate( 
      scheme_props,
      scheme_dispatch_props[scheme_key]
    ));

    return <div className="super-wide-container-parent"><div className="super-wide-container">
      <div className="row">
        <div className="col-md-9 col-md-offset-3">
          <SearchTips />
          <div>
            <form
              onSubmit={evt => {
                evt.preventDefault()
                evt.stopPropagation()
                set_query(evt.target.querySelector('input').value);
                this.refs.focus_mount.focus();
              }}
            >
              <DebouncedUncontrolledInput 
                className="form-control input-lg"
                type="text"
                style={{width:"100%"}}
                placeholder="Search"
                onQuery={val => {set_query(val)}}
                onChange={val => val.length > 3 && enable_loading()}
              />
            </form>
          </div>
          { is_filtering &&
          <div className="search-clear-container">
            <div style={{fontWeight: '500', fontSize: '1.5em'}}> filtering for : {query} </div>
            <div>
              <button 
                className="btn"
                onClick={clear_query}
              >
                Clear search  <span dangerouslySetInnerHTML={{__html: "&#10006;"}} />
              </button>
            </div>
          </div>
          }
          <ul 
            className="nav nav-underline-active nav-justified"
            style={{marginBottom: '20px'}}
          >
            {_.map(schemes, ({title}, key) => 
              <li 
                className={classNames(key===scheme_key && 'active')}
              >
                <a href="#" onClick={()=> switch_mode(key) }> 
                  {title} 
                </a>
              </li>
            )}
          </ul>
        </div></div>

      <div className="row">
        <div className="col-md-3 col-sm-12 md-no-right-gutter">
          <div className="well dark-well" style={{minHeight:"500px"}}>
            {sidebar_content}
          </div>
        </div>

        <div className="col-md-9 col-sm-12">
          <div 
            tabIndex={-1} 
            ref="focus_mount" 
            aria-busy={!!loading}
            style={{position:'relative'}}
            aria-label="This is a tree-list, drill down to go through items and expand/collapse their children"
          >
            {loading && 
              <div 
                style={{
                  zIndex:50, 
                  backgroundColor: "rgba(200,200,200,0.5)",
                  height: "100%", 
                  width: "100%",
                  position:'absolute', 
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent : 'center',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{height: '200px',position:'relative'}}>
                  <SpinnerWrapper scale={3} /> 
                </div>
              </div>
            }
            {is_filtering && _.isEmpty(root.children) &&
              <div style={{fontWeight: '500', fontSize: '1.5em', textAlign:'center'}}>  
                <TextMaker text_key="search_no_results" />
              </div>
            }
            { 
              React.createElement(GeneralTree, {
                root,
                onToggleNode: toggle_node,
                renderNodeContent: active_scheme.tree_renderer,
                sort_func,
                is_searching : is_filtering,
                scheme_props,
              })
            }
          </div>
        </div>
      </div>
    </div>
    </div>
    
  }
}




const map_state_to_props_from_memoized_funcs = memoized_funcs => { 

  const  { get_scheme_props } = memoized_funcs;
  const mapRootStateToRootProps = map_state_to_root_props_from_memoized_funcs(memoized_funcs);

  return state => ({
    root : mapRootStateToRootProps(state),
    scheme_props: get_scheme_props(state),
  });
  
}

const mapDispatchToProps_fromSchemes = schemes => dispatch => {

  const root_dispatch_actions = map_dispatch_to_root_props(dispatch);

  return _.immutate(root_dispatch_actions, {
    scheme_dispatch_props: _.mapValues(schemes, scheme=> scheme.dispatch_to_props(dispatch) ),
  });
}

