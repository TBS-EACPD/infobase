import { Subject } from '../models/subject.js';

import { createSelector } from 'reselect';

import { filter_hierarchy } from './hierarchy_tools.js';

import { create_full_results_hierarchy } from './result_hierarchies.js';

import { Indicator } from '../models/results.js';

const { 
  get_by_guid, 
} = Subject;


export const get_initial_single_subj_results_state = ({subj_guid, doc, mode, has_drr_data, has_dp_data}) => ({
  doc: has_dp_data ? 'dp18': "drr17",
  subject_guid: subj_guid || 'dept_1',
  status_status_key_whitelist: [],
});

export const single_subj_results_scheme = {
  key: 'single_subj_results',
  title: 'Single Subject Results',
  initial_state: get_initial_single_subj_results_state({}),
  get_sort_func_selector: ()=> _.constant(list => _.sortBy(list, "data.name")),
  get_base_hierarchy_selector: ()=> createSelector(
    [ 
      state => state.single_subj_results.doc, 
      state => state.single_subj_results.subject_guid,
    ],
    (doc, subject_guid) => create_full_results_hierarchy({ subject_guid, doc, allow_no_result_branches: false })
  ),
  get_filter_func_selector: ()=> createSelector(_.property('single_subj_results.status_status_key_whitelist'), status_status_key_whitelist => {
    if(_.isEmpty(status_status_key_whitelist)){
      return _.identity;
    }
    return nodes => filter_hierarchy(
      nodes,
      node => _.includes(status_status_key_whitelist, _.get(node,'data.indicator.status_key')),
      { leaves_only: false, markSearchResults: false }
    );
  }),
  get_props_selector: ()=> {

    const has_sub_selector = createSelector(
      _.property('base_hierarchy'),
      hierarchy => _.some(hierarchy, node => node.data.type === 'sub_program')
    );

    const is_status_filter_enabled_selector = createSelector(
      _.property('single_subj_results.status_status_key_whitelist'), 
      whitelist => _.nonEmpty(whitelist)
    );

    const get_subj = createSelector(_.property('single_subj_results.subject_guid'), guid => get_by_guid(guid));
  
    const get_icon_counts = createSelector(
      get_subj,
      subj => _.chain(Indicator.get_flat_indicators(subj))
        .filter({doc: 'drr17'})
        .groupBy('status_key')
        .mapValues( (group, status_key ) => group.length )
        .value()
    );
    
    
    return augmented_state => {
      const { 
        single_subj_results: {
          mode,
          doc,
          status_status_key_whitelist,
        },
      } = augmented_state;

      return {
        mode,
        doc,
        status_status_key_whitelist,
        
        has_subs: has_sub_selector(augmented_state),
        subject: get_subj(augmented_state),
        icon_counts: get_icon_counts(augmented_state),
        is_status_filter_enabled: is_status_filter_enabled_selector(augmented_state),
      };
    }
  },
  dispatch_to_props: dispatch => ({ 
    set_doc: key => dispatch({type: 'set_doc', payload: key}), 
    toggle_status_status_key: key => dispatch({type: "status_click", payload: key}),
    clear_status_filter: ()=> dispatch({type: 'clear_status_filter'}),
  }),
  reducer: (state=get_initial_single_subj_results_state({}), action) => {
    const { type, payload } = action;
    switch(type){
      case 'set_doc':
        return {...state,
          doc: payload,
          status_status_key_whitelist: [], //reset filtering when doc changes
        };
      case 'set_subject':
        return {...state, subject_guid: payload};
      case 'status_click':
        return {...state, 
          status_status_key_whitelist: _.toggle_list(state.status_status_key_whitelist, payload),
        };
      case 'clear_status_filter':
        return {...state, 
          status_status_key_whitelist: [],
        };
      default: 
        return state;
    }
  },
};
