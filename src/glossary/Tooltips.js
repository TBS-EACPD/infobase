import Tooltip from 'tooltip.js';

import {get_glossary_item_tooltip_html} from '../models/glossary.js';

const body = document.querySelector('body');
const app = document.querySelector('#app');

const get_tooltip_title = (tooltip_node) => {
  if(tooltip_node.getAttribute('data-glossary-key')){ //this is hacky, but tooltips with inline html as titles were being messed with by markdown =
    return get_glossary_item_tooltip_html(tooltip_node.getAttribute('data-glossary-key'));
  } else {
    return tooltip_node.getAttribute('title');
  }
};

const compare_dom_nodes = (node1, node2) => node1.isSameNode(node2);

export class TooltipActivator extends React.Component {
  constructor(){
    super();

    this.debounced_mutation_callback = _.debounce(
      (mutationList, observer) => {
        this.setState({ current_tooltip_nodes: document.querySelectorAll('[data-toggle=tooltip]') || [] });
      },
      250
    );
    
    this.observer = new MutationObserver(this.debounced_mutation_callback);

    this.observer.observe(
      app,
      {
        childList: true,
        attributes: false,
        subtree: true,
      }
    );
    
    this.state = {
      current_tooltip_nodes: [],
    };

    this.tooltip_instances = [];
  }
  componentDidUpdate(){

    const { current_tooltip_nodes } = this.state;
    
    if ( _.isEmpty(this.tooltip_instances) ){
      this.tooltip_instances = _.map(
        current_tooltip_nodes, 
        (node) => ({
          node,
          tooltip: new Tooltip(
            node,
            {
              container: body,
              html: true,
              placement: 'bottom',
              title: get_tooltip_title(node),
            }
          ),
        }),
      );

    } else {
      const remaining_tooltips = [];
      const outgoing_tooltips = [];

      this.tooltip_instances.forEach( tooltip_instance => {
        const is_remaining_tooltip = _.chain(current_tooltip_nodes)
          .map( node => compare_dom_nodes(node, tooltip_instance.node) )
          .some()
          .value();

        if (is_remaining_tooltip){
          remaining_tooltips.push(tooltip_instance);
        } else {
          outgoing_tooltips.push(tooltip_instance);
        }
      });

      outgoing_tooltips.forEach( outgoing_instance => outgoing_instance.tooltip.dispose() );

      const incoming_nodes = _.groupBy(
        current_tooltip_nodes,
        (node) => _.chain(remaining_tooltips)
          .map( remaining_tooltip => compare_dom_nodes(node, remaining_tooltip.node) )
          .some()
          .value()
      )[false];

      const incoming_tooltips = _.map(
        incoming_nodes, 
        (node) => ({
          node,
          tooltip: new Tooltip(
            node,
            {
              container: body,
              html: true,
              placement: 'bottom',
              title: get_tooltip_title(node),
            }
          ),
        }),
      );

      this.tooltip_instances = [
        ...remaining_tooltips,
        ...incoming_tooltips,
      ];
    }
  }
  componentWillUnmount(){
    this.observer.disconect();
    this.debounced_mutation_callback.cancel();
    this.tooltip_instances.forEach( tooltip_instance => tooltip_instance.tooltip.dispose() );
  }
  render(){
    return null;
  }
}