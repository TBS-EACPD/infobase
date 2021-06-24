// This is more or less a legacy utility! Consider not using it, and working towards refactoring the remaining graphs relying on it.

// Initializes old graph classes with a common set of D3 dispatchers and some properties such as their available width and height, then
// stores all currently rendered graphs in a registry so that a single onResize event can be used to trigger all of their re-renders
// (updating their available width and height properties first)
import { Dispatch, dispatch } from "d3-dispatch";
import { Selection } from "d3-selection";
import _ from "lodash";

interface GraphRegistryOptions<T extends Record<string, unknown>> {
  height?: number;
  alternative_svg?: string;
  dispatch?: Dispatch<T>;
  events?: string[];
}

class GraphRegistry<T extends Record<string, unknown>> {
  registry: GraphRegistry<T>[];
  window_width_last_updated_at: number;
  options: GraphRegistryOptions<T>;
  outside_width: number | undefined;
  outside_height: number | undefined;
  dispatch: Dispatch<T> | undefined;
  render!: (options: GraphRegistryOptions<T>) => void | undefined;
  svg:
    | Selection<SVGElement, Record<string, unknown>, HTMLElement, unknown>
    | undefined;
  html:
    | Selection<SVGElement, Record<string, unknown>, HTMLElement, unknown>
    | undefined;

  constructor() {
    this.registry = [];
    this.window_width_last_updated_at = window.innerWidth;
    this.options = {};

    window.addEventListener(
      "hashchange",
      _.debounce(() => {
        this.update_registry();
      }, 250)
    );

    window.addEventListener(
      "resize",
      _.debounce(() => {
        if (this.should_graphs_update()) {
          this.update_registry();
          this.update_graphs();
        }
      }, 250)
    );
  }

  should_graphs_update() {
    return window.innerWidth !== this.window_width_last_updated_at;
  }

  update_registry() {
    const new_registry = this.registry.filter(
      (panel_obj) =>
        panel_obj.html && document.body.contains(panel_obj.html.node())
    );
    this.registry = new_registry;
  }

  update_graphs() {
    this.window_width_last_updated_at = window.innerWidth;
    console.log(this.registry);

    this.registry.forEach((panel_obj) => {
      if (panel_obj.html) {
        const html_container = panel_obj.html.node();
        if (html_container) {
          panel_obj.outside_width =
            html_container.getBoundingClientRect().width;
          panel_obj.outside_height = panel_obj.options.height || 400;

          _.map(html_container.childNodes, _.identity).forEach(
            (child: HTMLElement | undefined) => {
              // Remove all labels associated with the graph (that is, all siblings of the svg's container).
              if (
                !_.isUndefined(child) &&
                !child.className.includes("__svg__")
              ) {
                html_container.removeChild(child);
              }
            }
          );
        }
        // forEach directly on a nodeList has spoty support even with polyfils,
        // mapping it through to an array first works consistently though
        panel_obj.render(panel_obj.options);
      }
    });
  }

  setup_graph_instance(
    instance: GraphRegistry<T>,
    container: Selection<
      SVGElement,
      Record<string, unknown>,
      HTMLElement,
      unknown
    >,
    options: GraphRegistryOptions<T>
  ) {
    const base_dispatch_events = [
      "renderBegin",
      "renderEnd",
      "dataMouseEnter",
      "dataMouseLeave",
      "dataFocusIn",
      "dataFocusOut",
      "dataClick",
      "dataHover",
      "dataHoverOut",
    ];

    instance.options = options;

    container.append("div").classed("__svg__", true);

    if (options.alternative_svg) {
      container.select(".__svg__").html(options.alternative_svg);
    } else {
      container.select(".__svg__").append("svg");
    }

    instance.svg = container.select("svg");
    const node = container.node();
    instance.outside_width = node?.getBoundingClientRect().width;
    instance.outside_height = options.height || 400;

    instance.html = container;

    instance.dispatch = options.dispatch = dispatch.apply(
      this,
      base_dispatch_events.concat(options.events || [])
    );

    this.registry.push(instance);
  }
}

const graphRegistry = new GraphRegistry();
export default graphRegistry;
