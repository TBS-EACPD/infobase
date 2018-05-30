import { combineReducers, createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import { StandardRouteContainer } from '../core/NavComponents';
import { infograph_href_template } from '../link_utils.js';

import {
  SpinnerWrapper,
  TM,
  FootnoteList,
  HeightClipper,
  Format,
} from '../util_components.js';

import { text_maker } from '../models/text.js';

import { 
  get_root,
} from '../gen_expl/hierarchy_tools.js';


import {
  get_memoized_funcs,
  initial_root_state,
  root_reducer,
  map_state_to_root_props_from_memoized_funcs,
  map_dispatch_to_root_props,
} from '../gen_expl/state_and_memoizing';

import { ensure_loaded } from '../core/lazy_loader.js';
import { Explorer } from '../components/ExplorerComponents.js';


import {
  estimates_diff_scheme,
  col_defs,
  initial_state as initial_scheme_state,
} from './scheme.js';


export class DevStuff extends React.Component {
  constructor(){
    super();
    this.state = {loading: true};
  }
  componentWillMount(){
    ensure_loaded({
      table_keys: ["table8"],
      footnotes_for: "estimates",
    }).then(()=> {
      this.setState({ loading: false });
    })
  }
  render(){
    
    return (
      <StandardRouteContainer
        title={"dev"}
        breadcrumbs={["dev"]}
        description={"dev"}
        route_key="_dev"
      >
        <h1><TM k="diff_view_title"/></h1>
        { this.state.loading ? 
          <SpinnerWrapper /> :
          <ExplorerContainer />
        }
      </StandardRouteContainer>
    );


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
    const scheme = estimates_diff_scheme;
    const scheme_key = estimates_diff_scheme.key;

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
      [scheme_key]: initial_scheme_state,
    };

    const connecter = connect(mapStateToProps, mapDispatchToProps);
    const Container = connecter(EstimatesExplorer);
    const store = createStore(reducer,initialState);

    this.Container = Container;
    this.store = store;

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

const get_non_col_content = ({node}) => {
  const subject = _.get(node, "data.subject");
  const footnotes = _.get(node, "data.footnotes");
  const last_year = _.get(node, "data.last_year") - _.get(node, "data.last_year_mains");
  const last_year_mains = _.get(node, "data.last_year_mains");
  if(!subject && _.isEmpty(footnotes)){
    return null;
  }
  return (
    <div>
      <div>
        Last year main estimates : <Format type="compact1" content={last_year_mains} />
        <br/>
        Last year authorities excluding main estimates: <Format type="compact1" content={last_year} />
      </div>
      {!_.isEmpty(footnotes) && 
        <HeightClipper
          allowReclip={true} 
          clipHeight={150}
        >
          <header className="agnostic-header"><TM k="notes" /></header>
          <FootnoteList
            footnotes={_.map(footnotes, 'text')}
          />
        </HeightClipper>
      }
      { subject && 
        <div className='ExplorerNode__BRLinkContainer'>
          <a href={infograph_href_template(subject)}> 
            <TM k="see_infographic" />
          </a>
        </div>
      }
    </div>
  );
}

class EstimatesExplorer extends React.Component {
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
      
      is_descending,
      sort_col,
      col_click,

      //scheme props
      show_stat,
      toggle_stat_filter,
    } = this.props;
    const { loading } = this.state;

    const root = get_root(flat_nodes);

    const explorer_config = {
      column_defs: col_defs,
      onClickExpand: id => toggle_node(id),
      is_sortable: true,
      zebra_stripe: true,
      col_click,
      //un-used features...
      get_non_col_content,
      children_grouper: null,
    }

    return (
      <div>
        <div className="medium_panel_text mrgn-tp-lg">
          <TM k="diff_view_top_text" />
        </div>
        <div style={{marginTop: '15px'}}>
          <div>
            <label>
              <input
                type="checkbox"
                checked={!show_stat}
                onChange={toggle_stat_filter}
                style={{ marginRight: '1rem' }}
              />
              Only show voted items
            </label>
          </div>
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
              aria-label={text_maker("explorer_search_is_optional")}
              className="form-control input-lg"
              type="text"
              style={{width:"100%", backgroundColor:"#fafafa"}}
              placeholder={text_maker('everything_search_placeholder')}
              onChange={evt => this.handleQueryChange(evt.target.value)}
            />
            {
              window.is_a11y_mode &&
              <input 
                type="submit"
                name="search"
                value={text_maker("explorer_search")}
              />
            }
          </form>
        </div>
        <div 
          tabIndex={-1} 
          ref="focus_mount" 
          style={{position:'relative'}}
          aria-label={text_maker("explorer_focus_mount")}
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
              <TM k="search_no_results" />
            </div>
          }
          <Explorer 
            config={explorer_config}
            root={root}
            col_state={{
              sort_col,
              is_descending,
            }}
          />
        </div>
      </div>
    );
  }
}