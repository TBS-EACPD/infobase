import _ from "lodash";
import React from "react";
import ReactDOM from "react-dom";

class ReactContentRenderer {
  nodes: (Element | DocumentFragment)[];

  constructor() {
    this.nodes = [];
  }
  render(component: React.ReactElement, node: Element | DocumentFragment) {
    ReactDOM.render(component, node);
    this.nodes.push(node);
  }
  unmountAll() {
    _.each(this.nodes, (node) => ReactDOM.unmountComponentAtNode(node));
    this.nodes = [];
  }
}

// NOTE: reactAdapter's a legacy utility from our initial transition to React,
// shouldn't be used in new code and should eventually be cleared out
const reactAdapter = new ReactContentRenderer();

export { reactAdapter, ReactContentRenderer };
