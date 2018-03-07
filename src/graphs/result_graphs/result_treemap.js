
const classNames = require('classnames');

const {
  PanelGraph,
  reactAdapter,
  text_maker,
  util_components: {
    TextMaker,
    TM,
    SpinnerWrapper,
  },
} = require("../shared");
const { Details } = require('../../components/Details.js');

require("./result_treemap.ib.yaml");

const { 
  Indicator,
} = require('./results_common.js');

const {
  StatusIconTable, 
} = require('./components.js')


//treemap stuff
const { combineReducers, createStore } = require('redux');
const { Provider, connect } = require('react-redux');

const {
  get_root,
} = require('../../gen_expl/hierarchy_tools.js');

const { 
  single_subj_results_scheme,
  get_initial_single_subj_results_state,
} = require('../../gen_expl/results_scheme.js');

const {
  get_type_header,
} = require('../../gen_expl/result_displays.js');


const { GeneralTree } = require('../../gen_expl/GeneralTree.js');


const {
  get_memoized_funcs,
  initial_root_state,
  root_reducer,
  map_state_to_root_props_from_memoized_funcs,
  map_dispatch_to_root_props,
} = require('../../gen_expl/state_and_memoizing');





const negative_search_relevance_func = ({ is_search_match }) => is_search_match ? 0 : 1;
const main_sort_func = list => _.chain(list) //sort by search relevance, than the initial sort func
  .sortBy(node => node.data.name)
  .sortBy(negative_search_relevance_func)
  .sortBy(node => node.data.type === 'result' ? node.data.result.is_efficiency : null)
  .value();


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


    const sort_func = main_sort_func; //TODO: implement custom sorting based on scheme state

    const root = get_root(flat_nodes);

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
            <TextMaker text_key="search_no_results" />
          </div>
        }
        { 
          React.createElement(GeneralTree, {
            root,
            onToggleNode: toggle_node,
            renderNodeContent: single_subj_results_scheme.tree_renderer,
            sort_func,
            is_searching : is_filtering,
            scheme_props: { 
              doc,
              is_status_filter_enabled,
              status_icon_key_whitelist,
            },
          })
        }
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
              <TextMaker text_key="DRR_results_option_title" />
            </span>
          </li>
          <li className={classNames("tab_label", doc==="dp17" && "active_tab")} onClick={()=> tab_on_click('dp17')}>
            <span 
              tabIndex={0}
              role="button"
              aria-pressed={doc === "dp17"}
              className="tab_label_text"
              onClick={()=> tab_on_click('dp17')}
              onKeyDown={(e)=> (e.keyCode===13 || e.keyCode===32)&& tab_on_click('dp17')}
            >
              <TextMaker text_key="DP_results_option_title" />
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

const ResultCounts = ({ base_hierarchy, doc, subject }) => {

  const indicators = _.filter(Indicator.get_flat_indicators(subject), {doc} )

  const indicator_count_obj = { 
    count: indicators.length, 
    type_key: 'indicator',
    type_name: text_maker('indicators'),
  };

  const count_items  = _.chain(base_hierarchy)
    .reject('root')
    .groupBy(node => get_type_header(node) )
    .map( (group, type_name) => ({
      type_name,
      type_key: group[0].data.type,
      count: group.length,
    }))
    .concat([ indicator_count_obj ])
    //.sortBy( ({type_key}) => _.indexOf(sorted_count_header_keys, type_key))
    .map( ({type_key, count}) => [type_key, count] )
    .fromPairs()
    .value();

  let text_key = "";
  if(subject.level === 'dept'){
    if(doc === 'drr16'){
      if(count_items.sub_program > 0){
        if(count_items.sub_sub_program > 0){
          text_key = "result_counts_drr_dept_sub_sub";
        } else {
          text_key = "result_counts_drr_dept_sub";
        }
      } else {
        text_key = "result_counts_drr_dept_no_subs";
      }

    } else {

      if(subject.is_DRF){
        text_key = "result_counts_dp_dept_drf"

      } else {
        if(count_items.sub_program > 0){
          if(count_items.sub_sub_program > 0){
            text_key = "result_counts_dp_dept_paa_sub_sub"
          } else {
            text_key = "result_counts_dp_dept_paa_sub"
          }
        } else {
          text_key = "result_counts_dp_dept_paa_no_subs"
        }
      }
    //dp dept
    }
  //dept
  } else if(subject.level === 'program'){
    if(doc==='drr16'){
      if(count_items.sub_program > 0){
        if(count_items.sub_sub_program > 0){
          text_key = "result_counts_drr_prog_paa_sub_sub";
        } else {
          text_key = "result_counts_drr_prog_paa_sub";
        }
      } else {
        text_key = "result_counts_drr_prog_paa_no_subs";
      }
    } else {
      if(count_items.sub_program > 0){
        if(count_items.sub_sub_program > 0){
          text_key = "result_counts_dp_prog_paa_sub_sub";
        } else {
          text_key = "result_counts_dp_prog_paa_sub";
        }
      } else {
        text_key = "result_counts_dp_prog_paa_no_subs";
      }
    } 

  } else if(subject.level === 'crso'){
    //we only care about CRs, which are only DP
    text_key = "result_counts_dp_crso_drf";

  }

  return (
    <div className="medium_panel_text">
      <TextMaker 
        text_key={text_key}
        args={{
          subject,

          num_programs:count_items.program,
          num_results:count_items.result,
          num_indicators:count_items.indicator,

          num_subs:count_items.sub_program,
          num_sub_subs:count_items.sub_sub_program,

          num_drs:count_items.dr,
          num_crs:count_items.cr,
        }}

      />
    </div>
  );
}

const map_state_to_props_from_memoized_funcs = memoized_funcs => {

  const  { get_scheme_props } = memoized_funcs;
  const mapRootStateToRootProps = map_state_to_root_props_from_memoized_funcs(memoized_funcs);

  return state => _.immutate(
    mapRootStateToRootProps(state),
    get_scheme_props(state)
  );
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

    const mapDispatchToProps = dispatch =>_.immutate( 
      map_dispatch_to_root_props(dispatch),
      scheme.dispatch_to_props(dispatch)
    );

    const mapStateToProps = map_state_to_props_from_memoized_funcs(get_memoized_funcs([ scheme ]));

    const initialState = {
      root: _.immutate(initial_root_state, {scheme_key}),
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


const title_key = "result_treemap_title";
_.each(['program','dept','crso'], lvl => {

  new PanelGraph({
    level: lvl,
    footnotes: false,
    requires_results: true,
    key: "explore_results",
    layout: {
      full: { graph: 12},
      half: { graph: 12},
    },
    title: title_key,
    calculate(subject){

      const indicators = Indicator.get_flat_indicators(subject);

      const has_dp_data = _.find(indicators, {doc: 'dp17'});
      const has_drr_data = _.find(indicators, {doc: 'drr16'});

      if(!has_dp_data && !has_drr_data){
        return false;
      }

      return {
        has_dp_data,
        has_drr_data,
      };

    },
    render(panel, calculations){
      const { 
        subject, 
        graph_args: {
          has_dp_data,
          has_drr_data,
        },
      } = calculations;

      panel.areas().title.html(text_maker(title_key,{ has_dp_data, has_drr_data }));
      
      const node = panel.areas().graph.node();
      reactAdapter.render(
        <SingleSubjResultsContainer 
          subject={subject} 
          has_dp_data={has_dp_data}
          has_drr_data={has_drr_data}
        />, 
        node
      );

    },
  });

});
