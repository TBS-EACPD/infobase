//public methods do not mutate their input hierarchies (or nodes)
//they return hierarchy with consistent children/parent links
//private methods have no such guarantee
import _ from "lodash";

function get_root(flat_nodes) {
  return _.find(flat_nodes, ({ parent_id }) => _.isEmpty(parent_id));
}

function get_leaves(flat_nodes) {
  return _.filter(flat_nodes, (node) => _.isEmpty(node.children));
}

function flat_descendants(node) {
  let currentWave = [node];
  const flat_nodes = [];
  while (_.some(currentWave, (node) => !_.isEmpty(node.children))) {
    _.each(currentWave, (node) => {
      if (!_.isEmpty(node.children)) {
        flat_nodes.push(...node.children);
      }
    });
    currentWave = _.chain(currentWave)
      .map("children")
      .flatten()
      .compact()
      .value();
  }
  return flat_nodes;
}

function _create_children_links(node, nodes_by_parent_id) {
  node.children = nodes_by_parent_id[node.id] || null;
  _.each(node.children, (child) =>
    _create_children_links(child, nodes_by_parent_id)
  );
}

//mutates a node to write its children prop according to a collection of nodes indexed by parent IDs
//will also recurse over children
function create_children_links(flat_nodes) {
  const root = get_root(flat_nodes);
  const nodes_by_parent_id = _.groupBy(flat_nodes, "parent_id");
  _create_children_links(root, nodes_by_parent_id);
}

function filter_hierarchy(
  flat_nodes,
  filter_func,
  { leaves_only = false, markSearchResults = false }
) {
  //filters flat-nodes or just the leaves then assembles the tree from positive search results,
  // *All descendants of positive search results are included in the tree.
  //  algo: get flat set of positive nodes
  //        add in the (flat) set of descendants of POSITIVE nodes
  //        add in the ancestors of those nodes
  //        given the flat set of all nodes in the tree, use parent_id's to assemble the rest of the tree.

  const old_nodes_by_id = _.keyBy(flat_nodes, "id");

  const to_search = leaves_only ? get_leaves(flat_nodes) : flat_nodes;
  const positive_search_results = _.filter(to_search, filter_func);

  const positive_search_ids = _.keyBy(positive_search_results, "id");

  if (_.isEmpty(positive_search_results)) {
    return [{ ...get_root(flat_nodes), children: [] }];
  }

  //add in all descendants of positive search results
  const new_flat_nodes = _.chain(positive_search_results)
    .map((node) => flat_descendants(node))
    .flatten()
    .concat(positive_search_results)
    .uniqBy()
    .value();

  //add in ancestors of all the current nodes
  _.each(positive_search_results, (node) => {
    let current = node;
    let done = false;
    while (!done) {
      const parent_node =
        current.parent_id && old_nodes_by_id[current.parent_id];
      if (_.includes(new_flat_nodes, parent_node) || !parent_node) {
        done = true;
      } else {
        new_flat_nodes.push(parent_node);
        current = parent_node;
      }
    }
  });
  const all_flat_nodes = _.uniqBy(new_flat_nodes);

  //up to this point, the parent links are still accurate.
  const new_nodes = _.map(all_flat_nodes, (node) => ({
    ...node,
    ...(markSearchResults
      ? { is_search_match: !!positive_search_ids[node.id] }
      : {}),
  }));

  create_children_links(new_nodes);

  return new_nodes;
}

//will mutate nodes!
function ensureVisibility(nodes, shouldNodeBeVisible) {
  const nodes_by_id = _.keyBy(nodes, "id");

  const nodes_to_ensure_visibility = _.filter(nodes, shouldNodeBeVisible);

  _.each(nodes_to_ensure_visibility, (node) => {
    let current = node.parent_id && nodes_by_id[node.parent_id];
    while (current) {
      current.isExpanded = true;
      current = current.parent_id && nodes_by_id[current.parent_id];
    }
  });
}

//return a new set of flat nodes with new objects where nodes were updated.
//will mutate the old set of flat nodes
function toggleExpandedFlat(
  flat_nodes,
  node,
  { toggleNode, expandAllChildren, collapseAllChildren }
) {
  const nodes_by_id = _.keyBy(flat_nodes, "id");

  const replacement_node = _.clone(node);
  const nodes_to_be_replaced = [node];
  const new_nodes = [replacement_node];

  if (expandAllChildren) {
    nodes_to_be_replaced.push(...node.children);
    replacement_node.children = _.map(node.children, (obj) => ({
      ...obj,
      isExpanded: true,
    }));
    new_nodes.push(...replacement_node.children);
  } else if (collapseAllChildren) {
    nodes_to_be_replaced.push(...node.children);
    replacement_node.children = _.map(replacement_node.children, (obj) => ({
      ...obj,
      isExpanded: true,
    }));
    new_nodes.push(...replacement_node.children);
  } else {
    // default behavior: toggle the node.
    replacement_node.isExpanded = !node.isExpanded;
  }

  let current_node = node;
  let current_replacement = replacement_node;
  while (current_node.parent_id) {
    const parent_node = nodes_by_id[current_node.parent_id];
    const new_children = _.clone(parent_node.children);

    new_children[new_children.indexOf(current_node)] = current_replacement;

    const new_parent = {
      ...parent_node,
      children: new_children,
    };

    nodes_to_be_replaced.push(parent_node);
    new_nodes.push(new_parent);

    current_node = parent_node;
    current_replacement = new_parent;
  }

  const new_flat_nodes = _.chain(flat_nodes)
    .difference(nodes_to_be_replaced)
    .union(new_nodes)
    .value();

  return new_flat_nodes;
}

/* 
  our hierarchies are of the form:
  { id, parent_id, isExpanded, children: [ node ], data: {...important_stuff_in_here} }

  d3v4 hierarchies are of the form : { children, parent, data: { everything generated by the hierarchy function } }

*/

const d3_to_node = (node) => ({
  id: node.data.id,
  parent_id: node.parent && node.parent.data.id,
  data: node.data.data,
  isExpanded: node.data.isExpanded,
  root: node.data.root,
});

function convert_d3_hierarchy_to_explorer_hierarchy(root) {
  const flat_d3_nodes = root.descendants(); //recall that descendants includes the root

  const new_nodes = _.map(flat_d3_nodes, d3_to_node);

  const new_nodes_by_parent_id = _.groupBy(new_nodes, (node) => node.parent_id);

  //finally, attach the children links.
  _.each(new_nodes, (node) => {
    node.children = new_nodes_by_parent_id[node.id];
  });

  return new_nodes;
}

//takes the leaves of a hierarchy and allows collapsing some layers in between the leaves and their 'simplified' parent
//is_simple_parent : (ancestor, descendant) => true/false will be tested bottom-up against node's ancestors until it's true
//is_simple_parent: (root, _ ) => true
//
function simplify_hierarchy(flat_nodes, is_simple_parent, bottom_layer_filter) {
  const old_nodes_by_id = _.keyBy(flat_nodes, "id");

  function get_simple_parent(node) {
    let suspected_simple_parent = node;

    while (suspected_simple_parent.parent_id) {
      if (is_simple_parent(suspected_simple_parent, node)) {
        return suspected_simple_parent;
      } else {
        suspected_simple_parent =
          old_nodes_by_id[suspected_simple_parent.parent_id];
      }
    }

    //loop terminated => we're at the root
    return suspected_simple_parent;
  }

  const new_leaves = _.chain(flat_nodes)
    .filter(bottom_layer_filter)
    .map((node) => ({ ...node, parent_id: get_simple_parent(node).id }))
    .value();

  const simple_parents = _.chain(new_leaves)
    .map(({ parent_id }) => old_nodes_by_id[parent_id])
    .uniqBy("id")
    .map((node) => _.clone(node))
    .value();

  const ancestors_by_id = {};
  _.each(simple_parents, (node) => {
    let current = node;
    let done = false;
    while (!done) {
      const parent_node = old_nodes_by_id[current.parent_id];
      if (!parent_node || ancestors_by_id[parent_node.id]) {
        done = true;
      } else {
        ancestors_by_id[parent_node.id] = _.clone(parent_node);
        current = parent_node;
      }
    }
  });
  const ancestors = _.chain(ancestors_by_id).values().uniqBy("id").value();

  //this is all the nodes, but their children properties aren't correct yet.
  //note that it's possible for a node to be duplicated across simple_parents and ancestors, so we uniq it by id.
  const new_flat_nodes = _.uniqBy(
    [...new_leaves, ...simple_parents, ...ancestors],
    "id"
  );

  create_children_links(new_flat_nodes);

  return new_flat_nodes;
}

function _sort_hierarchy(node, children_transform) {
  const new_children = _.chain(node.children)
    .thru(children_transform)
    .map((child) => _sort_hierarchy(child, children_transform))
    .value();

  return {
    ...node,
    children: new_children,
  };
}

//children_transform: [ ...node, ] => [ ...node, ] without modifying individual nodes
function sort_hierarchy(flat_nodes, children_transform) {
  const old_root = get_root(flat_nodes);
  const new_root = _sort_hierarchy(old_root, children_transform);

  return [new_root, ...flat_descendants(new_root)];
}

export {
  filter_hierarchy,
  get_leaves,
  get_root,
  ensureVisibility,
  create_children_links,
  toggleExpandedFlat,
  convert_d3_hierarchy_to_explorer_hierarchy,
  simplify_hierarchy,
  sort_hierarchy,
};
