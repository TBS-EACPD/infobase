const { createSelector } = require('reselect');
const classNames = require('classnames');
const { infograph_href_template } = require('../link_utils.js');
const { text_maker } = require('../models/text.js');

const { shallowEqualObjectsOverKeys } = require('../core/utils.js');
const { abbrev } = require('../core/utils.js');

const ReactTransitionGroup  = require('react-addons-transition-group');
const FlipMove = require('react-flip-move');


const { get_resources_for_subject } = require('./resource_utils.js');

const {
  TextMaker,
  Format,
  FirstChild,
  AccordionEnterExit,
  SortIndicators,
} = require('../util_components.js');

const Subject = require('../models/subject.js');
const { 
  Tag,
  Dept, 
  Ministry, 
} = Subject;
const { Table } = require('../core/TableClass.js');

const {
  filter_hierarchy,
  convert_d3_hierarchy_to_explorer_hierarchy,
} = require('./hierarchy_tools.js');

function create_resource_hierarchy({hierarchy_scheme,doc}){

  const table6 = Table.lookup('table6');
  const table12 = Table.lookup('table12');
  const year = (
    doc === 'dp17' ? 
    '{{planning_year_1}}' : 
    '{{pa_last_year}}'
  );
  const get_resources = subject => get_resources_for_subject(subject, table6,table12,year);

  const root = {
    root: true,
    id: 'root',
    data: {},
  };
  
  const d3_hierarchy = d4.hierarchy(root, node => {
    if(!_.isEmpty(node.children)){
      return node.children; //shortcut: if children is already defined, use it.
    }

    if(node === root){//if there is no root subject, we use all departments as children of the root.
      switch(hierarchy_scheme){

        case 'GOCO':
        case 'HWH':
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


const node_renderer = props => {
  const {
    node: {
      root,
      data: {
        subject,
        name,
        resources,
        defs,
      },
      isExpanded,
      is_search_match,
    },
    onToggleNode,
    children,
    index,
    scheme_props: {
      sort_col, 
      col_click, 
      is_descending,
      doc,
    },
  } = props;

  if(root){
    return <div>
      <div className="resource-explorer-header xplorer-resource-row">
        <div className="xplorer-name-col" onClick={()=> col_click('name')}>
          <TextMaker text_key="name" />
          <SortIndicators 
            asc={!is_descending && sort_col === 'name' }
            desc={is_descending && sort_col === 'name' }
          />
        </div>
        <div className="xplorer-spend-col" onClick={()=> col_click('spending')}>
          <TextMaker text_key={ doc === 'dp17' ? "tag_nav_exp_header_dp17" : 'tag_nav_exp_header_drr16' } />
          <SortIndicators 
            asc={!is_descending && sort_col === 'spending' }
            desc={is_descending && sort_col === 'spending' }
          />
        </div>
        <div className="xplorer-fte-col" onClick={()=> col_click('ftes')}> 
          <TextMaker text_key={ doc === 'dp17' ? "tag_nav_fte_header_dp17" : 'tag_nav_fte_header_drr16' } />
          <SortIndicators 
            asc={!is_descending && sort_col === 'ftes' }
            desc={is_descending && sort_col === 'ftes' }
          />
        </div>
      </div>
      <FlipMove
        staggerDurationBy="0"
        duration={500}
        typeName="ul"
        className="list-unstyled mrgn-tp-sm mrgn-bttm-sm"
      > 
        { _.map(children, ({ node, element }) =>
          <li key={node.id}>
            { element }
          </li>
        )}
      </FlipMove>
    </div>;

  }

  const children_display = !_.isEmpty(children) && isExpanded && (
    <AccordionEnterExit
      component="div"
      expandDuration={500}
      collapseDuration={300}
      className="xplorer-collapsible-children-container mrgn-bttm-lg"
    > 
      {
        _.chain(children)
          .groupBy(child => child.node.data.subject.plural() )
          .map( (group, plural) => <div key={plural}>
            <header className="agnostic-header"> { plural } </header>
            <FlipMove
              staggerDurationBy="0"
              duration={500}
              typeName="ul"
              className="list-unstyled mrgn-tp-sm mrgn-bttm-sm"
            > 
              { _.map(group, ({ node, element }) =>
                <li key={node.id}>
                  { element }
                </li>
              )}
            </FlipMove>
          </div>
          )
          .value()
      }
    </AccordionEnterExit>
  );

  return (
    <div className="xplorer-node-container">
      <div 
        className={classNames(
          "xplorer-node", 
          !is_search_match && index%2 && 'odd',
          !is_search_match && !(index%2) && 'even',
          is_search_match && "is-search-match" 
        )}
      >
        <div className="xplorer-expander-container" onClick={onToggleNode}>
          <button 
            className='button-unstyled xplorer-expander' 
            aria-label={isExpanded ? "Collapse this node" : "Expand this node"}
          > 
            { isExpanded ? "▼" : "►" }
          </button>
        </div>
        <div className="xplorer-node-content-container">
          <div className="xplorer-node-intro" onClick={onToggleNode}>
            <div className="xplorer-resource-row" style={{display:'flex'}}>
              <div
                className="xplorer-name-col" 
                dangerouslySetInnerHTML={{
                  __html: isExpanded ? name : abbrev(name, 120), 
                }} 
              />
              <div className="xplorer-spend-col"> 
                { resources.spending && 
                  <div> 
                    <span className="sr-only">
                      <TextMaker 
                        text_key={
                          doc === 'dp17' ?
                          "tag_nav_exp_header_dp17" :
                          'tag_nav_exp_header_drr16' 
                        }
                      />
                    </span>
                    <Format type="compact1" content={resources.spending} />
                  </div>
                }
              </div>
              <div className="xplorer-fte-col">
                { resources.ftes && 
                  <div>
                    <span className="sr-only">
                      <TextMaker 
                        text_key={
                          doc === 'dp17' ?
                          "tag_nav_fte_header_dp17" :
                          'tag_nav_fte_header_drr16' 
                        }
                      />
                    </span>
                    <Format type="big_int_real" content={resources.ftes} />
                  </div>
                }
              </div>
            </div>
          </div>
          <ReactTransitionGroup component={FirstChild}>
            { isExpanded && 
          <AccordionEnterExit
            component="div"
            expandDuration={500}
            collapseDuration={300}
          >
            {isExpanded &&
              <div className="xplorer-node-inner-collapsible-content">
                { !_.isEmpty(defs) && 
                  <dl className="dl-horizontal">
                    {_.map(defs, ({ term, def },ix) => [ 
                      /* eslint-disable react/jsx-key */
                      <dt key={"dt-"+ix}> { term } </dt>,
                      /* eslint-disable react/jsx-key */
                      <dd key={"dd-"+ix}> { def } </dd>,
                    ])}
                  </dl>
                }
                { ( _.includes(['program','dept'], subject.level) || subject.is_cr || subject.is_lowest_level_tag ) && 
                   <div className='xplorer-node-expanded-content'>
                     <a href={infograph_href_template(subject)}> 
                       <TextMaker text_key="see_infographic" />
                     </a>
                   </div>
                }
              </div>
            }
          </AccordionEnterExit>
            }
          </ReactTransitionGroup>
        </div>
      </div>
      <ReactTransitionGroup component={FirstChild}>
        { children_display }
      </ReactTransitionGroup>  
    </div>
  );

  

};

const get_initial_resource_state = ({hierarchy_scheme, doc}) => ({
  hierarchy_scheme : hierarchy_scheme || "min",
  doc: doc || 'drr16',
  
  sort_col: 'spending',
  is_descending: true,
});

const resource_scheme = {
  key: 'resources',
  get_props_selector: () => {

    const attr_getters = {
      ftes: node => _.get(node,'data.resources.ftes') || 0,
      spending:node => _.get(node,"data.resources.spending") || 0,
      name:  node => node.data.name,
    };

    const reverse_array = arr => _.clone(arr).reverse();

    const sort_func_selector = createSelector(
      [
        aug_state => aug_state.resources.is_descending, 
        aug_state => aug_state.resources.sort_col, 
      ],
      (is_descending, sort_col) => {

        const attr_getter = attr_getters[sort_col];

        return list => _.chain(list) //sort by search relevance, than the initial sort func
          .sortBy(attr_getter)
          .pipe( is_descending ? reverse_array : _.identity )
          .value();
      }
    );

    return augmented_state => _.immutate( 
      augmented_state.resources, 
      { 
        sort_func : sort_func_selector(augmented_state),
        is_m2m : _.includes(['HWH'], augmented_state.resources.hierarchy_scheme ),
      }
    );
  
  },
  tree_renderer: node_renderer,
  dispatch_to_props: dispatch => ({ 
    set_hierarchy_scheme: key => dispatch({type: 'set_hierarchy_scheme', payload: key}),  
    col_click : col_key => dispatch({type: 'column_header_click', payload: col_key }),
    set_doc: doc => dispatch({type: 'set_doc', payload: doc }),
  }),
  reducer: (state=get_initial_resource_state({}), action) => {
    const { type, payload } = action;
    if(type === 'set_hierarchy_scheme'){
      return _.immutate(state, {hierarchy_scheme: payload });
    } else if(type === 'column_header_click'){
      const { is_descending, sort_col } = state;
      const clicked_col = payload;

      const mods = clicked_col === sort_col ? { is_descending : !is_descending } : { is_descending: true, sort_col : clicked_col };

      return _.immutate(state, mods);
    } else if(type==="set_doc"){
      return _.immutate(state, { doc: payload });
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

