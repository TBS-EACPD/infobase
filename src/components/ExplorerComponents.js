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


const example_col_defs = [
  {
    id: 'name',
    style: {
      marginRight: "auto",
      flex: "1 1 250px",
    },
    header_style: {
      marginRight: "auto",
      flex: "1 1 250px",
      textAlign: "center",
    },
    header_display: "Name",
    get_val: ({data}) => data.name,
  },
  {
    id: "spend",
    style:{
      padding: "0 5px 0 5px",
      textAlign: "right",
      flex: "0 0 200px",
      marginLeft:"auto",
    },
    header_display: "Spending",
    get_val: ({data}) => data.spend,
  },
  {
    id: "spend2",
    style:{
      padding: "0 5px 0 5px",
      textAlign: "right",
      flex: "0 0 200px",
      marginLeft:"auto",
    },
    header_display: "Spending2",
    get_val: ({data}) => data.spend,
  },
  {
    id: "spend3",
    style:{
      padding: "0 5px 0 5px",
      textAlign: "right",
      flex: "0 0 200px",
      marginLeft:"auto",
    },
    header_display: "Spending3",
    get_val: ({data}) => data.spend,
  },
  {
    id: "ftes",
    style:{
      padding: "0 5px 0 5px",
      textAlign: "right",
      flex: "0 0 200px",
      paddingRight: "10px",
    },
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
    is_expanded: true,
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
  },
];

export const ExplorerHeader = ({column_defs, is_sortable, sort_col, is_descending}) => {

  return (
    <div className="ExplorerHeader ExplorerHeader--blue">
      <div className="ExplorerRow">
        {_.map(column_defs, ({id, style, header_style, header_display})=> 
          <div
            key={id}
            className="ExplorerRow__Cell"
            style={header_style || style}
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


export const ExplorerNode = ({
  explorer_context,
  explorer_context: {
    column_defs,
    onClickExpand,
  },
  node,
  mod_class,
  node: {
    id,
    is_expanded,
    data,
    children,
  },
}) => <div className="ExplorerNodeContainer">
  <div className={classNames("ExplorerNode", mod_class)}>
    <div className="ExplorerNode__ExpanderContainer">
      <button
        className={classNames("ExplorerNode__Expander", window.is_a11y_mode && "ExplorerNode__Expander--a11y-compliant")}
        onClick={()=>onClickExpand(id)}
      >
        { is_expanded ? "▼" : "►" }
      </button>
    </div>
    <div className="ExplorerNode__ContentContainer">
      <div
        className="ExplorerNode__RowContainer"
        onClick={()=>onClickExpand(id)}
      >
        <div className="ExplorerRow">
          {_.map(column_defs, ({id, style, get_val }) =>
            <div 
              key={id}
              className="ExplorerRow__Cell"
              style={style}
            >
              {get_val(node)}
            </div>
          )}
        </div>
      </div>
      <ReactTransitionGroup component={FirstChild}>
        { is_expanded && 
          <AccordionEnterExit
            component="div"
            expandDuration={500}
            collapseDuration={300}
          >
            <div className="ExplorerNode__SuppContent">
              additional content
            </div>
          </AccordionEnterExit>
        }
      </ReactTransitionGroup>
    </div>
  </div>
  { is_expanded && !_.isEmpty(children) && 
    <div className="ExplorerNodeContainer__ChildrenContainer">
      <FlipMove
        typeName="ul" 
        className='ExplorerNodeContainer__ChildrenList'
        staggerDurationBy="0"
        duration={500}
      >
        {_.map(children, (child_node, ix) => 
          <li key={child_node.id}>
            <ExplorerNode
              explorer_context={explorer_context}
              node={child_node}
              mod_class={get_mod_class(child_node,ix,explorer_context)}
            />
          </li>
        )}
      </FlipMove>
    </div>
  }
</div>;


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

export class DevStuff extends React.Component {
  render(){
    const explorer_context = {
      column_defs: example_col_defs,
      onClickExpand: _.noop,
      is_sortable: true,
      sort_col: "name",
      is_descending: false,
      zebra_stripe: true,
    };

    return (
      <div>
        <ExplorerHeader {...explorer_context}/>
        <ExplorerRoot
          explorer_context={explorer_context}
          nodes={example_data}
        />
      </div>
    );
  }
} 