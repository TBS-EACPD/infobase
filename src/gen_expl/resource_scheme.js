const { createSelector } = require('reselect');
const { infograph_href_template } = require('../link_utils.js');
const { text_maker } = require('../models/text.js');
const { provide_sort_func_selector } = require('./resource-explorer-common.js');
const { shallowEqualObjectsOverKeys } = require('../core/utils.js');


const { get_resources_for_subject } = require('./resource_utils.js');

const Subject = require('../models/subject.js');
const { 
  Tag,
  Dept, 
  Ministry, 
} = Subject;

const {
  filter_hierarchy,
  convert_d3_hierarchy_to_explorer_hierarchy,
} = require('./hierarchy_tools.js');

function create_resource_hierarchy({hierarchy_scheme,doc}){

  const get_resources = subject => get_resources_for_subject(subject,doc);

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
        case 'MLT':
          return _.map(Tag.lookup(hierarchy_scheme).children_tags, tag => ({
            id: tag.guid,
            data: {
              name: tag.name,
              resources: get_resources(tag),
              subject: tag,
              defs: ( tag.is_lowest_level_tag && [
                {
                  term: text_maker('description'),
                  def: <div dangerouslySetInnerHTML={{__html: tag.description }} />,
                },
              ].concat( 
                (tag.is_m2m && !_.isEmpty(tag.related_tags()) ) ?
                [{
                  term: text_maker('related_tags'),
                  def: (
                    <ul className="list-unstyled">
                      {_.map(tag.related_tags(), related_tag => 
                        <li key={related_tag.id}> <a href={infograph_href_template(related_tag)} > {related_tag.name} </a> </li> 
                      )}
                    </ul>
                  ),
                }] : 
                []
              )),
                
            },
          }));

        case 'min':
          return _.chain(Ministry.get_all())
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
            .value()

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
            .value()


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
          return  _.chain(subject.programs)
            .map( prog => ({
              id: `${parent_id}-${prog.guid}`,
              data: {
                name: `${prog.name} (${prog.dept.fancy_acronym})`,
                subject: prog,
                resources: get_resources(prog),
                defs: [
                  {
                    term: text_maker('org'),
                    def: <a href={infograph_href_template(prog.dept)}> {prog.dept.name} </a>,
                  },
                  {
                    term: text_maker('description'),
                    def: <div dangerouslySetInnerHTML={{__html: prog.description }} />,
                  },
                ],
              }, 
            }))
            .value();
        } else {
          if(!_.isEmpty(subject.children_tags)){
            return _.map(subject.children_tags, tag => ({
              id: tag.guid,
              data: {
                name: tag.name,
                subject: tag,
                resources: get_resources(tag),
                defs: [
                  {
                    term: text_maker('description'),
                    def: <div dangerouslySetInnerHTML={{__html: tag.description }} />,
                  },
                ],
              },
            }));

          }
          

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
                  def: <div dangerouslySetInnerHTML={{__html: crso.description }} />,
                }]
              ),
            }, 
          }))
          .value()

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
    node => _.get(node, 'data.subject.level') === 'program' && _.nonEmpty(_.get(node,'data.resources')),
    { markSearchResults: false, leaves_only: false }
  );

  return flat_nodes;

}



const get_initial_resource_state = ({hierarchy_scheme, doc}) => ({
  hierarchy_scheme : hierarchy_scheme || "min",
  doc: doc || 'drr16',
  
  sort_col: 'spending',
  is_descending: true,
});

const resource_scheme = {
  key: 'resources',
  get_sort_func_selector: () =>  provide_sort_func_selector('resources'),
  get_props_selector: () => {

    return augmented_state => ({ 
      ...augmented_state.resources,
      is_m2m : _.includes(['HWH', 'WWH', 'MLT'], augmented_state.resources.hierarchy_scheme ),
    });
  },
  dispatch_to_props: dispatch => ({ 
    col_click : col_key => dispatch({type: 'column_header_click', payload: col_key }),
  }),
  //this helps the URL override store actions. 
  set_hierarchy_and_doc(store, hierarchy_scheme, doc){
    store.dispatch({
      type: "set_hierarchy_and_doc",
      payload: { hierarchy_scheme, doc }, 
    });
  },
  reducer: (state=get_initial_resource_state({}), action) => {
    const { type, payload } = action;
    if(type === 'set_hierarchy_and_doc'){
      const { hierarchy_scheme, doc } = payload;
      return ({...state, hierarchy_scheme, doc })
    } else if(type === 'set_hierarchy_scheme'){
      return ({...state, hierarchy_scheme: payload });
    } else if(type === 'column_header_click'){
      const { is_descending, sort_col } = state;
      const clicked_col = payload;

      const mods = clicked_col === sort_col ? { is_descending : !is_descending } : { is_descending: true, sort_col : clicked_col };

      return ({...state, ...mods});
    } else if(type==="set_doc"){
      return ({...state, doc: payload });
    } else {
      return state;
    }
  
  },
  get_base_hierarchy_selector: () => createSelector(
    state => state.resources.hierarchy_scheme,
    state => state.resources.doc,
    (hierarchy_scheme, doc) =>  create_resource_hierarchy({ 
      hierarchy_scheme,
      doc,
    })
  ),
  shouldUpdateFlatNodes(oldSchemeState, newSchemeState){
    return !shallowEqualObjectsOverKeys(
      oldSchemeState, 
      newSchemeState, 
      ['hierarchy_scheme', 'doc' ] 
    );
  },
}


module.exports = {
  resource_scheme, 
  get_initial_resource_state,
};

