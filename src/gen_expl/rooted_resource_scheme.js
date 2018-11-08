import { createSelector } from 'reselect';
import { shallowEqualObjectsOverKeys } from '../core/utils.js';
import { filter_hierarchy, convert_d3_hierarchy_to_explorer_hierarchy } from './hierarchy_tools.js';
import { get_resources_for_subject } from './resource_utils.js';
import { provide_sort_func_selector } from './resource-explorer-common.js';
import { trivial_text_maker } from '../models/text.js';

function create_rooted_resource_hierarchy({doc,root_subject}){

  const get_resources = subject => get_resources_for_subject(subject, doc);

  const root = {
    root: true,
    id: 'root',
    data: {
      subject: root_subject,
    },
  };
  
  const d3_hierarchy = d3.hierarchy(root, node => {

    const {
      id: parent_id,
      data: {
        subject,
      },
    } = node;

    const description_term = trivial_text_maker('description');
    
    switch(subject.level){

      case 'tag': {
        if(!subject.is_lowest_level_tag){
          throw "Only lowest_level_tag tags allowed here";          
        }

        return _.chain(subject.programs)
          .groupBy(prog => prog.dept.sexy_name)
          .map( (progs, org_name) => (
            _.map(progs, prog => ({
              id: `${parent_id}-${prog.guid}`,
              data: {
                name: `${prog.name}`,
                subject: prog,
                resources: get_resources(prog),
                header: org_name,
                defs: [
                  {
                    term: description_term,
                    def: <div dangerouslySetInnerHTML={{__html: prog.description }} />,
                  },
                ],
              }, 
            }))
          ))
          .flatten()
          .value();
      
      }
      case 'dept': {
        return _.chain(subject.crsos)
          .map(crso => ({
            id: crso.guid,
            data: {
              subject: crso,
              name: crso.name,
              resources: get_resources(crso),
              header: crso.plural,
              defs: ( 
                _.isEmpty(crso.description) ? 
                null : 
                [{
                  term: description_term,
                  def: <div dangerouslySetInnerHTML={{__html: crso.description }} />,
                }]
              ),
            }, 
          }))
          .value();

      }

      case 'crso' : {
        return subject.programs.map(prog => ({
          id: `${parent_id}-${prog.guid}`,//due to m2m tagging, we need to include parent id here
          data: {
            resources: get_resources(prog),
            name: prog.name,
            subject: prog,
            defs: [
              {
                term: description_term,
                def: <div dangerouslySetInnerHTML={{__html: prog.description }} />,
              },
            ],
          }, 
        }));

      }

      default:
        return null;
    }


  });

  const unfiltered_flat_nodes = convert_d3_hierarchy_to_explorer_hierarchy(d3_hierarchy);


  //only allow nodes that are programs with planned spending data (and their descendants)
  const flat_nodes = filter_hierarchy(
    unfiltered_flat_nodes, 
    node => _.get(node, "data.subject.level") === 'program' && _.nonEmpty(_.get(node, "data.resources")),
    { markSearchResults: false, leaves_only: false }
  );

  return flat_nodes;

}


const get_initial_resource_state = ({subject, has_drr_data, has_dp_data }) => ({
  sort_col: 'spending',
  is_descending: true,
  doc: 'dp18',
});

const partial_scheme = {
  key: 'rooted_resources',
  get_sort_func_selector: () => provide_sort_func_selector('rooted_resources'),
  get_props_selector: () => {
    return augmented_state => _.clone(augmented_state.rooted_resources);
  },
  dispatch_to_props: dispatch => ({ 
    col_click: col_key => dispatch({type: 'column_header_click', payload: col_key }),
    set_doc: doc => dispatch({type: 'set_doc', payload: doc }),
  }),
  reducer: (state=get_initial_resource_state({}), action) => {
    const { type, payload } = action;
    if(type === 'column_header_click'){
      const { is_descending, sort_col } = state;
      const clicked_col = payload;

      const mods = clicked_col === sort_col ? { is_descending: !is_descending } : { is_descending: true, sort_col: clicked_col };

      return {...state, ...mods};
    } else if(type==="set_doc"){
      return {...state, doc: payload };
    } else {
      return state;
    }
  
  },
  shouldUpdateFlatNodes(oldSchemeState, newSchemeState){
    return !shallowEqualObjectsOverKeys(
      oldSchemeState, 
      newSchemeState, 
      ["doc"] 
    );
  },
}

//given a subject, created a rooted scheme using the above scheme. Hierarchy scheme should be evident from the level of the subject 
function create_rooted_resource_scheme({subject}){

  return {...partial_scheme,
    get_base_hierarchy_selector: () => createSelector(
      state => state.rooted_resources.doc,
      doc => create_rooted_resource_hierarchy({ 
        doc,
        root_subject: subject,
      })
    ),
  }


};


export {
  create_rooted_resource_scheme,
  get_initial_resource_state,
};

