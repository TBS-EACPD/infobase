require('../graphs/intro_graphs/intro_lang.ib.yaml');
require('../graphs/result_graphs/result_lang.ib.yaml');
const { StandardRouteContainer } = require('../core/NavComponents');

const { text_maker } =  require('../models/text.js');
require("./explorer.ib.yaml");

const Subject = require('../models/subject.js');

const { Tag } = Subject;

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


const HierarchySelectionItem = ({title, text, active, url }) => (
  <a 
    role="radio"
    title={title}
    className={classNames("link-unstyled hierarchy-selection-item", active && "active")}
    tabIndex={0}
    aria-checked={active}
    href={url}
  >
    <div className="hierarchy-selection-item__header">
      <span className="link-styled">{title}</span>
    </div>
    <div className="hierarchy-selection-item__description">
      {text}
    </div>
  </a>
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
      doc,
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
              url={`#resource-explorer/${props.id}/${doc}`}
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
          <li className={classNames("tab_label", doc==="drr16" && "active_tab")} onClick={()=> this.refs.drr166_link.click()}>
            <a href={`#resource-explorer/${hierarchy_scheme}/drr166`} role="button" className="tab_label_text" ref="drr166_link">
              <TextMaker text_key="DRR_resources_option_title" />
            </a>
          </li>
          <li className={classNames("tab_label", doc==="dp17" && "active_tab")} onClick={()=> this.refs.dp17_link.click()}>
            <a href={`#resource-explorer/${hierarchy_scheme}/dp17`} role="button" className="tab_label_text" ref="dp17_link">
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


class ExplorerContainer extends React.Component {
  componentWillMount(){
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
    const store = createStore(reducer,initialState);

    this.Container = Container;
    this.store = store;

  }
  componentWillUpdate(nextProps){
    const { hierarchy_scheme, doc } = nextProps;
    const { store } = this;

    resource_scheme.set_hierarchy_and_doc(store,hierarchy_scheme,doc);
  }
  render(){
    const { store, Container } = this;
    return (
      <Provider store={store}>
        <Container />
      </Provider>
    );

  }

}


export class ResourceExplorer extends React.Component {
  constructor(){
    super();
    this.state = { loading: true };
  }
  componentWillMount(){
    ensure_loaded({ 
      table_keys: ['table6', 'table12'],
    }).then(()=> {
      this.setState({loading: false});
    })
  }
  render(){
    const { match } = this.props;
    const route_container_args = {
      title: text_maker("tag_nav"),
      breadcrumbs: [text_maker("tag_nav")],
      route_key:"_resource-explorer",
    };
    const header = <h1><TM k="tag_nav" /></h1>;

    if(this.state.loading){
      return (
        <StandardRouteContainer {...route_container_args}>
          {header}
          <SpinnerWrapper scale={4} />
        </StandardRouteContainer>
      );
    }
    let { 
      params : {
        hierarchy_scheme,
        doc,
      },
    } = match;

    hierarchy_scheme = (
      _.includes(['min','dept','GOCO','HWH'], hierarchy_scheme) ? 
      hierarchy_scheme :
      'min'
    );
    
    doc = (
      _.includes(['drr16','dp17'], doc) ? 
      doc :
      'drr16'
    );

    return (
      <StandardRouteContainer {...route_container_args}>
        {header}
        <ExplorerContainer {...{hierarchy_scheme, doc}} />
      </StandardRouteContainer>
    );

  }
}

