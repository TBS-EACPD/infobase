import './ExplorerComponents.scss';
import classNames from 'classnames';
import ReactTransitionGroup from 'react-addons-transition-group';
import FlipMove from 'react-flip-move';
import {
  FirstChild,
  AccordionEnterExit,
  SortIndicators,
} from '../util_components.js';
import { createSelector } from 'reselect';
import { trivial_text_maker } from '../models/text.js';

const INDENT_SIZE = 24;

const example_col_defs = [
  {
    id: 'name',
    width: 250,
    textAlign: "left",
    header_display: "Name",
    get_val: ({data}) => data.name,
  },
  {
    id: "spend",
    width: 150,
    textAlign: "right",
    header_display: "Spending",
    get_val: ({data}) => data.spend,
  },
  {
    id: "spend1",
    width: 150,
    textAlign: "right",
    header_display: "Spending",
    get_val: ({data}) => data.spend,
  },
  {
    id: "spend11",
    width: 150,
    textAlign: "right",
    header_display: "Spending",
    get_val: ({data}) => data.spend,
  },
  {
    id: "spend112",
    width: 150,
    textAlign: "right",
    header_display: "Spending",
    get_val: ({data}) => data.spend,
  },
  {
    id: "spend2",
    width: 150,
    textAlign: "right",
    header_display: "Spending",
    get_val: ({data}) => data.spend,
  },
  {
    id: "spend3",
    width: 150,
    textAlign: "right",
    header_display: "Spending",
    get_val: ({data}) => data.spend,
  },
  {
    id: "ftes",
    width: 150,
    textAlign: "right",
    header_display: "FTEs",
    get_val: ({data}) => data.ftes,
  },
];

const example_data = {
  id: "root",
  data: {},
  children: [
    {
      id: 'a',
      data: {
        name: "node 1",
        spend: "20000",
        ftes: "25",
      },
      isExpanded: true,
      children: [
        {
          id: 'a1',
          data: {
            name: "node 1.1",
            spend: "2000",
            ftes: "5",
          },
          is_search_match: true,
        },
      ],
    },
    {
      id: 'b',
      data: {
        name: "node 2",
        spend: "23530",
        ftes: "42",
        type: "cr",
      },
      isExpanded:true,
      children: [
        {
          id: 'a1eee',
          data: {
            name: "node 1.1",
            spend: "2000",
            ftes: "5",
            type: "result",
          },
          is_search_match: true,
        },
        {
          id: 'b-results-1',
          data: {
            name: "b-results-1",
            spend: "2000",
            ftes: "5",
            type:"program",
          },
          is_search_match: true,
        },
      ],
    },
  ],
}

export const ExplorerHeader = ({column_defs, is_sortable, sort_col, is_descending, computed_col_styles, col_click}) => {

  return (
    <div className="ExplorerHeader ExplorerHeader--blue">
      <div className="ExplorerRow">
        {_.map(column_defs, ({id, style, header_display}, ix)=> 
          <div
            key={id}
            className="ExplorerRow__Cell"
            style={
              ix === 0 ? 
              {...computed_col_styles[id], textAlign: "center"}:
              computed_col_styles[id]
            }
            onClick={()=>col_click(id)}
            tabIndex={0}
            role="button"
          >
            {header_display}
            {is_sortable && 
              <SortIndicators 
                asc={!is_descending && sort_col === id }
                desc={is_descending && sort_col === id }
              />
            }
          </div>
        )}
      </div>
    </div>
  );

};

/*
  children_groups: [{display,node_group},...]
*/
const get_children_content = ({
  node,
  node: {
    children,
  },
  explorer_context,
  explorer_context: {
    children_grouper,
  },
  depth,
}) => {
  
  if(_.isEmpty(children)){
    return null;
  }
  const children_groups = (
    _.isFunction(children_grouper) ? 
    children_grouper(node, children) : 
    [{ node_group:children }]
  );

  return _.map(children_groups, ({display, node_group},ix) => (
    <div
      key={ix}
      className="ExplorerNodeContainer__ChildrenContainer"
    >
      {display && 
        <header 
          className="ExplorerNodeContainer__ChildrenGroupHeader"
          style={{
            marginLeft: depth && `${depth*INDENT_SIZE}px`,
          }}
        >
          {display}
        </header>
      }
      { node_group &&
        <FlipMove
          typeName="ul"
          className="ExplorerNodeContainer__ChildrenList"  
          staggerDurationBy="0"
          duration={500}
          disableAllAnimations={node_group.length > 150} /* for perf reasons */
        >
          {_.map(node_group, (child_node, ix) => 
            <li key={child_node.id}>
              <ExplorerNode
                depth={depth}
                explorer_context={explorer_context}
                node={child_node}
                mod_class={get_mod_class(child_node,ix,explorer_context)}
              />
            </li>
          )}
        </FlipMove>
      }
    </div>
  ));

};
export const ExplorerNode = ({
  explorer_context,
  explorer_context: {
    column_defs,
    onClickExpand,
    computed_col_styles,
    get_non_col_content,
  },
  node,
  mod_class,
  node: {
    id,
    isExpanded,
    data,
    data: {
      noExpand,
    },
  },
  depth,
}) => (
  <div 
    style={{marginLeft: depth && `${INDENT_SIZE}px`}}
    className="ExplorerNodeContainer"
  >
    <div className={classNames("ExplorerNode", mod_class)}>
      <div className={classNames("ExplorerNode__ExpanderContainer", noExpand && "ExplorerNode__ExpanderContainer--no-expand")}>
        {!noExpand && 
          <button
            className={classNames("ExplorerNode__Expander", window.is_a11y_mode && "ExplorerNode__Expander--a11y-compliant")}
            onClick={()=>onClickExpand(node)}
            aria-label={trivial_text_maker(isExpanded ? "select_to_collapse_a11y" : "select_to_expand_a11y") }
          >
            { isExpanded ? "▼" : "►" }
          </button>
        }
      </div>
      <div className="ExplorerNode__ContentContainer">
        <div
          className={classNames("ExplorerNode__RowContainer", noExpand && "ExplorerNode__RowContainer--no-click")}
          onClick={noExpand ? null : ()=>onClickExpand(node)}
        >
          <div className="ExplorerRow">
            {_.map(column_defs, ({id, width, get_val, val_display },ix) =>
              <div 
                key={id}
                className="ExplorerRow__Cell"
                style={
                  ix===0 ? 
                  { ...computed_col_styles[id], flex : `1 0 ${width-depth*INDENT_SIZE}px`} :
                  computed_col_styles[id]
                }
              >
                {
                  _.isFunction(val_display) ? 
                  val_display(get_val(node)) :
                  get_val(node)
                }
              </div>
            )}
          </div>
        </div>
        <ReactTransitionGroup component={FirstChild}>
          { isExpanded && 
            <AccordionEnterExit
              component="div"
              expandDuration={500}
              collapseDuration={300}
            >
              <div className="ExplorerNode__SuppContent">
                {_.isFunction(get_non_col_content) && get_non_col_content({node})}
              </div>
            </AccordionEnterExit>
          }
        </ReactTransitionGroup>
      </div>
    </div>
    <ReactTransitionGroup component={FirstChild}>
      { isExpanded && 
        <AccordionEnterExit
          component="div"
          expandDuration={500}
          collapseDuration={300}
        >
          {
            get_children_content({
              node,
              depth: depth+1,
              explorer_context,
            })
          }
        </AccordionEnterExit>
      }
    </ReactTransitionGroup>
  </div>
);


function get_mod_class(node, sibling_index, explorer_context){
  if(node.is_search_match){
    return "ExplorerNode--search-match";
  } else if(explorer_context.zebra_stripe && sibling_index%2){
    return "ExplorerNode--secondary-color";
  }

  return null;

}

const ExplorerRoot = ({root, explorer_context}) => <div>
  {get_children_content({
    node: root,
    explorer_context,
    depth: 0,
  })}
</div>


// api
/* 

  Node: {
    data,
    children
  }

  ColumnDefs: [
    {
      id,
      display: data => ReactEl,
      style: { padding, textAlign, ...flexProperties } (standard react-style props)
      className
      header
    }
  ]



*/ 

const compute_col_styles = createSelector(_.identity, col_defs => {

  return _.chain(col_defs)
    .map( ({id, width, textAlign}, ix) => {
      let marginRight = null;
      let marginLeft = null;
      let padding = "0 5px 0 0";
      let flex = `0 1 ${width}px`;
      if(ix===0){
        flex = `1 1 ${width}px`;  
        if(col_defs.length > 5){
          flex = `1 1 ${width+300}px`;    
        }
        marginRight = "auto";
      } else {
        if(ix === example_col_defs.length - 1){ //last col
          padding = "0 10px 0 5px";
        } else {
          marginLeft = "auto";
        }
      }

      return [
        id,
        {
          marginLeft,
          marginRight,
          padding,
          flex,
          textAlign,
          width: "100%", //IE
        },
      ];


    })
    .fromPairs()
    .value();

});

export class Explorer extends React.Component {
  componentDidMount(){
    this.updateWidth();
  }
  componentDidUpdate(){
    this.updateWidth();
  }
  updateWidth(){
    const { width_setter_el } = this;
    const width = _.get(
      width_setter_el.querySelector(".ExplorerNode"),  //the first row, but not the header
      "scrollWidth"
    );
    if(_.isNumber(width) && width > width_setter_el.parentNode.clientWidth){
      width_setter_el.style.minWidth = `${width}px`;
    } else {
      width_setter_el.style.minWidth = null;
    }

  }
  render(){

    const { 
      config,
      config: {
        column_defs,
        shouldHideHeader,
      },
      col_state,
      root,
    } = this.props;

    const computed_col_styles = compute_col_styles(column_defs);
    
    const explorer_context = {computed_col_styles, ...config};

    return (
      <div style={{overflowX: "auto"}}>
        <div ref={el => this.width_setter_el = el}> 
          {!shouldHideHeader &&
            <ExplorerHeader
              {...explorer_context}
              {...col_state}
            />
          }
          <ExplorerRoot
            explorer_context={explorer_context}
            root={root}
          />
        </div>
      </div>
    );
  }
}


export class DevStuff extends React.Component {
  render(){

    const explorer_config = {
      column_defs: example_col_defs,
      onClickExpand: _.noop,
      is_sortable: true,
      zebra_stripe: true,
      get_non_col_content: ({node}) => (
        <div className="ExplorerNode__BRLinkContainer">
          <a href="#"> Infographic Link </a>
        </div>
      ),
      children_grouper: (node, children) => {
        const type = _.get(node, "data.type");
        if(type === "cr"){
          return _.chain(children)
            .groupBy("data.type")
            .toPairs()
            .map( ([type, nodes]) => ({
              display: type,
              node_group: nodes,
            }))
            .sortBy('display')
            .value()
        }
        return [{node_group: children}];
      },
    };

    return (
      <div>
        <Explorer
          root={example_data}
          config={explorer_config}
          col_state={{
            sort_col: "name",
            is_descending: false,
          }}
        />
      </div>
    );
  }
} 