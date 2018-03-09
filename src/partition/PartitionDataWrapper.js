export class PartitionDataWrapper {
  constructor(root,show_partial_children,show_all_children){
    this.root = root;
    this.__show_partial_children = show_partial_children;
    this.__show_all_children = show_all_children;
  }
  to_open_levels(){
    const levels = {};
    this.root.each(node => {
      return (levels[node.depth] = levels[node.depth] || []).push(node)
    });
    return levels; 
  }
  links(){
    return _.chain(this.branches())
      .map(source=>source.children.map(target=>({source,target})))
      .flatten(true)
      .value();
  }
  branches(){
    return _.filter([this.root].concat(this.root.descendants()), node=> node.children);
  }
  show_partial_children(node){
    let children;
    // get rid of the minimize placeholder node
    node.children = node.children.filter(d=>_.isUndefined(d.data.unhidden_children));
    if (node.children) {
      children = this.__show_partial_children(node);
    }
    node.children = children
    return children;
  }
  show_all_children(node){
    if (!this.magnified(node)) {
      node.value = node.__value__;
    }
    if (node.children){
      const children = this.__show_all_children(node);
      _.chain(children)
        .difference(node.children)
        .filter(node=>node.value!==0)
        .each(child=>{
          child.eachAfter(d=>{
            if (d.children){
              d.children = this.__show_partial_children(d)
            }
          })
        })
        .value();
      node.children = children;
      node.eachAfter(c=> {
        if (!this.collapsed(c)) {
          c.open=true
        }
      });
      return children;
    }
  }
  hide_all_children(node){
    node.eachAfter(c=> c.open=c===node);
  }
  unhide_all_children(node){
    node.eachAfter(c=> c.open=true);
  }
  restore(node){
    if (!node.data.hidden_children && !node.data.unhidden_children) {
      node.value = node.__value__;
      this.show_partial_children(node);
    } else if (this.is_placeholder(node) && !_.isUndefined(node.data.hidden_children)) {
      node.value = d3.sum(node.data.hidden_children, child => child.__value__);
    }
  }
  unmagnify(node){
    node.value = node.__value__;
    const factor = 1/node.magnified;
    this.resize_children(node,factor);
    node.value = node.__value__;
    node.magnified = false;
    const parent = node.parent;
    if (!_.some(parent.children, d=> d.magnified)){
      parent.children
        .forEach(d=>{
          this.restore(d);
          this.unhide_all_children(d);
        })
    } else {
      node.value = 0;
      this.hide_all_children(node);
    }
  }
  magnify(node){
    const parent = node.parent;
    const top_sibling = parent.children[0];
    node.value = node.__value__;
    let factor;
    if ( node.value > 0.7 * top_sibling.__value__) {
      factor = 2;
    } else {
      factor = Math.abs(top_sibling.__value__/node.__value__);
    }
    this.resize_children(node,factor);
    node.magnified = factor;
    const siblings = parent.children.filter( d=> (
      d !== node && 
      !this.magnified(d)  &&
      d.value !== 0
    )); 
    _.each(siblings, d=>{
      d.value = 0
      this.hide_all_children(d);
    })
  }                     
  resize_children(node,factor){
    node.value *= factor;
    node.open = true;
    if (node.children){
      _.each(node.children, d=>{
        this.resize_children( d, factor );
      })
    }
    if (node.data.hidden_children){
      _.each(node.data.hidden_children, d=>{
        this.resize_children( d, factor );
      })
    } 
  }
  is_placeholder(node){
    return node.data.hidden_children || node.data.unhidden_children;
  }
  collapsed(node){
    return _.some(node.ancestors(), d=>d.value === 0);
  }
  magnified(node){
    return _.some(node.ancestors(), d=>d.magnified);
  }
};