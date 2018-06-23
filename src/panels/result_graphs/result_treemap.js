import { result_laggards } from '../../shameful.js';
import { TM, text_maker } from './result_text_provider.js';
import { createSelector } from 'reselect';
import classNames from 'classnames';
import { Explorer } from '../../components/ExplorerComponents';
import { 
  PanelGraph, 
  util_components, 
  infograph_href_template, 
  Panel,
} from '../shared';
import { Details } from '../../components/Details.js';
import { Indicator } from './results_common.js';
import { StatusIconTable, InlineStatusIconList } from './components.js';

const { SpinnerWrapper, Format, Abbrev } = util_components;

//treemap stuff
import { combineReducers, createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import { get_root } from '../../gen_expl/hierarchy_tools.js';
import { single_subj_results_scheme, get_initial_single_subj_results_state } from '../../gen_expl/results_scheme.js';
import { 
  get_type_name, 
  ResultNodeContent, 
  spending_header, 
  fte_header, 
  ResultCounts,
} from '../../gen_expl/result_displays.js';
import { 
  get_memoized_funcs, 
  initial_root_state, 
  root_reducer, 
  map_state_to_root_props_from_memoized_funcs, 
  map_dispatch_to_root_props, 
} from '../../gen_expl/state_and_memoizing';


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
        {resources && 
          <dl className="dl-horizontal dl-long-terms dl-no-bold-dts">
            <dt> <span className="nowrap">{spending_header(doc) }</span> </dt>
            <dd> <Format type="compact1" content={resources.spending} /> </dd>
            <dt> <span className="nowrap">{fte_header(doc) }</span> </dt>
            <dd> <Format type="big_int_real" content={resources.ftes} /> </dd>
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
    }
  }
)

const get_children_grouper = createSelector(
  _.identity,
  ()=> {

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
  _.property('status_icon_key_whitelist'),
  (doc, is_status_filter_enabled, status_icon_key_whitelist) => {
    return [
      {
        id: "name",
        get_val: ({data, isExpanded}) => (
          isExpanded ? 
          data.name : 
          <Abbrev text={data.name} len={115} />
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

          if(doc !== 'drr16'){
            return null;
          }

          return (
            <div
              aria-hidden={true}
              style={{ opacity: 0.8 }}
            >
              <InlineStatusIconList 
                indicators={
                  _.filter(
                    (
                      result ?
                      result.indicators :
                      Indicator.get_flat_indicators(subject)
                    ),
                    (
                      is_status_filter_enabled ? 
                      ind => _.includes(status_icon_key_whitelist, ind.icon_key) :
                      _.constant(true)
                    )
                  )
                } 
              />
            </div>
          )
        },
        width: 150,
        textAlign: "right",
      },
    ];
  }
)

class SingleSubjExplorer extends React.Component {
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
      has_drr_data,
      has_dp_data,

      base_hierarchy, 
      flat_nodes,
      is_filtering,

      set_query,
      toggle_node,
      
      //...scheme_props
      doc,
      set_doc,
      has_subs,
      icon_counts,
      toggle_status_icon_key,
      clear_status_filter,
      is_status_filter_enabled,
      status_icon_key_whitelist,              
    } = this.props;
    const { loading } = this.state;


    const root = get_root(flat_nodes);

    const explorer_config = {
      children_grouper: get_children_grouper({doc}),
      column_defs: get_col_defs({doc, is_status_filter_enabled, status_icon_key_whitelist}),
      shouldHideHeader: true,
      zebra_stripe: true,
      onClickExpand: id => toggle_node(id),
      get_non_col_content: get_non_col_content_func({doc}),
    };

    const inner_content = <div>

      <div style={{ marginTop: "10px" }}>
        <ResultCounts {...this.props} />
      </div>
      {doc==='drr16' &&  
        <div 
          style={{
            padding: '10px 10px',
            marginTop: "20px",
            marginBottom: "20px",
          }}
        >
          <StatusIconTable 
            active_list={status_icon_key_whitelist}
            icon_counts={icon_counts} 
            onIconClick={toggle_status_icon_key}
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
              style={{width:"100%"}}
              placeholder={text_maker("filter_results")}
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
      }
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
        />
      </div>
    </div>;

    const tab_on_click = (doc)=> set_doc!==doc && set_doc(doc);

    if(!has_dp_data || !has_drr_data){ //don't wrap the inner content in a tab layout
      return inner_content;
    } else {
      return <div className="tabbed_content">
        <ul className="tabbed_content_label_bar">
          <li className={classNames("tab_label", doc==="drr16" && "active_tab")} onClick={()=> tab_on_click('drr16')}>
            <span 
              tabIndex={0}
              role="button"
              aria-pressed={doc === "drr16"}
              className="tab_label_text" 
              onClick={()=> tab_on_click('drr16')}
              onKeyDown={(e)=> (e.keyCode===13 || e.keyCode===32) && tab_on_click('drr16')}
            >
              <TM k="DRR_results_option_title" />
            </span>
          </li>
          <li className={classNames("tab_label", doc==="dp18" && "active_tab")} onClick={()=> tab_on_click('dp18')}>
            <span 
              tabIndex={0}
              role="button"
              aria-pressed={doc === "dp18"}
              className="tab_label_text"
              onClick={()=> tab_on_click('dp18')}
              onKeyDown={(e)=> (e.keyCode===13 || e.keyCode===32)&& tab_on_click('dp18')}
            >
              <TM k="DP_results_option_title" />
            </span>
          </li>
        </ul>
        <div className="tabbed_content_pane">
          {inner_content}
        </div>
      </div>;

    }

  }
}



const map_state_to_props_from_memoized_funcs = memoized_funcs => {

  const  { get_scheme_props } = memoized_funcs;
  const mapRootStateToRootProps = map_state_to_root_props_from_memoized_funcs(memoized_funcs);

  return state => ({
    ...mapRootStateToRootProps(state),
    ...get_scheme_props(state),
  });
}



class SingleSubjResultsContainer extends React.Component {
  render(){
    const { 
      subject,
      has_dp_data,
      has_drr_data,
    } = this.props;

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
      [scheme_key]: get_initial_single_subj_results_state({ subj_guid: subject.guid, has_drr_data, has_dp_data  }),
    };

    const Container = connect(mapStateToProps, mapDispatchToProps)(SingleSubjExplorer)

    return (
      <Provider store={createStore(reducer,initialState)}>
        <Container 
          subject={subject}
          has_dp_data={has_dp_data}
          has_drr_data={has_drr_data}
        />
      </Provider>
    );

  }

}


_.each(['program','dept','crso'], lvl => {

  new PanelGraph({
    source: false,
    level: lvl,
    footnotes: false,
    depends_on: ["table6", "table12"],
    requires_results: true,
    key: "explore_results",
    calculate(subject){

      const indicators = Indicator.get_flat_indicators(subject);
      const org_id = (
        subject.level === "dept" ?
        subject.id :
        subject.dept.id
      );

      const has_dp_data = _.find(indicators, {doc: 'dp18'}) && !_.includes(result_laggards, org_id)
      const has_drr_data = _.find(indicators, {doc: 'drr16'});

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
        <Panel title={text_maker("result_treemap_title", { has_dp_data, has_drr_data})}>
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
