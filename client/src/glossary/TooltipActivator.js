import _ from "lodash";
import React from "react";
import tippy from "tippy.js";

import { get_glossary_item_tooltip_html } from "src/models/glossary";

const app = document.querySelector("#app");

const create_tooltip = (node) =>
  tippy(node, {
    content: node.getAttribute("data-ibtt-glossary-key")
      ? get_glossary_item_tooltip_html(
          node.getAttribute("data-ibtt-glossary-key")
        )
      : node.getAttribute("data-ibtt-text"),
    interactive: true,
    interactiveBorder: 0,
    duration: 0,
    allowHTML: true,
    hideOnClick: false,
    appendTo: app,
  });

const TooltipActivator = _.isUndefined(MutationObserver)
  ? _.constant(false)
  : class TooltipActivator extends React.Component {
      constructor() {
        super();

        this.state = {
          current_tooltip_nodes: [],
        };
        this.tooltip_instances = [];

        this.debounced_mutation_callback = _.debounce(
          (mutationList, observer) => {
            const previous_tooltip_nodes = _.map(
              this.tooltip_instances,
              (tooltip_instance) => tooltip_instance.node
            );
            const current_tooltip_nodes =
              document.querySelectorAll("[data-toggle=tooltip]") || [];

            const tooltip_nodes_have_changed =
              !(
                _.isEmpty(previous_tooltip_nodes) &&
                _.isEmpty(current_tooltip_nodes)
              ) &&
              (previous_tooltip_nodes.length !== current_tooltip_nodes.length ||
                !_.chain(previous_tooltip_nodes)
                  .zip(current_tooltip_nodes)
                  .find(
                    (nodes_to_compare) =>
                      nodes_to_compare[0] !== nodes_to_compare[1]
                  )
                  .isUndefined()
                  .value());

            if (tooltip_nodes_have_changed) {
              this.setState({ current_tooltip_nodes });
            }
          },
          250
        );

        this.observer = new MutationObserver(this.debounced_mutation_callback);

        this.observer.observe(app, {
          childList: true,
          attributes: false,
          subtree: true,
        });
      }
      componentDidUpdate() {
        const { current_tooltip_nodes } = this.state;

        const compare_current_node_and_tooltip_instance = (node, instance) =>
          node === instance.node &&
          node.getAttribute("data-ibtt-glossary-key") === instance.glossary_key;

        if (_.isEmpty(this.tooltip_instances)) {
          this.tooltip_instances = _.map(current_tooltip_nodes, (node) => ({
            node,
            glossary_key: node.getAttribute("data-ibtt-glossary-key"),
            tooltip: create_tooltip(node),
          }));
        } else {
          const remaining_tooltips = [];
          const outgoing_tooltips = [];

          this.tooltip_instances.forEach((tooltip_instance) => {
            const is_remaining_tooltip = _.chain(current_tooltip_nodes)
              .map((node) =>
                compare_current_node_and_tooltip_instance(
                  node,
                  tooltip_instance
                )
              )
              .some()
              .value();

            if (is_remaining_tooltip) {
              remaining_tooltips.push(tooltip_instance);
            } else {
              outgoing_tooltips.push(tooltip_instance);
            }
          });

          outgoing_tooltips.forEach((outgoing_instance) =>
            outgoing_instance.tooltip.destroy()
          );

          const incoming_tooltips = _.chain(current_tooltip_nodes)
            .without(..._.map(remaining_tooltips, (tooltip) => tooltip.node))
            .map((node) => ({
              node,
              glossary_key: node.getAttribute("data-ibtt-glossary-key"),
              tooltip: create_tooltip(node),
            }))
            .value();

          this.tooltip_instances = [
            ...remaining_tooltips,
            ...incoming_tooltips,
          ];
        }
      }
      componentWillUnmount() {
        this.observer.disconnect();
        this.debounced_mutation_callback.cancel();
        this.tooltip_instances.forEach((tooltip_instance) =>
          tooltip_instance.tooltip.destroy()
        );
      }
      render() {
        return null;
      }
    };

export { TooltipActivator };
