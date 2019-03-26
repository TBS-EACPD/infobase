import { TM, text_maker } from './result_text_provider.js';
import { createSelector } from 'reselect';
import classNames from 'classnames';
import { Explorer } from '../../components/ExplorerComponents';
import { 
  PanelGraph, 
  util_components, 
  infograph_href_template, 
  Panel,
  TabbedControls,
} from '../shared';
import { Details } from '../../components/Details.js';
import { 
  Indicator,
  ResultCounts,
  GranularResultCounts,
} from './results_common.js';
import { StatusIconTable, InlineStatusIconList } from './components.js';
const { SpinnerWrapper, Format, TextAbbrev } = util_components;

//drilldown stuff
import { combineReducers, createStore, applyMiddleware } from 'redux';
import redux_promise_middleware from 'redux-promise-middleware';
import { Provider, connect } from 'react-redux';
import { get_root } from '../../gen_expl/hierarchy_tools.js';
import { single_subj_results_scheme, get_initial_single_subj_results_state } from '../../gen_expl/results_scheme.js';
import { 
  get_type_name, 
  ResultNodeContent, 
  spending_header, 
  fte_header, 
  ResultCounts as ResultCountsComponent,
} from '../../gen_expl/result_displays.js';
import { 
  get_memoized_funcs, 
  initial_root_state, 
  root_reducer, 
  map_state_to_root_props_from_memoized_funcs, 
  map_dispatch_to_root_props, 
} from '../../gen_expl/state_and_memoizing';

import { ensure_loaded } from '../../core/lazy_loader.js';

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

      return <div>
        <dl className={classNames("dl-horizontal dl-no-bold-dts", window.lang === "en" ? "dl-long-terms" : "dl-really-long-terms")}>
          <dt> <span className="nowrap">{spending_header(doc) }</span> </dt>
          <dd> <Format type="compact1" content={resources ? resources.spending : 0} /> </dd>
          <dt> <span className="nowrap">{fte_header(doc) }</span> </dt>
          <dd> <Format type="big_int_real" content={resources ? resources.ftes : 0} /> </dd>
        </dl>
        {_.includes(['program','dept','cr'],type) && 
          <div className="ExplorerNode__BRLinkContainer">
            <a href={infograph_href_template(subject)}> 
              <TM k="see_infographic" />    
            </a>
          </div>
        }
      </div>
    }
  }
)

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
        .value()
    }
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

          if(doc !== 'drr17'){
            return null;
          }

          return (
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
          )
        },
        width: 200,
        textAlign: "right",
      },
    ];
  }
)

class SingleSubjExplorer extends React.Component {
  constructor(){
    super()
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
      has_drr_data,
      has_dp_data,

      base_hierarchy, 
      flat_nodes,
      is_filtering,

      set_query,
      toggle_node,

      subject,
      
      //...scheme_props
      data_loading,
      doc,
      set_doc,
      has_subs,
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

    let inner_content = (
      <div style={{ paddingTop: "100px", marginBottom: "-40px" }}>
        <SpinnerWrapper config_name={"sub_route"} />
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
          {doc==='drr17' &&  
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
          { has_subs && 
            <Details
              summary_content={
                <TM k="where_can_find_subs_question" />
              }
              content={
                <div style={{margin: "10px 0"}}>
                  <TM k="where_can_find_subs_answer" />
                </div>
              }
            />
          }
          { _.get(base_hierarchy, "length") > 30 && 
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
          }
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
                  <SpinnerWrapper config_name={"sub_route"} /> 
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

    if(!has_dp_data || !has_drr_data){ //don't wrap the inner content in a tab layout
      return inner_content;
    } else {
      return (
        <div className="tabbed-content">
          <TabbedControls
            tab_callback={ tab_on_click }
            tab_options={[
              {
                key: "drr17", 
                label: <TM k="DRR_results_option_title" />,
                is_open: doc === "drr17",
              },
              {
                key: "dp18", 
                label: <TM k="DP_results_option_title_last_year" />,
                is_open: doc === "dp18",
              },
              {
                key: "dp19", 
                label: <TM k="DP_results_option_title" />,
                is_open: doc === "dp19",
              },
            ]}
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
}



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
      has_dp_data,
      has_drr_data,
    } = this.props;

    const { doc } = get_initial_single_subj_results_state({ subj_guid: subject.guid, has_drr_data, has_dp_data });
   
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
      has_dp_data,
      has_drr_data,
    } = this.props;
    const { loading } = this.state;

    if (loading) {
      return (
        <div style={{position: "relative", height: "80px", marginBottom: "-10px"}}>
          <SpinnerWrapper config_name={"sub_route"} />
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
        [scheme_key]: get_initial_single_subj_results_state({ subj_guid: subject.guid, has_drr_data, has_dp_data }),
      };
  
      const Container = connect(mapStateToProps, mapDispatchToProps)(SingleSubjExplorer);
      
      return (
        <Provider store={createStore( reducer, initialState, applyMiddleware(redux_promise_middleware) )}>
          <Container 
            subject={subject}
            has_dp_data={has_dp_data}
            has_drr_data={has_drr_data}
          />
        </Provider>
      );
    }
  }
}

_.each(['program','dept','crso'], lvl => {

  new PanelGraph({
    source: false,
    level: lvl,
    footnotes: false,
    depends_on: ["programSpending", "programFtes"],
    requires_result_counts: lvl === 'dept',
    requires_granular_result_counts: lvl !== 'dept',
    key: "explore_results",
    calculate(subject){
      const subject_result_counts = lvl === 'dept' ?
        ResultCounts.get_dept_counts(subject.id) :
        GranularResultCounts.get_subject_counts(subject.id);

      const has_dp_data = !_.isUndefined(subject_result_counts) && !_.isNull(subject_result_counts.dp19_indicators) && subject_result_counts.dp19_indicators > 0;
      const has_drr_data = !_.isUndefined(subject_result_counts) && !_.isNull(subject_result_counts.drr17_total) && subject_result_counts.drr17_total > 0;

      if(!has_dp_data && !has_drr_data){
        return false;
      }

      return {
        has_dp_data,
        has_drr_data,
      };
    },

    render({calculations}){
      const { 
        subject, 
        graph_args: {
          has_dp_data,
          has_drr_data,
        },
      } = calculations;

      return (
        <Panel title={text_maker("result_drilldown_title", { has_dp_data, has_drr_data })}>
          <SingleSubjResultsContainer
            {...{
              subject,
              has_dp_data,
              has_drr_data,
            }}
          />
        </Panel>
      );

    },
  });

});
