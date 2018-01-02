const Subject = require('../models/subject.js');
const { 
  get_by_guid, 
} = Subject;

const { createSelector } = require('reselect');

const {
  filter_hierarchy,
} = require('./hierarchy_tools.js');

const {
  standard_root_display,
  create_result_tree_content_renderer,
  results_sidebar,
  single_subj_root_display,
} = require('./result_displays.js');

const {
  create_full_results_hierarchy,
} = require('./result_hierarchies.js');

const {
  Indicator,
} = require('../models/results.js');


const initial_results_state = {
  arrangement: 'granular',
  include_PAA: true,
  include_DRF: true,
  include_POs: true,
  include_dp: true,
  include_drr_met: true,
  include_drr_not_met: true,
};

const results_scheme = {
  key: 'results',
  tree_renderer: create_result_tree_content_renderer({should_show_planned_resources: false, root_renderer:standard_root_display}),
  title: 'Results',
  get_base_hierarchy_selector: () => createSelector(
    [ 
      state => state.results.doc, 
    ],
    (doc)=> create_full_results_hierarchy({doc})
  ),
  get_props_selector: () => {
    //recall that the state passed to the returned function will be augmented with the query_filtered_hierarchy. This is kind of hacky...

    const get_PAA_count = createSelector(_.property('query_filtered_hierarchy'), nodes => _.chain(nodes)
      .filter(node => node.data.type === 'dept' )
      .filter(node => node.data.subject.dp_status === 'sw' )
      .value().length
    )
    const get_DRF_count = createSelector(_.property('query_filtered_hierarchy'), nodes => _.chain(nodes)
      .filter(node => node.data.type === 'dept' )
      .filter(node => node.data.subject.dp_status === 'fw' )
      .value().length
    )

    return augmented_state => _.immutate(
      augmented_state.results, 
      {
        paa_org_count : get_PAA_count(augmented_state),
        drf_org_count: get_DRF_count(augmented_state),
      }
    );

  },
  get_filter_func_selector: () => createSelector([
    state => state.results.include_PAA, 
    state => state.results.include_DRF,
    //include_POs,
    //include_dp,
    //include_drr_met,
    //include_drr_not_met,
  ], ( include_PAA, include_DRF ) => {
    if(include_PAA && include_DRF ){
      return _.identity;
    } else {
      const dp_status = include_PAA ? "sw" : "fw";

      return flat_nodes => filter_hierarchy(flat_nodes, node => { 
        const { data: { subject} } = node;
        if(!subject){ return false; }
        if(subject.dept){ //programs and crso based hierarchies
          return (
            dp_status === 'fw' ? 
            ( subject.dept.dp_status === dp_status && !subject.dead_so && !subject.dead_program ) : //exclude old progs/crsos
            ( subject.dept_dp_status === dp_status ) //note that we don't include 'dead_so's YET because they won't contain results anyway. TODO: build this functionality if we want 
          );

        } else if(subject.dp_status){
          return subject.dp_status === dp_status;
      

        } else {
          return false;

        }
      }, { markSearchResults: false, leaves_only: false});
    }
  }),
  reducer: (state=initial_results_state, action )=> {
    const { type, payload } = action;
    //convention: to toggle a piece of state, use toggle_<key>
    if(type.indexOf('results_toggle_') > -1){
      const key = type.split('toggle_')[1];
      return _.immutate(state, { [key] : !state[key] })
    } else if(type === 'results_set_arrangement'){
      return _.immutate(state, { arrangement: payload });
    } else {
      return state;
    }
  },
  dispatch_to_props: dispatch => ({
    set_arrangement: key => dispatch({ type: 'results_set_arrangement', payload: key }),
    toggle_include_DRF: ()=> dispatch({ type: 'results_toggle_include_DRF' }),
    toggle_include_PAA: ()=> dispatch({ type: 'results_toggle_include_PAA' }),
  }),
  initial_state: initial_results_state,
  get_sidebar_content: results_sidebar,
}


const get_initial_single_subj_results_state = ({subj_guid, doc, mode, has_drr_data, has_dp_data}) => ({
  doc: has_drr_data ? 'drr16' : 'dp17',
  subject_guid: subj_guid || 'dept_1',
  status_icon_key_whitelist: [],
});

const single_subj_results_scheme = {
  key: 'single_subj_results',
  tree_renderer: create_result_tree_content_renderer({should_show_planned_resources: false, root_renderer: single_subj_root_display}),
  title: 'Single Subject Results',
  initial_state: get_initial_single_subj_results_state({}),
  get_base_hierarchy_selector: ()=> createSelector(
    [ 
      state => state.single_subj_results.doc, 
      state => state.single_subj_results.subject_guid,
    ],
    (doc, subject_guid) => create_full_results_hierarchy({ subject_guid, doc, allow_no_result_branches: false })
  ),
  get_filter_func_selector: ()=> createSelector(_.property('single_subj_results.status_icon_key_whitelist'), status_icon_key_whitelist => {
    if(_.isEmpty(status_icon_key_whitelist)){
      return _.identity;
    }
    return nodes => filter_hierarchy(
      nodes,
      node => _.includes(status_icon_key_whitelist, _.get(node,'data.indicator.icon_key')),
      { leaves_only: false, markSearchResults: false }
    );
  }),
  get_props_selector: ()=> {

    const has_sub_selector = createSelector(
      _.property('base_hierarchy'),
      hierarchy => _.some(hierarchy, node => node.data.type === 'sub_program')
    );

    const is_status_filter_enabled_selector = createSelector(
      _.property('single_subj_results.status_icon_key_whitelist'), 
      whitelist => _.nonEmpty(whitelist)
    );

    const get_subj = createSelector(_.property('single_subj_results.subject_guid'), guid => get_by_guid(guid));
  
    const get_icon_counts = createSelector(
      get_subj,
      subj => _.chain(Indicator.get_flat_indicators(subj))
        .filter({doc:'drr16'})
        .groupBy('icon_key')
        .mapValues( (group, icon_key ) => group.length )
        .value()
    );
    
    
    return augmented_state => {
      const { 
        single_subj_results: {
          mode,
          doc,
          status_icon_key_whitelist,
        },
      } = augmented_state;

      return {
        mode,
        doc,
        status_icon_key_whitelist,
        
        has_subs : has_sub_selector(augmented_state),
        subject: get_subj(augmented_state),
        icon_counts: get_icon_counts(augmented_state),
        is_status_filter_enabled: is_status_filter_enabled_selector(augmented_state),
      };
    }
  },
  dispatch_to_props: dispatch => ({ 
    set_doc: key => dispatch({type: 'set_doc', payload: key}), 
    toggle_status_icon_key: key => dispatch({type:"status_click", payload: key}),
    clear_status_filter: ()=> dispatch({type:'clear_status_filter'}),
  }),
  reducer: (state=get_initial_single_subj_results_state({}), action) => {
    const { type, payload } = action;
    switch(type){
      case 'set_doc':
        return _.immutate(state, { 
          doc: payload,
          status_icon_key_whitelist: [], //reset filtering when doc changes
        });
      case 'set_subject':
        return _.immutate(state, {subject_guid: payload});
      case 'status_click':
        return _.immutate(state, { 
          status_icon_key_whitelist: _.toggle_list(state.status_icon_key_whitelist, payload),
        });
      case 'clear_status_filter':
        return _.immutate(state, { 
          status_icon_key_whitelist: [],
        });
      default: 
        return state;
    }
  },
};

module.exports = exports = {
  results_scheme,
  get_initial_single_subj_results_state,
  single_subj_results_scheme,
}
