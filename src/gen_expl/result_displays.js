const { text_maker } = require('../models/text.js');
const { abbrev } = require('../core/utils.js');
const classNames = require('classnames');
const { infograph_href_template } = require('../link_utils.js');
const { Indicator } = require('../models/results.js');
const { 
  IndicatorDisplay,
  InlineStatusIconList,
} = require('../graphs/result_graphs/components.js');
const ReactTransitionGroup  = require('react-addons-transition-group');
const FlipMove = require('react-flip-move');
const {
  TextMaker,
  TM,
  FirstChild,
  AccordionEnterExit,
  Select,
} = require('../util_components.js');



const results_sidebar = ({
  arrangement,
  include_PAA,
  include_DRF,
  include_POs,
  include_dp,
  include_drr_met,
  include_drr_not_met,
  paa_org_count,
  drf_org_count,
  set_arrangement,
  toggle_include_PAA,
  toggle_include_DRF,
}) => (
  <div>
    <div>
      <label>
        Arrange by 
        <Select
          selected={arrangement}
          options={[
            {id: 'simple', display: 'Condensed Scheme : Min > CRSO > results'},
            {id: 'granular', display: 'Lowest Level (as per DP/DRR)'},
          ]}
          style={{fontSize:'1em'}}
          className="form-control"
          onSelect={id => set_arrangement(id) }
        />
      </label>
    </div>
    <div className="checkbox">
      <label>
        <input type="checkbox" checked={include_DRF} onChange={toggle_include_DRF} />
        DFR ({drf_org_count} <TextMaker text_key="orgs" /> )
      </label>
    </div>
    <div className="checkbox">
      <label>
        <input type="checkbox" checked={include_PAA} onChange={toggle_include_PAA}/>
        PAA ({paa_org_count} <TextMaker text_key="orgs" /> )
      </label>
    </div>
    <div className="checkbox">
      <label>
        <input type="checkbox" value=""/>
        Planned Results 2017-18
      </label>
    </div>
    <div className="checkbox">
      <label>
        <input type="checkbox" value=""/>
        Actual Results 2016-17
      </label>
    </div>
    <ul style={{listStyle:'none',paddingLeft:'20px'}}>
      <li>
        <div className="checkbox">
          <label>
            <input type="checkbox" value="" />
              Met
          </label>
        </div>
      </li>
      <li>
        <div className="checkbox">
          <label>
            <input type="checkbox" value=""/>
              Not met
          </label>
        </div>
      </li>
      <li>
        <div className="checkbox">
          <label>
            <input type="checkbox" value=""/>
              In progress
          </label>
        </div>
      </li>
    </ul>
  </div>
)

const get_type_header = node => {
  switch(node.data.type){
    case 'dept': 
      return text_maker('orgs');

    case 'cr': 
      return text_maker("core_responsibilities");

    case 'so': 
      return text_maker("strategic_outcomes");

    case 'program': 
      return text_maker('programs');

    case 'sub_program':
      return text_maker('sub_programs');

    case 'sub_sub_program': 
      return text_maker('sub_sub_programs');

    case 'dr':
      return text_maker("dept_results");

    case 'result':
      return text_maker("results");

    default:
      return null;
  }
};

const create_result_tree_content_renderer = ({
  root_renderer,
}) => props => {
  const {
    node,
    node: {
      id,
      data: {
        subject,
        result,
        type,
        name,
      },
      isExpanded,
      is_search_match,
    },
    onToggleNode,
    children,
    index,

    scheme_props:{
      doc,
      is_status_filter_enabled,
      status_icon_key_whitelist,
    },
  } = props;
  
  if(id==='root'){
    return root_renderer({node,children});
  }

  //this is hacky, but results will render their children in a custom way. 
  const children_display = !result && !_.isEmpty(children) && isExpanded && (
    <AccordionEnterExit
      component="div"
      expandDuration={500}
      collapseDuration={300}
      className="xplorer-collapsible-children-container mrgn-bttm-lg"
    >
      {
        _.chain(children)
          .groupBy(child => child.node.data.type )
          .toPairs()
          .sortBy( ([ type, group ]) => !_.includes(['dr', 'result'], type) )//make results show up first 
          .map( ([type, group ]) => <div key={type}>
            <header className="agnostic-header"> { get_type_header(group[0].node) } </header>
            <FlipMove
              typeName="ul" 
              className='list-unstyled mrgn-tp-sm mrgn-bttm-sm'
              staggerDurationBy="0"
              duration={500}
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
            <div style={{display: 'flex', justifyContent: 'flex-start', flexWrap: 'nowrap' }}>
              <div style={{marginRight: 'auto', flex: "1 1 0%", width: "100%"}}>
                <span
                  dangerouslySetInnerHTML={{
                    __html: isExpanded ? name : abbrev(name, 120), 
                  }} 
                />
              </div>
              { (result || subject)  && 
                <div 
                  style={{
                    width: "100%",
                    padding: "0 10px 0 5px",
                    textAlign: "right",
                    flex: "0 0 150px",
                    opacity: 0.8,
                  }}
                  aria-hidden={true}
                >
                  {doc === 'drr16' && 
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
                  }
                </div>
              }
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
                { _.includes(['program','dept', 'cr', 'so'], type) && 
                   <div className='xplorer-node-expanded-content'>
                     <a href={infograph_href_template(subject)}> 
                       <TM k="see_infographic" />    
                     </a>
                   </div>
                }
              </div>
            }
            { isExpanded && result && <ResultNodeContent {...props} /> }
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

}

const standard_root_display = ({node, children}) => {
  return <div>
    <FlipMove
      staggerDurationBy="0"
      duration={500}
      typeName="ul"
      className="list-unstyled"
    > 
      {_.map(children, ({element, node}) => 
        <li key={node.id}>
          {element}
        </li>
      )}
    </FlipMove>
  </div>


}

const single_subj_root_display = ({node, children}) => {

  return (
    <div>
      <FlipMove
        staggerDurationBy="0"
        duration={500}
        typeName="ul"
        className="list-unstyled"
      > 
        {
          _.chain(children)
            .groupBy(child => child.node.data.type )
            .toPairs()
            .sortBy( ([ type, group ]) => !_.includes(['dr', 'result'], type) )//make results show up first 
            .map( ([type, group ]) => <div key={type}>
              <header className="agnostic-header"> { get_type_header(group[0].node) } </header>
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
    </div>
  );

};

const ResultNodeContent = ({ 
  node: {
    data: {
      result, 
      contributing_programs, 
      result_subject, 
      indicators, 
    },
    children : indicator_nodes,
  },
  scheme_props: {
    doc,
  },
}) => (
  <div className="indicator-container-container">
    <div className="indicator-container">
      <IndicatorDisplay indicators={_.map(indicator_nodes, 'data.indicator')} stripe_rows={true} />
    </div>
    { !_.isEmpty(contributing_programs) && 
      <div>
        <header className="agnostic-header"> <TextMaker text_key="programs_tagged_as_dr_contributors" /> </header>
        <ul>                
          {_.map(contributing_programs, prog => 
            <li key={prog.id}>
              <a href={infograph_href_template(prog)}> { prog.name } </a>
            </li>
          )}
        </ul>
      </div>
    }
  </div>
);


module.exports = {
  standard_root_display,
  create_result_tree_content_renderer,
  results_sidebar,
  single_subj_root_display,
  get_type_header,
};
