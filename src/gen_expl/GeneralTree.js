
/*
  the expected hierarchies are of the form: 
  { 
    id,
    parent_id, //this is for optimizations purposes, but it is necessary
    data: {
      usually a name, 
    },
    children: [ nodes of the same format ]
  },

  GeneralTree expect a single root node

*/


//Do we need this class or can we just use GeneralTreeNode directly?
class GeneralTree extends React.PureComponent {
  render(){
    const {
      root, 
      onToggleNode,
      onExpandChildren,
      onCollapseChildren,
      renderNodeContent,
      sort_func,
      is_searching,
      scheme_props,
    } = this.props;
  
    return <div>
      {React.createElement(GeneralTreeNode, {
        onToggleNode,
        sort_func,
        onExpandChildren,
        onCollapseChildren,
        node:root,
        renderNodeContent,
        is_searching,
        scheme_props,
      })}
    </div>;

  }
}


//this class serves to decouple specific views from the hierarchical stuff.
//this means specific views don't need to be recursive or need to worry about sorting children
class GeneralTreeNode extends React.PureComponent {
  render(){

    const {
      onToggleNode,
      onExpandChildren,
      onCollapseChildren,
      renderNodeContent,
      node,
      ix, 
      sort_func,
      is_searching,
      scheme_props,
    } = this.props;

    const {
      children: node_children,
      isExpanded,
      id,
    } = node;


    //children react-elements are created here and passed to the content renderer, so it can choose how to display its children without calling GeneralTreeNode
    const children = (id==='root' || isExpanded) && (
      _.chain(node_children)
        .pipe(sort_func)
        .map((child, sub_ix)=> ({
          element: React.createElement(GeneralTreeNode, {
            sort_func,
            onToggleNode,
            onExpandChildren,
            onCollapseChildren,
            renderNodeContent,
            node:child,
            ix:sub_ix,
            is_searching,
            scheme_props,
            key: child.id,
          }),
          node: child,
        }))
        .value()
    )

  
    return renderNodeContent({ 
      node, 
      onToggleNode: ()=> onToggleNode(node),
      onExpandChildren: ()=> onExpandChildren(node),
      onCollapseChildren: ()=> onCollapseChildren(node),
      children,
      index: ix,
      is_searching,
      scheme_props,
    })

  }
}

module.exports = exports = {
  GeneralTree,
};