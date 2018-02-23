require('../gen_expl/explorer-styles.scss');
const classNames = require('classnames');
const ReactTransitionGroup  = require('react-addons-transition-group');
const { infograph_href_template } = require('../link_utils.js');
const FlipMove = require('react-flip-move');
const { get_root } = require('../gen_expl/hierarchy_tools.js');
const { text_maker } = require('../models/text.js');
const {
  SpinnerWrapper,
  TM,
  AccordionEnterExit,
  FirstChild,
} = require('../util_components.js');
const { abbrev } = require('../core/utils.js'); 
const { GeneralTree } = require('../gen_expl/GeneralTree.js');
const { InstForm } = require('../models/subject.js');

const DlItem = ({ term, def }) => [
  <dt key="dt"> {term} </dt>,
  <dd key="dd"> {def} </dd>,
];


function get_org_count(node){
  if( _.get(node, "data.type") === "org"){
    return 1;
  } else if( _.isEmpty(node.children) ){
    return 0; 
  } else {
    return _.chain(node.children)
      .map(child => get_org_count(child))
      .sum()
      .value();
  }
}

const SubjectFields = ({ subject, grouping }) => <div style={{marginTop: "2em"}}>
  <dl className="dl-horizontal">
    { 
      _.nonEmpty(subject.applied_title) && 
      subject.applied_title !== subject.legal_name &&
      <DlItem
        term={<TM k="applied_title" />}
        def={subject.applied_title}
      />
    }
    { subject.is_dead && [
      <DlItem
        key="status"
        term={<TM k="status" />}
        def={subject.status}
      />,
      <DlItem
        key="end_yr"
        term={<TM k="end_yr" />}
        def={subject.end_yr}
      />,
    ]}
    {
      _.nonEmpty(subject.ministers) && 
      <DlItem
        term={<TM k="padded_minister_span"/>}
        def={ _.map(subject.ministers,'name').join(", ") }
      />
    }
    {
      _.nonEmpty(subject.mandate) && 
      <DlItem
        term={<TM k="mandate" />}
        def={ <div dangerouslySetInnerHTML={{__html: subject.mandate }} /> }
      />
    }
    {
      _.nonEmpty(subject.notes) && 
      <DlItem
        term={<TM k ="notes"/>}
        def={subject.notes}
      />
    }

  </dl>
</div>;


const inst_form_sort_order = [
  "min_dept",
  "dept_corp",
  "dept_agency",
  "serv_agency",
  "spec_op_agency",
  "parl_ent",
  "agents_parl",
  "crown_corp",
  "shared_gov_corp",
  "joint_enterprise",
  "inter_org",
  "other",
];


const tree_renderer = props => {
  const {
    node,
    node: {
      root: isRoot,
      data: {
        name,
        type,
        subject,
      },
      isExpanded,
      is_search_match,
    },
    onToggleNode,
    children,
    index,
    is_filtering,
    scheme_props: {
      grouping,
    },
  } = props;

  const children_list = (
    type ==='ministry' ? 
    _.chain(children)
      .groupBy('node.data.subject.inst_form.id')
      .map( (children, form_id) => [form_id,children] )
      .sortBy( ([form_id]) => _.indexOf(inst_form_sort_order, form_id) )
      .map( ([form_id, children])=> 
        <li key={form_id}>
          <header className="agnostic-header">
            {InstForm.lookup(form_id).name}
          </header>
          <ul className="list-unstyled">
            {_.map(children, ({node, element}) =>
              <li key={node.id}>
                {element}
              </li>
            )}
          </ul>
        </li>
      )
      .value() :
    _.map(children, ({ node, element }) =>
      <li key={node.id}>
        { element }
      </li>
    )
  );

  const children_display = !_.isEmpty(children) && (isExpanded || isRoot) && (
    <AccordionEnterExit
      component="div"
      expandDuration={250}
      collapseDuration={250}
      className={classNames(!isRoot && "xplorer-collapsible-children-container mrgn-bttm-lg")}
    > 
      <FlipMove
        disableAllAnimations={isRoot}
        staggerDurationBy="0"
        duration={500}
        typeName="ul"
        className="list-unstyled mrgn-tp-sm mrgn-bttm-sm"
      > 
        {children_list}
      </FlipMove>
    </AccordionEnterExit>
  );

  if(isRoot){
    return <div>
      {children_display}
    </div>;
  }

  return (
    <div className="xplorer-node-container">
      <div 
        className={classNames(
          "xplorer-node xplorer-node--mandate-letter", 
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
            <span
              dangerouslySetInnerHTML={{
                __html: isExpanded ? name : abbrev(name, 120), 
              }} 
            />
            { !is_filtering && type !== "org" && <span> ({String(get_org_count(node))})</span> }
            { subject && _.nonEmpty(subject.end_yr) && <span> ({subject.end_yr})</span> }
          </div>
          <ReactTransitionGroup component={FirstChild}>
            { isExpanded && 
            <AccordionEnterExit
              component="div"
              expandDuration={500}
              collapseDuration={300}
            >
              { subject && 
              <div className="xplorer-node-inner-collapsible-content">
                <SubjectFields
                  {...{grouping, subject }}
                />
                <div 
                  style={{
                    textAlign: 'right',
                    marginTop:'5px',
                    borderTop:"1px solid #ccc",
                    padding:"8px",
                  }}
                >
                  <a 
                    className="btn btn-xs btn-ib-light" 
                    href={infograph_href_template(subject)}
                  > 
                    <TM k="see_infographic" />    
                  </a>
                </div>
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


class Explorer extends React.Component {
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
      flat_nodes,
      is_filtering,

      set_query,
      toggle_node,

      //scheme props
      grouping,
      should_show_orgs_without_data,

      sort_func,
      set_grouping,
      on_toggle_orgs_without_data,

    } = this.props;

    const { loading } = this.state;

    const root = get_root(flat_nodes);
    
    const org_count = _.countBy(flat_nodes, node => !node.children).true;

    return <div>
      <div>
        <ul className="nav nav-justified nav-pills">
          <li className={classNames(grouping==='portfolio' && 'active')}><a href="#igoc/portfolio" > <TM k="by_ministry" /> </a></li>
          <li className={classNames(grouping==='inst_form' && 'active')}><a href="#igoc/inst_form" > <TM k="by_inst_form" /> </a></li>
          <li className={classNames(grouping==='historical' && 'active')}><a href="#igoc/historical" > <TM k="by_historical" /></a></li>
          <li className={classNames(grouping==='pop_group' && 'active')}><a href="#igoc/pop_group" > <TM k="by_pop_group" /></a></li>
          <li className={classNames(grouping==='all' && 'active')}><a href="#igoc/all" > <TM k="by_all" /></a></li>
        </ul>
      </div>
      <div
        style={{
          margin: '15px 0',
        }}
      >
        <form
          style={{marginBottom:"5px"}}
          onSubmit={evt => {
            evt.preventDefault()
            evt.stopPropagation()
            set_query(evt.target.querySelector('input').value);
            this.refs.focus_mount.focus();
          }}
        >
          <input 
            className="form-control input-lg"
            type="text"
            style={{width:"100%", backgroundColor:"#fafafa"}}
            placeholder={text_maker('igoc_search_text')}
            onChange={evt => this.handleQueryChange(evt.target.value)}
          />
        </form>
        <div className="igoc-checkbox-and-count-row">
          <label>
            <input 
              type="checkbox"
              checked={should_show_orgs_without_data}
              onChange={on_toggle_orgs_without_data}
              style={{marginRight: "5px"}}
            />
            <TM k="show_orgs_without_data"/>
          </label>
          <div>
            <TM k="displayed_orgs_count" args={{org_count}}/>
          </div>
        </div>
      </div>
      <div 
        tabIndex={-1} 
        ref="focus_mount" 
        style={{position:'relative'}}
      >
        {loading && 
          <div className="loading-overlay">
            <div style={{height: '200px',position:'relative'}}>
              <SpinnerWrapper scale={3} /> 
            </div>
          </div>
        }
        {is_filtering && _.isEmpty(root.children) &&
          <div style={{fontWeight: 'bold', fontSize: '1.5em', textAlign:'center'}}>  
            <TM k="search_no_results" />
          </div>
        }
        <GeneralTree
          {...{
            root,
            onToggleNode: toggle_node,
            renderNodeContent: tree_renderer,
            sort_func,
            is_filtering,
            scheme_props: {
              grouping,
              should_show_orgs_without_data,
            },
          }}
        />
      </div>
    </div>;
 

  }
}
module.exports = exports = { Explorer };
