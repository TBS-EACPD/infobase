import React from "react";
import Tooltip from "tooltip.js";

import _ from "src/app_bootstrap/lodash_mixins.js";

import { get_glossary_item_tooltip_html } from "../models/glossary.js";

// Patch over Tooltip's _scheduleShow and _scheduleHide to not use setTimeout with a 0 second delay
// The 0 second delay could still result in the _show call being stuck pending for extended periods (was consistently > 1 second on mobile Chrome)
Tooltip._scheduleShow = function (reference, delay, options /*, evt */) {
  this._isOpening = true;
  const computedDelay = (delay && delay.show) || delay || 0;
  if (computedDelay === 0) {
    this._show(reference, options);
  } else {
    this._showTimeout = window.setTimeout(
      () => this._show(reference, options),
      computedDelay
    );
  }
};
Tooltip._scheduleHide = function (reference, delay, options, evt) {
  this._isOpening = false;

  const cleanup_and_hide = () => {
    window.clearTimeout(this._showTimeout);
    if (this._isOpen === false) {
      return;
    }
    if (!document.body.contains(this._tooltipNode)) {
      return;
    }

    // if we are hiding because of a mouseleave, we must check that the new
    // reference isn't the tooltip, because in this case we don't want to hide it
    if (evt.type === "mouseleave") {
      const isSet = this._setTooltipNodeEvent(evt, reference, delay, options);

      // if we set the new event, don't hide the tooltip yet
      // the new event will take care to hide it if necessary
      if (isSet) {
        return;
      }
    }

    this._hide(reference, options);
  };

  // defaults to 0
  const computedDelay = (delay && delay.hide) || delay || 0;

  if (computedDelay === 0) {
    cleanup_and_hide();
  } else {
    window.setTimeout(cleanup_and_hide, computedDelay);
  }
};

const body = document.body;
const app = document.querySelector("#app");

const tt_params_from_node = (node) => {
  const tt_obj = {
    title: node.getAttribute("data-ibtt-glossary-key")
      ? get_glossary_item_tooltip_html(
          node.getAttribute("data-ibtt-glossary-key")
        )
      : node.getAttribute("data-ibtt-text"),
    placement: node.getAttribute("data-ibtt-placement") || "bottom",
    container: node.getAttribute("data-ibtt-container") || body,
    html: node.getAttribute("data-ibtt-html") || true,
    arrowSelector: node.getAttribute("data-ibtt-arrowselector")
      ? "." + node.getAttribute("data-ibtt-arrowselector")
      : ".tooltip-arrow",
    innerSelector: node.getAttribute("data-ibtt-innerselector")
      ? "." + node.getAttribute("data-ibtt-innerselector")
      : ".tooltip-inner",
    delay: node.getAttribute("data-ibtt-delay") || 0,
  };

  // if we've modified the selectors, need to change the template
  // why, I don't know
  if (
    node.getAttribute("data-ibtt-arrowselector") ||
    node.getAttribute("data-ibtt-innerselector")
  ) {
    tt_obj.template = `
    <div class="tooltip" role="tooltip">
      <div class="tooltip-arrow ${
        node.getAttribute("data-ibtt-arrowselector") || ""
      }"></div>
      <div class="tooltip-inner ${
        node.getAttribute("data-ibtt-innerselector") || ""
      }"></div>
    </div>`;
  }

  return tt_obj;
};

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
            tooltip: new Tooltip(node, tt_params_from_node(node)),
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
            outgoing_instance.tooltip.dispose()
          );

          const incoming_tooltips = _.chain(current_tooltip_nodes)
            .without(..._.map(remaining_tooltips, (tooltip) => tooltip.node))
            .map((node) => ({
              node,
              glossary_key: node.getAttribute("data-ibtt-glossary-key"),
              tooltip: new Tooltip(node, tt_params_from_node(node)),
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
          tooltip_instance.tooltip.dispose()
        );
      }
      render() {
        return null;
      }
    };

export { TooltipActivator };
