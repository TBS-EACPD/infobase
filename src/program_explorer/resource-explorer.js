const ROUTER = require("../core/router");
const { shallowEqualObjectsOverKeys } = require('../core/utils.js');

const { text_maker } =  require('../models/text.js');
require("./explorer.ib.yaml");

const Subject = require('../models/subject.js');

const { Tag } = Subject;

const { reactAdapter } = require('../core/reactAdapter.js');

const {
  TextMaker,
  TM,
  SpinnerWrapper,
} = require('../util_components.js');
const { Details } = require('../components/Details.js');
const classNames = require('classnames');


//treemap stuff
const { combineReducers, createStore } = require('redux');
const { Provider, connect } = require('react-redux');

const {
  get_root,
} = require('../gen_expl/hierarchy_tools.js');

const { 
  resource_scheme,
  get_initial_resource_state,
} = require('../gen_expl/resource_scheme.js');

const { GeneralTree } = require('../gen_expl/GeneralTree.js');


const {
  get_memoized_funcs,
  initial_root_state,
  root_reducer,
  map_state_to_root_props_from_memoized_funcs,
  map_dispatch_to_root_props,
} = require('../gen_expl/state_and_memoizing');

const { ensure_loaded } = require('../core/lazy_loader.js');


const HierarchySelectionItem = ({title, text, active, onClick }) => (
  <button 
    role="radio" 
    className={classNames("button-unstyled hierarchy-selection-item", active && "active")}
    tabIndex={0}
    aria-checked={active}
    onClick={onClick}
  >
    <div className="hierarchy-selection-item__header">
      <span><a href="#">{title}</a></span>
    </div>
    <div className="hierarchy-selection-item__description">
      {text}
    </div>
  </button>
);


class Explorer extends React.Component {
  constructor(){
    super()
    this.state = { _query : "" };
    this.debounced_set_query = _.debounce(this.debounced_set_query, 500);
  }
  handleQueryChange(new_query){
    this.setState({
      _query : new_query,
      loading: new_query.length > 3 ? true : undefined,
    });
    this.debounced_set_query(new_query);
  } 
  debounced_set_query(new_query){
    this.props.set_query(new_query);
    setTimeout(()=>{
      this.setState({
        loading: false,
      });
    }, 500)
  }
  clearQuery(){
    this.setState({_query : ""});
    this.props.clear_query("");
  }
  render(){
    const {
      flat_nodes,
      is_filtering,

      set_query,
      toggle_node,
      
      //scheme props
      hierarchy_scheme,
      is_descending,
      sort_col,
      sort_func,
      col_click,
      set_hierarchy_scheme,
      doc,
      set_doc,
      is_m2m,
    } = this.props;

    const { loading } = this.state;

    const root = get_root(flat_nodes);

    const [goco_props, hwh_props ] = [ 
      Tag.lookup("GOCO"),
      Tag.lookup("HWH"),
    ].map( ({ description, name, id }) => ({
      title: name,
      text: description,
      active: hierarchy_scheme === id,
      id,
    }));

    const min_props = {
      title: text_maker("how_were_accountable"),
      text: text_maker("portfolio_description"),
      active: hierarchy_scheme === 'min',
      id: 'min',
    };

    const dept_props = {
      title: text_maker("organizations_public_funds"),
      text: text_maker("a_z_list_of_orgs"),
      active: hierarchy_scheme === 'dept',
      id: 'dept',
    };

    const inner_content = <div>
      <div style={{marginTop: '15px'}}>
        <form
          style={{marginBottom: "15px"}}
          onSubmit={evt => {
            evt.preventDefault()
            evt.stopPropagation()
            set_query(evt.target.querySelector('input').value);
            this.refs.focus_mount.focus();
          }}
        >
          <input 
            className="form-control input-lg"
            type="text"
            style={{width:"100%", backgroundColor:"#fafafa"}}
            placeholder={text_maker('everything_search_placeholder')}
            onChange={evt => this.handleQueryChange(evt.target.value)}
          />
        </form>
      </div>
      <div 
        tabIndex={-1} 
        ref="focus_mount" 
        style={{position:'relative'}}
      >
        {loading && 
          <div className="loading-overlay">
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
        <GeneralTree
          {...{
            root,
            onToggleNode: toggle_node,
            renderNodeContent: resource_scheme.tree_renderer,
            sort_func,
            is_searching : is_filtering,
            scheme_props: { 
              hierarchy_scheme, 
              sort_func, 
              sort_col, 
              col_click, 
              is_descending,
              doc,
            },
          }}
        />
      </div>
    </div>;
    
    const tab_on_click = (doc)=> set_doc!==doc && set_doc(doc);

    return <div>
      <div style={{marginBottom:'35px'}}>
        <TextMaker text_key="tag_nav_intro_text" el="div" />
        <Details
          summary_content={<TM k="where_can_find_subs_question" />}
          content={<TM k="where_can_find_subs_answer" />}
        />
      </div>

      <div className="hierarchy-selection">
        <header className="hierarchy-selection-header">
          <TextMaker text_key="choose_explore_point" />
        </header>
        <div role="radiogroup" className="hierarchy-selection-items">
          {_.map([ min_props, dept_props, goco_props, hwh_props ],props =>
            <HierarchySelectionItem 
              key={props.id} 
              onClick={()=> set_hierarchy_scheme(props.id)} 
              {...props} 
            />
          )}
        </div>
        
      </div>
   
      { is_m2m && 
        <div dangerouslySetInnerHTML={{__html: text_maker('m2m_warning_text')}} />
      }
      <div className="tabbed_content">
        <ul className="tabbed_content_label_bar">
          <li className={classNames("tab_label", doc==="drr16" && "active_tab")} onClick={()=> tab_on_click('drr16')}>
            <a href="#" role="button" className="tab_label_text" onClick={()=> tab_on_click('drr16')}>
              <TextMaker text_key="DRR_resources_option_title" />
            </a>
          </li>
          <li className={classNames("tab_label", doc==="dp17" && "active_tab")} onClick={()=> tab_on_click('dp17')}>
            <a href="#" role="button" className="tab_label_text" onClick={()=> tab_on_click('dp17')}>
              <TextMaker text_key="DP_resources_option_title" />
            </a>
          </li>
        </ul>
        <div className="tabbed_content_pane">
          {inner_content}
        </div>
      </div>
    </div>;

  }
}


const map_state_to_props_from_memoized_funcs = memoized_funcs => {

  const  { get_scheme_props } = memoized_funcs;
  const mapRootStateToRootProps = map_state_to_root_props_from_memoized_funcs(memoized_funcs);

  return state => _.immutate(
    mapRootStateToRootProps(state),
    get_scheme_props(state)
  );
}

const props_to_url = ({ hierarchy_scheme, doc }) => `#resource-explorer/${hierarchy_scheme}/${doc}`;

class URLSynchronizer extends React.Component {
  render(){ return null; }
  //this will only be called when the user switches data areas. 
  //If the infograph changes, this might have to change as well...
  componentWillReceiveProps(nextProps){
    if(!shallowEqualObjectsOverKeys(this.props, nextProps, ['hierarchy_scheme','doc'])){
      this.updateURLImperatively(nextProps);
    }
  }
  updateURLImperatively(nextProps){
    const new_url = props_to_url(nextProps);
    ROUTER.navigate(new_url, {trigger:false});
  }
}



class ExplorerContainer extends React.Component {
  render(){
    const { hierarchy_scheme, doc } = this.props;

    const scheme = resource_scheme;
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
      [scheme_key]: get_initial_resource_state({ hierarchy_scheme, doc }),
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

}

ROUTER.add_container_route("resource-explorer/:hierarchy_scheme:/:doc:","_resource-explorer", function(container, hierarchy_param, doc_param){

  this.add_title("tag_nav");
  this.add_crumbs([{html: text_maker("tag_nav")}]);
  container.appendChild( new Spinner({scale:4}).spin().el );


  const initial_hierarchy_scheme = (
    _.includes(['min','dept','GOCO','HWH'], hierarchy_param) ? 
    hierarchy_param :
    'min'
  );
  
  const initial_doc = (
    _.includes(['drr16','dp17'], doc_param) ? 
    doc_param :
    'drr16'
  );

  ensure_loaded({ 
    table_keys: ['table6', 'table12'],
  }).then( ()=>{
    container.innerHTML = `<div id="explorer-mount"></div>`;  

    reactAdapter.render(
      <div>
        <ExplorerContainer 
          hierarchy_scheme={initial_hierarchy_scheme} 
          doc={initial_doc}
        />
      </div>,
      container.querySelector('#explorer-mount')
    );

  })
});

