import './ExplorerComponents.scss';
import classNames from 'classnames';
import ReactTransitionGroup from 'react-addons-transition-group';
import FlipMove from 'react-flip-move';
import {
  FirstChild,
  AccordionEnterExit,
  TM,
  SortIndicators,
} from '../util_components.js';
import { createSelector } from 'reselect';

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

const example_data = [
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
    },
    isExpanded:true,
    children_groups: [
      {
        display: "Programs",
        node_group: [
          {
            id: 'a1eee',
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
        display: "results",
        node_group: [
          {
            id: 'b-results-1',
            data: {
              name: "b-results-1",
              spend: "2000",
              ftes: "5",
            },
            is_search_match: true,
          },
        ],
      },
    ],
  },
];

export const ExplorerHeader = ({column_defs, is_sortable, sort_col, is_descending, computed_col_styles}) => {

  return (
    <div className="ExplorerHeader ExplorerHeader--blue">
      <div className="ExplorerRow">
        {_.map(column_defs, ({id, style, header_display}, ix)=> 
          <div
            key={id}
            className="ExplorerRow__Cell"
            style={
              ix === 0 ? 
              Object.assign({},computed_col_styles[id], { textAlign: "center" }) :
              computed_col_styles[id]
            }
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
    children_groups,
  },
  explorer_context,
  depth,
}) => {
  
  const children_group_list = children_groups || !_.isEmpty(children) && [{ node_group:children }]

  return _.map(children_group_list, ({display, node_group},ix) => (
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
      <FlipMove
        typeName="ul"
        className="ExplorerNodeContainer__ChildrenList"  
        staggerDurationBy="0"
        duration={500}
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
    children_grouper,
  },
  node,
  mod_class,
  node: {
    id,
    isExpanded,
    data,
    children,
  },
  depth,
}) => (
  <div 
    style={{marginLeft: depth && `${INDENT_SIZE}px`}}
    className="ExplorerNodeContainer"
  >
    <div className={classNames("ExplorerNode", mod_class)}>
      <div className="ExplorerNode__ExpanderContainer">
        <button
          className={classNames("ExplorerNode__Expander", window.is_a11y_mode && "ExplorerNode__Expander--a11y-compliant")}
          onClick={()=>onClickExpand(id)}
        >
          { isExpanded ? "▼" : "►" }
        </button>
      </div>
      <div className="ExplorerNode__ContentContainer">
        <div
          className="ExplorerNode__RowContainer"
          onClick={()=>onClickExpand(id)}
        >
          <div className="ExplorerRow">
            {_.map(column_defs, ({id, width, get_val },ix) =>
              <div 
                key={id}
                className="ExplorerRow__Cell"
                style={
                  ix===0 ? 
                  Object.assign({}, computed_col_styles[id], {flex : `1 0 ${width-depth*INDENT_SIZE}px`}) :
                  computed_col_styles[id]
                }
              >
                {get_val(node)}
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
    { isExpanded && 
      get_children_content({
        node,
        depth: depth+1,
        explorer_context,
      })
    }
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

const ExplorerRoot = ({nodes, explorer_context}) => <div>
  <FlipMove
    typeName="ul" 
    className='ExplorerRootList'
    staggerDurationBy="0"
    duration={500}
  >
    {_.map(nodes, (node,ix) => 
      <li key={node.id}>
        <ExplorerNode
          explorer_context={explorer_context}
          node={node}
          mod_class={get_mod_class(node,ix,explorer_context)}
          depth={0}
        />
      </li>
    )}
  </FlipMove>
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
      let padding = "0 5px";
      let flex = `0 0 ${width}px`;
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

class ExplorerContainer extends React.Component {
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
      },
      nodes,
    } = this.props;

    const computed_col_styles = compute_col_styles(column_defs);
    
    const explorer_context = Object.assign({computed_col_styles}, config);

    return (
      <div style={{overflowX: "auto"}}>
        <div ref={el => this.width_setter_el = el}> 
          <ExplorerHeader {...explorer_context}/>
          <ExplorerRoot
            explorer_context={explorer_context}
            nodes={nodes}
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
      sort_col: "name",
      is_descending: false,
      zebra_stripe: true,
      get_non_col_content: ({node}) => (
        <div className="ExplorerNode__BRLinkContainer">
          <a href="#"> Infographic Link </a>
        </div>
      ),
    };

    return (
      <div>
        <ExplorerContainer
          nodes={example_data}
          config={explorer_config}
        />
      </div>
    );
  }
} 