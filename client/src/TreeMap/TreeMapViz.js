import classNames from "classnames";
import { hierarchy, treemap, treemapSquarify } from "d3-hierarchy";
import { scaleLinear } from "d3-scale";
import { select, selectAll, event } from "d3-selection";
import "d3-transition";
import "d3-selection-multi";
import _ from "lodash";
import React from "react";

import { is_mobile } from "src/core/feature_detection.js";

import { create_text_maker } from "../models/text.js";

import { smaller_items_text } from "./data.js";

import text from "./TreeMap.yaml";

const text_maker = create_text_maker(text);

export class TreeMap extends React.Component {
  constructor(props) {
    super();
    this.state = { org_route: [...props.org_route] };
  }
  render() {
    return <div className="TreeMap__Root" ref={(div) => (this.el = div)} />;
  }
  _update = () => {
    this._imperative_render();
  };
  componentDidMount() {
    this._update();
  }
  componentDidUpdate() {
    // reset the state to match the props
    this.setState({ org_route: [...this.props.org_route] });
    this._update();
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (
      this.props.perspective !== nextProps.perspective ||
      this.props.year !== nextProps.year ||
      this.props.filter_var !== nextProps.filter_var
    ) {
      return true;
    }
    if (
      !_.isEqual(this.state.org_route, nextProps.org_route) &&
      nextProps.org_route.length < this.state.org_route.length
    ) {
      return true; // only override with zoomed out view
    }
    return false;
  }

  _imperative_render() {
    const {
      data,
      colorScale,
      year,
      tooltip_render,
      node_render,
      setRouteCallback,
      viz_height,
    } = this.props;

    const org_route =
      !_.isEqual(this.state.org_route, this.props.org_route) &&
      this.props.org_route.length < this.state.org_route.length
        ? this.props.org_route
        : this.state.org_route;

    const el = this.el;
    if (data.length == 0) {
      el.innerHTML = `
    <div class="TreeMap__Mainviz">
      <div class="viz-root" style="min-height: ${viz_height}px; position: relative;" >
        <div style="font-size:18pt">
          ${text_maker("treemap_none_selected_summary")}
        </div>
      </div>
    </div>`;
    } else {
      el.innerHTML = `
    <div tabindex="0" id="TreeMap__Main" class="TreeMap__Mainviz">
      <div class="viz-root" style="min-height: ${viz_height}px; position: relative;" >
      </div>
    </div>`;
    }

    const html_root = select(el).select("div");

    // the actual treemap div
    const viz_root = html_root.select(".viz-root");

    const width = viz_root.node().offsetWidth;
    let height = viz_height;

    // sets x and y scale to determine size of visible boxes
    const x = scaleLinear().domain([0, width]).range([0, width]);
    const y = scaleLinear().domain([0, height]).range([0, height]);

    const treemap_instance = treemap()
      .tile(treemapSquarify.ratio(1))
      .round(true)
      .size([width, height]);

    let transitioning;

    // d3 creating the treemap using the data
    let data_root = data;

    if (!_.isEmpty(org_route)) {
      const route_length = org_route.length;
      for (let i = 0; i < route_length; i++) {
        const next_name = org_route[i];
        const next_item = _.filter(
          data_root.children,
          (d) => d.name === next_name
        );
        if (!_.isEmpty(next_item)) {
          data_root = next_item[0];
        }
      }
    }

    const root = hierarchy(data_root);

    // set up the node values to be the size, and adjust for cases where the size != sum of children's sizes
    // this avoids having to call d3's sum()
    root.each((d) => {
      d.data.value2 = d.data.size;
    });
    root.eachBefore((d) => {
      if (d.children && d.data.value2 !== _.sumBy(d.children, "data.value2")) {
        const difference = d.data.value2 - _.sumBy(d.children, "data.value2");
        const total_sum = _.sumBy(d.children, "data.value2");
        _.each(d.children, (child) => {
          const frac_of_total = child.data.value2 / total_sum;
          child.data.value2 += difference * frac_of_total;
        });
      }
    });
    root.each((d) => {
      d.value = d.data.value2;
    });

    treemap_instance(
      root.sort((a, b) => {
        if (a.data.name === smaller_items_text) {
          return 9999999;
        }
        if (b.data.name === smaller_items_text) {
          return -9999999;
        }
        return b.value - a.value || b.height - a.height;
      })
    );
    // Draw the coloured rectangles
    function rectan(sel) {
      sel.styles((d) => ({
        left: `${x(d.x0)}px`,
        top: `${y(d.y0)}px`,
        width: `${x(d.x1) - x(d.x0)}px`,
        height: `${y(d.y1) - y(d.y0)}px`,
        "background-color": colorScale(d),
      }));
    }

    // Draw the invisible text rectangles
    function treemap_node_content_container(sel) {
      sel.styles((d) => ({
        left: `${x(d.x0)}px`,
        top: `${y(d.y0)}px`,
        width: `${x(d.x1) - x(d.x0)}px`,
        height: `${y(d.y1) - y(d.y0)}px`,
      }));
    }

    const display = (d) => {
      const main_group = viz_root.insert("div").datum(d).attr("class", "depth");

      function transition(d) {
        if (transitioning || !d) return;
        transitioning = true;

        // Remove all tooltips when transitioning
        // TODO: will this actually work? this is never set
        select(this).select(".TM_TooltipContainer").remove();

        const zoomed_group = display(d);
        const main_trans = main_group.transition().duration(650);
        const zoomed_trans = zoomed_group.transition().duration(650);

        x.domain([d.x0, d.x1]);
        y.domain([d.y0, d.y1]);

        // Hide overflow while transitioning
        viz_root.style("overflow", "hidden");

        // Draw child nodes on top of parent nodes.
        viz_root.selectAll(".depth").sort((a, b) => a.depth - b.depth);

        // Transition to the new view.
        main_trans.selectAll(".TreeMap__Rectangle").call(rectan);
        zoomed_trans.selectAll(".TreeMap__Rectangle").call(rectan);

        // Remove text when transitioning, then display again
        main_trans
          .selectAll(".TreeMapNode__ContentBox")
          .style("display", "none");
        main_trans
          .selectAll(".TreeMapNode__ContentBoxContainer")
          .call(treemap_node_content_container);
        zoomed_trans
          .selectAll(".TreeMapNode__ContentBox")
          .style("display", "block");
        zoomed_trans
          .selectAll(".TreeMapNode__ContentBoxContainer")
          .call(treemap_node_content_container);

        zoomed_trans
          .selectAll(".TreeMapNode__ContentBoxContainer")
          .call(treemap_node_content_container); // TODO: why is this here?

        // Remove the old node when the transition is finished.
        main_trans.on("end.remove", function () {
          this.remove();
          transitioning = false;
          viz_root.style("overflow", "visible");
          zoomed_group
            .selectAll(".TreeMapNode__ContentBoxContainer")
            .call(node_render);
        });
      }

      if (!d.children) {
        return;
      }

      main_group.html("");
      const main = main_group
        .selectAll(".TreeMap__Division")
        .data(d.children)
        .enter()
        .append("div");

      // add class and click handler to all divs with children
      if (!is_mobile()) {
        main
          .filter((d) => d.children)
          .classed("TreeMap__Division", true)
          .on("click", (d) => {
            this.state.org_route.push(d.data.name);
            setRouteCallback(d.data.name, false);
            transition(d);
          })
          .on("keydown", (d) => {
            if (event.keyCode != 13) {
              return;
            }
            this.state.org_route.push(d.data.name);
            setRouteCallback(d.data.name, false);
            transition(d);
          });
      } else {
        main.filter((d) => d.children).classed("TreeMap__Division", true);
      }

      main
        .selectAll(".TreeMap__Rectangle--is-child")
        .data((d) => d.children || [d])
        .enter()
        .append("div")
        .attr("class", "TreeMap__Rectangle TreeMap__Rectangle--is-child")
        .call(rectan);

      main
        .append("div")
        .attr("class", "TreeMap__Rectangle TreeMap__Rectangle--is-parent")
        .call(rectan);

      if (!is_mobile()) {
        main
          .append("div")
          .attr("class", (d) =>
            classNames(
              "TreeMapNode__ContentBoxContainer",
              !_.isEmpty(d.children) &&
                "TreeMapNode__ContentBoxContainer--has-children"
            )
          )
          .attr("tabindex", "0")
          .on("mouseenter focus", function (d) {
            select(this).selectAll(".TM_TooltipContainer").remove();
            setTimeout(() => {
              selectAll(".TM_TooltipContainer").remove();
              var tool = select(this)
                .append("div")
                .attr("class", "TM_TooltipContainer")
                .style("opacity", 0);
              tool.transition().style("opacity", 1);
              tool.call(tooltip_render, year);
            }, 300);
          })
          .on("mouseleave", function (d) {
            select(this).selectAll(".TM_TooltipContainer").remove();
          })
          .call(treemap_node_content_container);
      } else {
        const that = this;
        main
          .append("div")
          .attr("class", (d) =>
            classNames(
              "TreeMapNode__ContentBoxContainer",
              !_.isEmpty(d.children) &&
                "TreeMapNode__ContentBoxContainer--has-children"
            )
          )
          .on("click", function (d) {
            if (d.toolTipped) {
              selectAll(".TM_TooltipContainer").remove();
              selectAll().classed(
                "TreeMapNode__ContentBoxContainer--tapped",
                false
              );
              d.toolTipped = false;
              if (d.children) {
                // do the transition
                that.state.org_route.push(d.data.name);
                setRouteCallback(d.data.name, false);
                transition(d);
              }
            } else {
              selectAll(".TM_TooltipContainer").remove();
              selectAll(".TreeMapNode__ContentBoxContainer")
                .classed("TreeMapNode__ContentBoxContainer--tapped", false)
                .each(function (d) {
                  d.toolTipped = false;
                });
              select(this).classed(
                "TreeMapNode__ContentBoxContainer--tapped",
                true
              );
              setTimeout(() => {
                var tool = select(this)
                  .append("div")
                  .attr("class", "TM_TooltipContainer")
                  .style("opacity", 0);
                tool.transition().style("opacity", 1);
                tool.call(tooltip_render);
              }, 100);
              d.toolTipped = true;
            }
          })
          .call(treemap_node_content_container);
      }

      return main;
    };

    const main = display(root);
    //node_render is special, we call it once on first render (here)
    //and after transitions
    if (main) {
      main.selectAll(".TreeMapNode__ContentBoxContainer").call(node_render);
    }
  }
}
