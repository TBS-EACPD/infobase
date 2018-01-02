const classNames = require('classnames');
const ReactTransitionGroup  = require('react-addons-transition-group');
const FlipMove = require('react-flip-move');
const { get_root } = require('../gen_expl/hierarchy_tools.js');
const { text_maker } = require('../models/text.js');
const {
  SpinnerWrapper,
  TM,
  AccordionEnterExit,
  FirstChild,
} = require('../util_components.js');
const {abbrev } = require('../core/utils.js'); 
const { GeneralTree } = require('../gen_expl/GeneralTree.js');


const icons_and_color_by_status_key = {
  met_full: { color: "#006400", type: "ok-circle" },
  ontrack: { color: "#006400", type: "time" },
  met_changed: { color: "#6b6b6b", type: "ok-circle" },
  ongoing: { color: "#006400", type: "time" },
  challenging: { color: "#880707", type: "time"},
  give_up: { color: "#880707", type: "minus-sign"},
  additional_commitment: { color:"#12307d", type: "plus" },
};

const Glyph = ({color,type}) => <span style={{color}} className={`glyphicon glyphicon-${type} v-centered`} />

const tree_renderer = props => {
  const {
    node,
    node: {
      root: isRoot,
      data: {
        ministers,
        commitment,
        status_key,
        status_name,
        priority,
        comment,
        type,
        name,
        count,
      },
      isExpanded,
      is_search_match,
    },
    onToggleNode,
    children,
    index,
    scheme_props: {
      grouping,
    },
  } = props;

  const children_display = !_.isEmpty(children) && (isExpanded || isRoot) && (
    <AccordionEnterExit
      component="div"
      expandDuration={250}
      collapseDuration={250}
      className={classNames(!isRoot && "xplorer-collapsible-children-container mrgn-bttm-lg")}
    > 
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
          <div style={{display: 'flex', justifyContent: 'flex-start', flexWrap: 'nowrap' }}>
              <div style={{marginRight: 'auto', flex: "1 1 0%", width: "100%"}}>
                <span
                  dangerouslySetInnerHTML={{
                    __html: isExpanded ? name : abbrev(name, 120), 
                  }} 
                />
                { _.nonEmpty(node.children) && <span> ({node.children.length})</span> }
              </div>
              { 
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
                  {type==='commitment' &&
                    <div style={{whiteSpace: 'nowrap'}}>
                      <span style={{fontSize: "0.8em"}}> {status_name} </span>
                      <Glyph {...icons_and_color_by_status_key[status_key]} />
                    </div>
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
            {type==='commitment' && isExpanded &&
              <div className="xplorer-node-inner-collapsible-content xplorer-node-inner-collapsible-content--mandate-letter">
                <div dangerouslySetInnerHTML={{__html:comment}} />
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

      sort_func,
      set_grouping,
    } = this.props;

    const { loading } = this.state;

    const root = get_root(flat_nodes);

    return <div>
      <div>
        <ul className="nav nav-justified nav-pills">
          <li className={classNames(grouping==='priority' && 'active')}><a href="#"  onClick={()=>set_grouping("priority")}> By priority </a></li>
          <li className={classNames(grouping==='minister' && 'active')}><a href="#"  onClick={()=>set_grouping("minister")}> By minister </a></li>
          <li className={classNames(grouping==='status' && 'active')}><a href="#"  onClick={()=>set_grouping("status")}> By completion status </a></li>
        </ul>
      </div>
      <div style={{marginTop: '15px'}}>
        <form
          style={{marginBottom: "15px"}}
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
            placeholder={text_maker('ml_search_for')}
            onChange={evt => this.handleQueryChange(evt.target.value)}
          />
        </form>
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
          <div style={{fontWeight: '500', fontSize: '1.5em', textAlign:'center'}}>  
            <TM k="search_no_results" />
          </div>
        }
        <GeneralTree
          {...{
            root,
            onToggleNode: toggle_node,
            renderNodeContent: tree_renderer,
            sort_func,
            is_searching : is_filtering,
            scheme_props: { },
          }}
        />
      </div>
    </div>;
 

  }
}
module.exports = exports = { Explorer };