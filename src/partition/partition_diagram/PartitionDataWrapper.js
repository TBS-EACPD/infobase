const partition_show_partial_children = (node) => {
  if (!node.children){
    return;
  }
  if( !_.isUndefined(_.last(node.children).data.hidden_children) ){ 
    return node.children;
  }
  let to_be_shown, to_be_compressed, new_compressed_child, children;
  if ( _.isFunction(node.how_many_to_show) ){
    [to_be_shown,to_be_compressed] = node.how_many_to_show(node);
  } else {
    if (node.how_many_to_show >= node.children.length){
      to_be_shown = node.children;
      to_be_compressed = [];
    } else {
      to_be_shown = _.take(node.children, node.how_many_to_show);
      to_be_compressed = _.tail(node.children, node.how_many_to_show);
    }
  }
  if (to_be_compressed.length > 0){
    new_compressed_child = Object.assign(
      d3.hierarchy({}),
      {  
        height: node.height-1,
        depth: node.depth+1,
        id_ancestry: _.reduce(to_be_compressed, (memo,x) => memo+"-"+x.data.id, "compressed>")+"-<compressed-"+node.id_ancestry,
        open: true,
        parent: node,
        value: d3.sum(to_be_compressed,x => x.value),
        __value__: d3.sum(to_be_compressed,x => x.value),
        data: {
          id: _.map(to_be_compressed, x => x.data.id)+"compressed",
          name: "+",
          description: "",
          type: "compressed",
          is: __type__ => __type__ === "compressed",
          hidden_children: to_be_compressed,
        },
        no_polygon: false,
      }
    );
    children = to_be_shown.concat(new_compressed_child);
  } else {
    children = to_be_shown;
  }
  return children;
}

class PartitionDataWrapper {
  constructor(root){
    this.root = root;
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
      .map(source => source.children.map(target => ({source, target})))
      .flatten(true)
      .value();
  }
  branches(){
    return _.filter([this.root].concat(this.root.descendants()), node => node.children);
  }
  show_partial_children(node){
    let children;
    // get rid of the minimize placeholder node
    node.children = node.children.filter(d => _.isUndefined(d.data.unhidden_children));
    if (node.children) {
      children = partition_show_partial_children(node);
    }
    node.children = children
    return children;
  }
  show_all_children(node){
    if (!this.magnified(node)) {
      node.value = node.__value__;
    }
    if (node.children){
      let children;

      const compressed = _.last(node.children);
      if ( !_.isUndefined(compressed.data.hidden_children) ){
        children = node.children.concat(compressed.data.hidden_children);
        compressed.data.unhidden_children = compressed.data.hidden_children
        delete compressed.data.hidden_children;
        compressed.data.id = "minimize"+compressed.id_ancestry;
        compressed.value = 1;
        compressed.data.name = "—";
        _.each(children, _node => {
          _node.parent = node;
        });
        compressed.no_polygon = true;
      } else {
        children = node.children;
      }

      _.chain(children)
        .difference(node.children)
        .filter(node => node.value!==0)
        .each(child => {
          child.eachAfter(d => {
            if (d.children){
              d.children = partition_show_partial_children(d);
            }
          })
        })
        .value();
      node.children = children;
      node.eachAfter(c => {
        if (!this.collapsed(c)) {
          c.open = true;
        }
      });
      return children;
    }
  }
  hide_all_children(node){
    node.eachAfter(c => c.open = c === node);
  }
  unhide_all_children(node){
    node.eachAfter(c => c.open = true);
  }
  restore(node){
    if (!node.data.hidden_children && !node.data.unhidden_children) {
      node.value = node.__value__;
      this.show_partial_children(node);
    } else if ( this.is_placeholder(node) && !_.isUndefined(node.data.hidden_children) ) {
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
    if ( !_.some(parent.children, d => d.magnified) ){
      parent.children
        .forEach(d => {
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
    if (node.value > 0.7 * top_sibling.__value__){
      factor = 2;
    } else {
      factor = Math.abs(top_sibling.__value__/node.__value__);
    }
    this.resize_children(node,factor);
    node.magnified = factor;
    const siblings = parent.children.filter(d => (
      d !== node && 
      !this.magnified(d)  &&
      d.value !== 0
    )); 
    _.each(siblings, d => {
      d.value = 0
      this.hide_all_children(d);
    })
  }
  resize_children(node,factor){
    node.value *= factor;
    node.open = true;
    if (node.children){
      _.each(node.children, d => {
        this.resize_children(d, factor);
      })
    }
    if (node.data.hidden_children){
      _.each(node.data.hidden_children, d => {
        this.resize_children(d, factor);
      })
    } 
  }
  is_placeholder(node){
    return node.data.hidden_children || node.data.unhidden_children;
  }
  collapsed(node){
    return _.some(node.ancestors(), d => d.value === 0);
  }
  magnified(node){
    return _.some(node.ancestors(), d => d.magnified);
  }
};

export {
  partition_show_partial_children,
  PartitionDataWrapper,
};