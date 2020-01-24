import { createSelector } from 'reselect';

import { provide_sort_func_selector, get_resources_for_subject } from '../explorer_common/resource_explorer_common.js';
import { filter_hierarchy, convert_d3_hierarchy_to_explorer_hierarchy } from '../explorer_common/hierarchy_tools.js';

import { infograph_href_template } from '../link_utils.js';
import { shallowEqualObjectsOverKeys, sanitized_dangerous_inner_html } from '../general_utils.js';
import { HeightClipper } from '../components/index.js';
import { Subject } from '../models/subject.js';
import { year_templates} from '../models/years.js';
import { trivial_text_maker as text_maker } from '../models/text.js';

const { 
  Tag,
  Dept, 
  Ministry, 
} = Subject;

const { planning_years } = year_templates;
const planning_year = _.first(planning_years);


const non_rolling_up_schemes = ['HWH', 'WWH', 'HI'];

const related_tags_row = (related_tags, subject_type) => {
  const term = subject_type === "program" ? 
    text_maker('related_tags_for_program') : 
    text_maker('related_tags');
  
  const list_content = (
    <ul className="ExplorerNode__List">
      {_.map(related_tags, related_tag =>
        <li key={related_tag.id}>
          <a href={infograph_href_template(related_tag)} >
            {related_tag.name} 
          </a>
        </li>
      )}
    </ul>
  );
  const def = related_tags.length > 6 ?
    <HeightClipper 
      allowReclip={true} 
      clipHeight={110}
      children={list_content} 
    /> :
    list_content;

  return {
    term,
    def,
  };
};

function create_resource_hierarchy({hierarchy_scheme, year}){

  const get_resources = subject => get_resources_for_subject(subject, year);

  const root = {
    root: true,
    id: 'root',
    data: {},
  };
  
  const d3_hierarchy = d3.hierarchy(root, node => {
    if(!_.isEmpty(node.children)){
      return node.children; //shortcut: if children is already defined, use it.
    }

    if(node === root){//if there is no root subject, we use all departments as children of the root.
      switch(hierarchy_scheme){

        case 'GOCO':
        case 'HWH':
        case 'WWH':
        case 'CCOFOG':
        case 'HI':
          return _.map(Tag.lookup(hierarchy_scheme).children_tags, tag => ({
            id: tag.guid,
            data: {
              name: tag.name,
              resources: _.includes(non_rolling_up_schemes, hierarchy_scheme) ? null : get_resources(tag),
              subject: tag,
              defs: tag.is_lowest_level_tag && _.compact(
                [
                  !_.isEmpty(tag.description) && {
                    term: text_maker('description'),
                    def: <div dangerouslySetInnerHTML={sanitized_dangerous_inner_html(tag.description)} />,
                  },
                  tag.is_m2m && !_.isEmpty( tag.related_tags() ) && 
                    related_tags_row( tag.related_tags(), "tag" ),
                ]
              ),  
            },
          }));

        case 'min':
          return _.chain( Ministry.get_all() )
            .map(min => ({
              id: min.guid,
              data: {
                name: min.name,
                subject: min,
                resources: get_resources(min),
              },
              children: _.chain(min.orgs)
                .map(org => ({
                  id: org.guid,
                  data: {
                    name: org.name,
                    subject: org,
                    resources: get_resources(org),
                  },
                }))
                .value(), 
            }))
            .value();

        case 'dept':
          return _.chain(Dept.get_all())
            .map(org => ({
              id: org.guid,
              data: {
                name: org.name,
                subject: org,
                resources: get_resources(org),
              },
            }))
            .value();
      }
    } 

    const {
      id: parent_id,
      data: {
        subject,
      },
    } = node;

    switch(subject.level){

      case 'tag': {
        if(subject.is_lowest_level_tag){
          return _.chain(subject.programs)
            .map( 
              prog => ({
                id: `${parent_id}-${prog.guid}`,
                data: {
                  name: `${prog.name} (${prog.dept.abbr || prog.dept.name})`,
                  subject: prog,
                  resources: get_resources(prog),
                  defs: _.compact([
                    {
                      term: text_maker('org'),
                      def: <a href={infograph_href_template(prog.dept)}> {prog.dept.name} </a>,
                    },
                    {
                      term: text_maker('description'),
                      def: <div dangerouslySetInnerHTML={sanitized_dangerous_inner_html(prog.description)} />,
                    },
                    subject.is_m2m && !_.isEmpty( _.filter(prog.tags_by_scheme[subject.root.id], tag => tag.id !== subject.id) ) && 
                      related_tags_row( _.filter(prog.tags_by_scheme[subject.root.id], tag => tag.id !== subject.id), "program" ),
                  ]),
                }, 
              })
            )
            .value();
        } else if( !_.isEmpty(subject.children_tags) ){
          return _.map(
            subject.children_tags, 
            tag => ({
              id: tag.guid,
              data: {
                name: tag.name,
                subject: tag,
                resources: get_resources(tag),
                defs: tag.description && [
                  {
                    term: text_maker('description'),
                    def: <div dangerouslySetInnerHTML={sanitized_dangerous_inner_html(tag.description)} />,
                  },
                ],
              },
            })
          );
        }

        break;
      }
      case 'dept': {
        return _.chain(subject.crsos)
          .map(crso => ({
            id: crso.guid,
            data: {
              subject: crso,
              name: crso.name,
              resources: get_resources(crso),
              defs: ( 
                _.isEmpty(crso.description) ? 
                  null : 
                  [{
                    term: text_maker('description'),
                    def: <div dangerouslySetInnerHTML={sanitized_dangerous_inner_html(crso.description)} />,
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
                term: text_maker('description'),
                def: <div dangerouslySetInnerHTML={sanitized_dangerous_inner_html(prog.description)} />,
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
    node => _.get(node, 'data.subject.level') === 'program' && _.nonEmpty( _.get(node, 'data.resources') ),
    { markSearchResults: false, leaves_only: false }
  );

  return flat_nodes;
}


const get_initial_resource_state = ({hierarchy_scheme, year}) => ({
  hierarchy_scheme: hierarchy_scheme || "min",
  year: year || planning_year,
  sort_col: _.includes(non_rolling_up_schemes, hierarchy_scheme) ? 'name' : 'spending',
  is_descending: !_.includes(non_rolling_up_schemes, hierarchy_scheme),
});

const resource_scheme = {
  key: 'resources',
  get_sort_func_selector: () => provide_sort_func_selector('resources'),
  get_props_selector: () => {
    return augmented_state => ({ 
      ...augmented_state.resources,
      is_m2m: _.includes(['HWH', 'WWH', 'HI'], augmented_state.resources.hierarchy_scheme),
    });
  },
  dispatch_to_props: dispatch => ({ 
    col_click: col_key => dispatch({ type: 'column_header_click', payload: col_key }),
  }),
  //this helps the URL override store actions
  set_hierarchy_and_year(store, hierarchy_scheme, year){
    store.dispatch({
      type: "set_hierarchy_and_year",
      payload: { hierarchy_scheme, year }, 
    });
  },
  reducer: (state=get_initial_resource_state({}), action) => {
    const { type, payload } = action;
    if(type === 'set_hierarchy_and_year'){
      const { hierarchy_scheme, year } = payload;
      return ({...state, hierarchy_scheme, year });
    } else if(type === 'set_hierarchy_scheme'){
      return ({...state, hierarchy_scheme: payload });
    } else if(type === 'column_header_click'){
      const { is_descending, sort_col } = state;
      const clicked_col = payload;

      const mods = clicked_col === sort_col ? { is_descending: !is_descending } : { is_descending: true, sort_col: clicked_col };

      return ({...state, ...mods});
    } else if(type==="set_year"){
      return ({...state, year: payload });
    } else {
      return state;
    }
  
  },
  get_base_hierarchy_selector: () => createSelector(
    state => state.resources.hierarchy_scheme,
    state => state.resources.year,
    (hierarchy_scheme, year) => create_resource_hierarchy({ 
      hierarchy_scheme,
      year,
    })
  ),
  shouldUpdateFlatNodes(oldSchemeState, newSchemeState){
    return !shallowEqualObjectsOverKeys(
      oldSchemeState, 
      newSchemeState, 
      ['hierarchy_scheme', 'year' ] 
    );
  },
};


export {
  resource_scheme, 
  get_initial_resource_state,
};

