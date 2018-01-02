const { createSelector } = require('reselect');
const classNames = require('classnames');
const { infograph_href_template } = require('../link_utils.js');
const { text_maker } = require('../models/text.js');

const { abbrev } = require('../core/utils.js');

const ReactTransitionGroup  = require('react-addons-transition-group');
const FlipMove = require('react-flip-move');

const {
  TextMaker,
  Format,
  FirstChild,
  AccordionEnterExit,
  SortIndicators,
} = require('../util_components.js');

const { Table } = require('../core/TableClass.js');

const {
  filter_hierarchy,
  convert_d3_hierarchy_to_explorer_hierarchy,
} = require('./hierarchy_tools.js');


const { get_resources_for_subject } = require('./resource_utils.js');

function create_rooted_resource_hierarchy({doc,root_subject}){

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
    data: {
      subject : root_subject,
    },
  };
  
  const d3_hierarchy = d4.hierarchy(root, node => {

    const {
      id: parent_id,
      data: {
        subject,
      },
    } = node;

    const description_term = text_maker('description');
    
    switch(subject.level){

      case 'tag': {
        if(!subject.is_lowest_level_tag){
          throw "Only lowest_level_tag tags allowed here";          
        }

        return  _.chain(subject.programs)
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


  const children_display = !_.isEmpty(children) && (isExpanded || root) && (
    <FlipMove
      className={classNames(!root && "xplorer-collapsible-children-container mrgn-bttm-lg")}
      typeName="div"
      staggerDurationBy="0"
      duration={500}
    >
      {
        _.chain(children)
          .groupBy(child => child.node.data.header )
          .map( (group, group_name) => 
            <div key={group_name}>
              <header className="agnostic-header"> {group_name} </header>
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
    </FlipMove>
  );

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
      {children_display}
    </div>;

  }



  return (
    <div className="xplorer-node-container">
      <div 
        className={classNames(
          "xplorer-node", 
          index%2 && 'odd',
          !(index%2) && 'even'
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
                      {_.map(defs, ({ term, def }, ix) => [ 
                        /* eslint-disable react/jsx-key */
                        <dt key={`dt-${ix}`}> { term } </dt>,
                        /* eslint-disable react/jsx-key */
                        <dd key={`dd-${ix}`}> { def } </dd>,
                      ])}
                    </dl>
                  }
                  { (
                    _.includes(['program','dept', 'crso'], subject.level) || 
                    subject.level === 'tag' && !_.isEmpty(subject.programs) //only tags with programs (i.e. not tags that are just group of tags) have infographics
                  ) && 
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

const get_initial_resource_state = ({subject, has_drr_data, has_dp_data }) => ({
  sort_col: 'spending',
  is_descending: true,
  doc: has_drr_data ? 'drr16' : 'dp17',
});

const partial_scheme = {
  key: 'rooted_resources',
  get_props_selector: () => {

    const attr_getters = {
      ftes: node => _.get(node, "data.resources.ftes") || 0,
      spending:node => _.get(node,"data.resources.spending") || 0,
      name:  node => node.data.name,
    };

    const reverse_array = arr => _.clone(arr).reverse();

    const sort_func_selector = createSelector(
      [
        _.property("rooted_resources.is_descending"),
        _.property("rooted_resources.sort_col"),
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
      augmented_state.rooted_resources, 
      { 
        sort_func : sort_func_selector(augmented_state),
      }
    );
  
  },
  dispatch_to_props: dispatch => ({ 
    col_click : col_key => dispatch({type: 'column_header_click', payload: col_key }),
    set_doc: doc => dispatch({type: 'set_doc', payload: doc }),
  }),
  reducer: (state=get_initial_resource_state({}), action) => {
    const { type, payload } = action;
    if(type === 'column_header_click'){
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
  shouldUpdateFlatNodes(oldSchemeState, newSchemeState){
    return oldSchemeState.doc !== newSchemeState.doc;
  },
}

//given a subject, created a rooted scheme using the above scheme. Hierarchy scheme should be evident from the level of the subject 
function create_rooted_resource_scheme({subject}){

  return _.immutate(partial_scheme, {
    get_base_hierarchy_selector: () => createSelector(
      state => state.rooted_resources.doc,
      doc =>  create_rooted_resource_hierarchy({ 
        doc,
        root_subject: subject,
      })
    ),
  })


};


module.exports = {
  create_rooted_resource_scheme,
  get_initial_resource_state,
  node_renderer, 
};

