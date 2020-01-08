import '../results.scss';

import classNames from 'classnames';

import { 
  util_components, 
  infograph_href_template, 
  InfographicPanel,
  TabbedControls,
  DlItem,
  get_source_links,
  ensure_loaded,
  
  declare_panel, 
} from '../../shared.js';
const { 
  SpinnerWrapper,
  Format,
  TextAbbrev,
} = util_components;

import { 
  Indicator,
  ResultCounts,
  GranularResultCounts,
  result_docs,
} from '../results_common.js';
import { StatusIconTable, InlineStatusIconList } from '../result_components.js';
import { TM, text_maker } from '../result_text_provider.js';


//drilldown stuff
import { createSelector } from 'reselect';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import redux_promise_middleware from 'redux-promise-middleware';
import { Provider, connect } from 'react-redux';

import { Explorer } from '../../../../explorer_common/explorer_components.js';
import { get_root } from '../../../../explorer_common/hierarchy_tools.js';
import { 
  get_memoized_funcs, 
  initial_root_state, 
  root_reducer, 
  map_state_to_root_props_from_memoized_funcs, 
  map_dispatch_to_root_props, 
} from '../../../../explorer_common/state_and_memoizing.js';

import { single_subj_results_scheme, get_initial_single_subj_results_state } from './results_scheme.js';
import { 
  get_type_name, 
  ResultNodeContent, 
  spending_header, 
  fte_header, 
  ResultCounts as ResultCountsComponent,
} from './result_displays.js';


const get_non_col_content_func = createSelector(
  _.property('doc'),
  doc => {
    return ({node}) => {
      const {
        data: {
          resources,
          subject,
          result,
          type,
        },
      } = node;

      if(result){
        return (
          <ResultNodeContent 
            node={node}
            doc={doc}
          />
        );
      }

      const detail_items = _.compact([
        result_docs[doc].has_resources && (
          <DlItem
            key={1}
            term={<span className="nowrap">{spending_header(doc) }</span>}
            def={<Format type="compact1" content={resources && resources.spending || 0} />}
          />
        ),
        result_docs[doc].has_resources && (
          <DlItem
            key={2}
            term={<span className="nowrap">{fte_header(doc) }</span>}
            def={<Format type="big_int" content={resources && resources.ftes || 0} />}
          />
        ),
        _.nonEmpty(subject.old_name) && (
          <DlItem
            key={3}
            term={<TM k="previously_named" />}
            def={subject.old_name}
          />
        ),
      ]);

      return (
        <div>
          { _.nonEmpty(detail_items) &&
            <dl className={classNames("dl-horizontal dl-no-bold-dts", ( window.lang === "fr" || /dp/.test(doc) ) ? "dl-really-long-terms" :"dl-long-terms")}>
              { detail_items }
            </dl>
          }
          {_.includes(['program','dept','cr'],type) && 
            <div className="ExplorerNode__BRLinkContainer">
              <a href={infograph_href_template(subject)}> 
                <TM k="see_infographic" />    
              </a>
            </div>
          }
        </div>
      );
    };
  }
);

const get_children_grouper = createSelector(
  _.identity,
  () => {

    return (node,children) => {
      if(node.data.result){ //results render their children manually through the non-col content
        return {node_group: []};
      }

      return _.chain(children)
        .groupBy("data.type")
        .toPairs()
        .sortBy( ([ type_key, group ]) => !_.includes(['dr', 'result'], type_key) ) //make results show up first 
        .map( ([type_key, node_group ]) => ({
          display: get_type_name(type_key), 
          node_group,
        }))
        .value();
    };
  }
);

const get_col_defs = createSelector(
  _.property('doc'),
  _.property('is_status_filter_enabled'),
  _.property('status_key_whitelist'),
  (doc, is_status_filter_enabled, status_key_whitelist) => {
    return [
      {
        id: "name",
        get_val: ({data, isExpanded}) => (
          isExpanded ? 
          data.name : 
          <TextAbbrev text={data.name} len={115} />
        ),
        width: 250,
        textAlign: "left",
      },
      {
        id: "targets",
        get_val: node => {
          const { 
            data: {
              subject,
              result,
            },
          } = node;

          return /drr/.test(doc) && (
            <div
              aria-hidden={true}
              className="status-icon-array"
            >
              <InlineStatusIconList 
                indicators={
                  _.filter(
                    (
                      result ?
                        result.indicators :
                        Indicator.get_flat_indicators(subject)
                    ),
                    (indicator) => indicator.doc === doc && 
                      ( !is_status_filter_enabled || _.includes(status_key_whitelist, indicator.status_key) )
                  )
                } 
              />
            </div>
          );
        },
        width: 200,
        textAlign: "right",
      },
    ];
  }
);

class SingleSubjExplorer extends React.Component {
  constructor(){
    super();
    this.state = { query: "" };
    this.debounced_set_query = _.debounce(this.debounced_set_query, 500);
  }
  handleQueryChange(new_query){
    this.setState({
      query: new_query,
      loading_query: new_query.length > 3 ? true : undefined,
    });
    this.debounced_set_query(new_query);
  } 
  debounced_set_query(new_query){
    this.props.set_query(new_query);
    this.timedOutStateChange = setTimeout(()=>{
      this.setState({
        loading_query: false,
      });
    }, 500);
  }
  clearQuery(){
    this.setState({query: ""});
    this.props.clear_query("");
  }
  componentWillUnmount(){
    !_.isUndefined(this.debounced_set_query) && this.debounced_set_query.cancel();
    !_.isUndefined(this.timedOutStateChange) && clearTimeout(this.timedOutStateChange);
  }
  render(){
    const {
      docs_with_data,

      flat_nodes,
      is_filtering,

      set_query,
      toggle_node,

      subject,
      
      //...scheme_props
      data_loading,
      doc,
      set_doc,
      icon_counts,
      toggle_status_status_key,
      clear_status_filter,
      is_status_filter_enabled,
      status_key_whitelist,              
    } = this.props;
    const { 
      loading_query,
      query,
    } = this.state;

    // Weird padding and margins here to get the spinner centered well and cover the "see the data" text while loading
    let inner_content = (
      <div style={{ paddingTop: "100px", paddingBottom: "30px", marginBottom: "-70px" }}>
        <SpinnerWrapper config_name={"tabbed_content"} />
      </div>
    );

    if (!data_loading){
      const root = get_root(flat_nodes);
  
      const explorer_config = {
        children_grouper: get_children_grouper({doc}),
        column_defs: get_col_defs({doc, is_status_filter_enabled, status_key_whitelist}),
        shouldHideHeader: true,
        zebra_stripe: true,
        onClickExpand: id => toggle_node(id),
        get_non_col_content: get_non_col_content_func({doc}),
      };
      inner_content = (
        <div>
          <div style={{ marginTop: "10px" }}>
            <ResultCountsComponent {...this.props} />
          </div>
          { /drr/.test(doc) &&  
            <div 
              style={{
                padding: '10px 10px',
                marginTop: "20px",
                marginBottom: "20px",
              }}
            >
              <StatusIconTable 
                active_list={status_key_whitelist}
                icon_counts={icon_counts} 
                onIconClick={toggle_status_status_key}
                onClearClick={clear_status_filter}
              />
            </div>
          }
          <div style={{marginTop: '15px'}}>
            <form
              style={{marginBottom: "15px"}}
              onSubmit={evt => {
                evt.preventDefault();
                evt.stopPropagation();
                set_query(evt.target.querySelector('input').value);
                this.refs.focus_mount.focus();
              }}
            >
              <input 
                aria-label={text_maker("explorer_search_is_optional")}
                className="form-control input-lg"
                type="text"
                style={{width: "100%"}}
                placeholder={text_maker("filter_results")}
                onChange={evt => this.handleQueryChange(evt.target.value)}
                value={query}
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
            className="explorer-focus-mount"
            ref="focus_mount" 
            style={{position: 'relative'}}
            aria-label={text_maker("explorer_focus_mount")}
          >
            {loading_query && 
              <div className="loading-overlay">
                <div style={{height: '200px', position: 'relative'}}>
                  <SpinnerWrapper config_name={"tabbed_content"} /> 
                </div>
              </div>
            }
            {is_filtering && _.isEmpty(root.children) &&
              <div style={{fontWeight: '500', fontSize: '1.5em', textAlign: 'center'}}>  
                <TM k="search_no_results" />
              </div>
            }
            <Explorer
              config={explorer_config}
              root={root}
            />
          </div>
        </div>
      );
    }

    const tab_on_click = (doc) => set_doc !== doc && set_doc(doc, subject);

    if( docs_with_data.length === 1){ //don't wrap the inner content in a tab layout if only one option
      return inner_content;
    } else {
      return (
        <div className="tabbed-content">
          <TabbedControls
            tab_callback={ tab_on_click }
            tab_options={
              _.map(
                docs_with_data,
                (doc_with_data) => ({
                  key: doc_with_data,
                  label: /drr/.test(doc_with_data) ? 
                    <TM k="DRR_results_option_title" args={{doc_year: result_docs[doc_with_data].year}} /> :
                    <TM k="DP_results_option_title" args={{doc_year: result_docs[doc_with_data].year}} />,
                  is_open: doc_with_data === doc,
                })
              )
            }
          />
          <div className="tabbed-content__pane">
            {inner_content}
          </div>
        </div>
      );
    }
  }
}


const map_state_to_props_from_memoized_funcs = memoized_funcs => {

  const { get_scheme_props } = memoized_funcs;
  const mapRootStateToRootProps = map_state_to_root_props_from_memoized_funcs(memoized_funcs);

  return state => ({
    ...mapRootStateToRootProps(state),
    ...get_scheme_props(state),
  });
};



class SingleSubjResultsContainer extends React.Component {
  constructor(){
    super();

    this.state = {
      loading: true,
    };
  }
  componentDidMount(){
    const { 
      subject,
      docs_with_data,
    } = this.props;

    const { doc } = get_initial_single_subj_results_state({ subj_guid: subject.guid, docs_with_data });
   
    ensure_loaded({
      subject,
      results: true,
      result_docs: [doc],
    })
      .then( () => this.setState({loading: false}) );
  }
  render(){
    const { 
      subject,
      docs_with_data,
    } = this.props;
    const { loading } = this.state;

    if (loading) {
      return (
        <div style={{position: "relative", height: "80px", marginBottom: "-10px"}}>
          <SpinnerWrapper config_name={"tabbed_content"} />
        </div>
      );
    } else {
      const scheme = single_subj_results_scheme;
      const scheme_key = scheme.key;
  
      const reducer = combineReducers({
        root: root_reducer, 
        [scheme_key]: scheme.reducer,
      });
  
      const mapDispatchToProps = dispatch =>({ 
        ...map_dispatch_to_root_props(dispatch),
        ...scheme.dispatch_to_props(dispatch),
      });
  
      const mapStateToProps = map_state_to_props_from_memoized_funcs(get_memoized_funcs([ scheme ]));
  
      const initialState = {
        root: ({...initial_root_state, scheme_key}),
        [scheme_key]: get_initial_single_subj_results_state({ subj_guid: subject.guid, docs_with_data }),
      };
  
      const Container = connect(mapStateToProps, mapDispatchToProps)(SingleSubjExplorer);
      
      return (
        <Provider store={createStore( reducer, initialState, applyMiddleware(redux_promise_middleware) )}>
          <Container 
            subject={subject}
            docs_with_data={docs_with_data}
          />
        </Provider>
      );
    }
  }
}


export const declare_explore_results_panel = () => declare_panel({
  panel_key: "explore_results",
  levels: ["dept", "crso", "program"],
  panel_config_func: (level, panel_key) => ({
    footnotes: false,
    depends_on: ["programSpending", "programFtes"],
    source: (subject) => get_source_links(["DP","DRR"]),
    requires_result_counts: level === 'dept',
    requires_granular_result_counts: level !== 'dept',
    calculate(subject){
      const subject_result_counts = level === 'dept' ?
        ResultCounts.get_dept_counts(subject.id) :
        GranularResultCounts.get_subject_counts(subject.id);

      const had_doc_data = (doc) => {
        const count_key = /drr/.test(doc) ? `${doc}_total` : `${doc}_indicators`;
        return (
          !_.isUndefined(subject_result_counts) && 
          !_.isNull(subject_result_counts[count_key]) && 
          subject_result_counts[count_key] > 0
        );
      };

      const docs_with_data = _.chain(result_docs)
        .keys()
        .filter( had_doc_data )
        .value();

      if( _.isEmpty(docs_with_data) ){
        return false;
      }

      return { docs_with_data };
    },

    render({calculations, sources}){
      const { 
        subject, 
        panel_args: {
          docs_with_data,
        },
      } = calculations;

      const year_range_with_data = _.chain(docs_with_data)
        .map( doc => result_docs[doc].year)
        .thru( 
          years_with_data => ({
            first_year: years_with_data[0],
            last_year: years_with_data.length > 1 && _.last(years_with_data),
          })
        )
        .value();

      return (
        <InfographicPanel title={text_maker("result_drilldown_title", { ...year_range_with_data })} sources={sources}>
          <SingleSubjResultsContainer
            {...{
              subject,
              docs_with_data,
            }}
          />
        </InfographicPanel>
      );
    },
  }),
});
