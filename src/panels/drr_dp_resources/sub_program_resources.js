import '../../gen_expl/explorer-styles.scss';
import text from "./sub_program_resources.yaml";

import { createSelector } from 'reselect';
import classNames from 'classnames';
import { combineReducers, createStore }  from 'redux';
import { Provider, connect } from 'react-redux';

import { 
  get_col_defs,
  provide_sort_func_selector,
} from '../../gen_expl/resource-explorer-common.js';

import {
  PanelGraph,
  Subject,
  PlannedActualTable,
  Results,
  utils,
  Panel,
  create_tm_cmpnt,
} from "../shared";


import {
  get_root,
  filter_hierarchy,
  convert_d3_hierarchy_to_explorer_hierarchy,
} from '../../gen_expl/hierarchy_tools.js';

import { Explorer } from '../../components/ExplorerComponents.js';

import {
  get_memoized_funcs,
  initial_root_state,
  root_reducer,
  map_state_to_root_props_from_memoized_funcs,
  map_dispatch_to_root_props,
} from '../../gen_expl/state_and_memoizing';

const { get_by_guid } = Subject;

const [ text_maker, TM ] = create_tm_cmpnt(text);

const {
  SubProgramEntity,
  ResultCounts,
} = Results;

const { 
  shallowEqualObjectsOverKeys,
} = utils;



const sub_to_node = (sub,doc) => ({
  id: sub.id,
  data: {
    name: sub.name,
    resources: {
      ftes: (doc === 'drr16' ? sub.fte_pa_last_year : sub.fte_planning_year_1) || 0,
      spending: (doc === 'drr16' ? sub.spend_pa_last_year : sub.spend_planning_year_1) || 0,
    },
    description: sub.description,
    notes: sub.resource_notes(doc),
    subject : sub,
    resource_table_props: doc==="drr16" && {
      actual_spend: sub.spend_pa_last_year,
      planned_spend: sub.planned_spend_pa_last_year,
      diff_spend: sub.spend_pa_last_year - sub.planned_spend_pa_last_year,
      actual_ftes: sub.fte_pa_last_year,
      planned_ftes: sub.planned_fte_pa_last_year,
      diff_ftes:  sub.fte_pa_last_year - sub.planned_fte_pa_last_year,
    },
  }, 
});

function create_resource_hierarchy({program, doc}){

  const root = {
    root: true,
    id: 'root',
    data: {},
  };
  
  const d3_hierarchy = d3.hierarchy(root,node => {
    if(node.root){
      return _.map(SubProgramEntity.sub_programs(program.id), sub => sub_to_node(sub,doc) );

    } else {

      const { id } = node;

      //it's a sub or sub-sub program
      return _.map(SubProgramEntity.sub_programs(id), sub => sub_to_node(sub,doc) );

    }

  });

  const unfiltered_flat_nodes = convert_d3_hierarchy_to_explorer_hierarchy(d3_hierarchy);


  //only allow nodes that are programs with planned spending data (and their descendants)
  const flat_nodes = filter_hierarchy(
    unfiltered_flat_nodes, 
    node => true,//TODO filtering logic based on doc and resources/footnotes
    { markSearchResults: false, leaves_only: false }
  );

  return flat_nodes;
}


const get_non_col_renderer = ({doc}) => ({node}) => {

  const {
    data: {
      description,
      notes,
      resource_table_props,
    },
  } = node;

  return (
    <div>
      <div style={{padding: "10px 20px 10px 0", borderTop: "1px solid #ccc"}}>
        { description } 
      </div>
      { doc==='drr16' && 
        <div style={{padding: "10px 20px 10px 0", borderTop: "1px solid #ccc"}}>
          <PlannedActualTable {...resource_table_props} />
        </div>
      }
      { !_.isEmpty(notes) &&
        <div style={{padding: "10px 20px 10px 0", borderTop: "1px solid #ccc"}}>
          <header className="agnostic-header"> <TM k="notes" /> </header>
          <ul>
            {_.map(notes, note => 
              <li key={note}>
                <div dangerouslySetInnerHTML={{__html: note }} />   
              </li>
            )}
          </ul>
        </div>
      }
      
    </div>
  );
}



const initial_sub_program_state = {
  sort_col: 'spending',
  is_descending: true,
  doc: 'drr16',
};

const sub_program_resource_scheme = {
  key: 'sub_program_resource',
  get_sort_func_selector: ()=> provide_sort_func_selector("sub_program_resource"),
  get_props_selector: () => {
    return augmented_state => _.clone(augmented_state.sub_program_resource);
  },
  dispatch_to_props: dispatch => ({
    col_click : col_key => dispatch({type: 'column_header_click', payload: col_key }),
    set_doc: doc => dispatch({type: 'set_doc', payload: doc }),
  }),
  reducer: (state=initial_sub_program_state, action) => {
    const { type, payload } = action;

    if(type === 'column_header_click'){
      const { is_descending, sort_col } = state;
      const clicked_col = payload;

      const mods = clicked_col === sort_col ? { is_descending : !is_descending } : { is_descending: true, sort_col : clicked_col };

      return {...state, ...mods};
    } else if(type==="set_doc"){
      return {...state, doc: payload };
    } else {
      return state;
    }
  
  },
  get_base_hierarchy_selector: () => createSelector(
    state => state.sub_program_resource.doc,
    state => state.sub_program_resource.subj_guid,
    (doc, subj_guid) =>  create_resource_hierarchy({ 
      program: get_by_guid(subj_guid),
      doc,
    })
  ),
  shouldUpdateFlatNodes(oldSchemeState, newSchemeState){
    return !shallowEqualObjectsOverKeys(
      oldSchemeState, 
      newSchemeState, 
      ["doc"] 
    );
  },
}

class SubProgramResourceTree extends React.Component {
  constructor(){
    super()
    this.state = { _query : "" };
  }
  render(){
    const {
      has_dp_data,
      has_drr_data,
      get_text,

      flat_nodes,
      doc,
      set_doc,
      sort_col,
      is_descending,
      col_click,
      
      toggle_node,
    } = this.props;

    const root = get_root(flat_nodes);

    const explorer_config = {
      column_defs: get_col_defs({doc}),
      onClickExpand: id => toggle_node(id),
      is_sortable: true,
      zebra_stripe: true,
      get_non_col_content: get_non_col_renderer({doc}),
      col_click,
    } 

    const inner_content = <div>

      <div style={{marginBottom: '20px'}}>
        {get_text(doc)}
      </div>
      <div>
        <Explorer
          config={explorer_config}
          root={root}
          col_state={{
            sort_col,
            is_descending,
          }}
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
            <span tabIndex={0} role="button" aria-pressed={doc === "drr16"} className="tab_label_text" onClick={()=> tab_on_click('drr16')} onKeyDown={(e)=> (e.keyCode===13 || e.keyCode===32) && tab_on_click('drr16')}>
              <TM k="sub_program_DRR_title" />
            </span>
          </li>
          <li className={classNames("tab_label", doc==="dp18" && "active_tab")} onClick={()=> tab_on_click('dp18')}>
            <span tabIndex={0} role="button" aria-pressed={doc === "dp18"} className="tab_label_text" onClick={()=> tab_on_click('dp18')} onKeyDown={(e)=> (e.keyCode===13 || e.keyCode===32) && tab_on_click('dp18')}>
              <TM k="sub_program_DP_title" />
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

const SubProgramResourceTreeContainer = ({
  subject, 
  has_dp_data, 
  has_drr_data, 
  get_text,
}) => {

  const initial_scheme_state_slice = {
    doc: has_drr_data ? 'drr16' : 'dp18',
    subj_guid: subject.guid, 
  };


  const scheme = sub_program_resource_scheme;
  const scheme_key = scheme.key;

  const reducer = combineReducers({
    root: root_reducer, 
    [scheme_key]: scheme.reducer,
  });

  const mapStateToProps = map_state_to_props_from_memoized_funcs(get_memoized_funcs([scheme]));

  const mapDispatchToProps = dispatch => ({
    ...map_dispatch_to_root_props(dispatch),
    ...scheme.dispatch_to_props(dispatch),
  });

  const initialState = {
    root: ({...initial_root_state, scheme_key}),
    [scheme_key] : ({...initial_sub_program_state, ...initial_scheme_state_slice}),
  };

  const Container = connect(mapStateToProps, mapDispatchToProps)(SubProgramResourceTree)

  return (
    <Provider store={createStore(reducer,initialState)}>
      <Container 
        {...{ 
          subject, 
          has_dp_data, 
          has_drr_data, 
          get_text,
        }} 
      />
    </Provider>
  );

};


new PanelGraph({
  key: "sub_program_resources",
  level: 'program',
  requires_results: true,
  requires_result_counts: true,
  footnotes:false,
  depends_on : ['table12'],
  source: false,
  calculate(subject){
    
    const t12_q = this.tables.table12.q(subject);

    const dp_ftes = t12_q.sum("{{planning_year_1}}");
    const drr_ftes = t12_q.sum("{{pa_last_year}}");

    const subs = SubProgramEntity.sub_programs(subject.id);

    const drr_subs = _.filter(subs, 'has_drr_resources');
    const drr_sub_subs = _.chain(drr_subs).map( ({id}) => SubProgramEntity.sub_programs(id) ).flatten().filter('has_drr_resources').value();

    const dp_subs = _.filter(subs, 'has_dp_resources');
    const dp_sub_subs = _.chain(drr_subs).map( ({id}) => SubProgramEntity.sub_programs(id) ).flatten().filter('has_dp_resources').value();


    if(_.isEmpty( dp_subs.concat(drr_subs) ) ){
      return false;
    }

    const counts = ResultCounts.get_dept_counts(subject.dept.acronym);
    const has_drr_data = counts && counts.drr16_total > 0 && _.nonEmpty(drr_subs);
    const has_dp_data = _.nonEmpty(dp_subs) && !subject.dead_program;

    return {
      dp_subs,
      dp_sub_subs,
      dp_ftes,
      has_dp_data,

      drr_subs,
      drr_sub_subs,
      drr_ftes, 
      has_drr_data,
    };
  },

  render({calculations, footnotes, sources}){
    const { 
      subject, 
      graph_args: {
        dp_ftes,
        dp_subs,
        dp_sub_subs,
        has_dp_data,

        drr_ftes, 
        drr_subs,
        drr_sub_subs,
        has_drr_data,
      },
    } = calculations;


    let title_key = "sub_program_resources_title__both";
    if(!has_dp_data){
      title_key = "sub_program_resources_title__drr";
    } else if(!has_drr_data){
      title_key = "sub_program_resources_title__dp";
    }
 
    return (
      <Panel
        title={text_maker(title_key)}
        {...{footnotes,sources}}
      >
        <SubProgramResourceTreeContainer 
          subject={subject} 
          has_dp_data={has_dp_data}
          has_drr_data={has_drr_data}
          get_text={doc => 
            <TM
              k={
                doc === 'drr16' ? 
                "sub_program_resources_drr_text" : 
                "sub_program_resources_dp_text" 
              }
              args={
                doc === 'drr16' ?
                {
                  subject,
                  num_subs: drr_subs.length,
                  has_sub_subs : _.nonEmpty(drr_sub_subs),
                  num_sub_subs: drr_sub_subs.length,
                  ftes: drr_ftes,
                } :
                {
                  subject,
                  num_subs: dp_subs.length,
                  has_sub_subs : _.nonEmpty(dp_sub_subs),
                  num_sub_subs: dp_sub_subs.length,
                  ftes: dp_ftes,
                }
              }
            />
          }
        />
      </Panel>
    );
  },
});
