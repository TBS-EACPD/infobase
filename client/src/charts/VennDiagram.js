import { VennDiagram as VennDiagramChart, sortAreas } from "venn.js";

import { newIBDarkCategoryColors } from "../core/color_schemes";

const BASE_CIRCLE_FILL_OPACITY = 0;
const CIRCLE_BORDER_OPACITY = 0.8;
const HOVERED_CIRCLE_FILL_OPACITY = 0.4;
const HOVERED_INTERSECTION_FILL_OPACITY = 0.1;
const HOVERED_CIRCLE_BORDER_OPACITY = 0.6;
const BASE_CIRCLE_STROKE_WIDTH = 3;
const TOOLTIP_BORDER = 1;
const TOOLTIP_PADDING = 5;
const BASE_LABEL_FONT_SIZE = 14;

const PAGE_Y_SHIFT =
  BASE_LABEL_FONT_SIZE * 1.5 + 2 * TOOLTIP_PADDING + 2 * TOOLTIP_BORDER + 4;

export class VennDiagram extends React.Component {
  constructor() {
    super();
    this.graph_area = React.createRef();
    const _color_scale = d3.scaleOrdinal(newIBDarkCategoryColors);
    this.colorScale = function (d, i) {
      return _color_scale(i);
    };
  }
  render() {
    return <div ref={this.graph_area} />;
  }
  componentDidMount() {
    this.tooltip_container = document.createElement("div");
    document.body.appendChild(this.tooltip_container);

    this._render();
  }
  componentDidUpdate() {
    this._render();
  }
  _render() {
    const { data, label_formater, tooltipFormater } = this.props;

    const chart = VennDiagramChart();

    const base_selection = d3.select(this.graph_area.current);

    base_selection.datum(data).call(chart);

    base_selection
      .selectAll(".venn-circle path")
      .styles({
        "fill-opacity": BASE_CIRCLE_FILL_OPACITY,
        "stroke-width": BASE_CIRCLE_STROKE_WIDTH,
        "stroke-opacity": CIRCLE_BORDER_OPACITY,
      })
      .style("stroke", this.colorScale)
      .style("fill", this.colorScale);

    base_selection
      .selectAll(".venn-circle text.label")
      .style("fill", this.colorScale)
      .styles({
        "font-size": `${BASE_LABEL_FONT_SIZE}px`,
        "font-weight": "400",
      })
      // .style("fill", function (d, i) {
      //   return newIBDarkCategoryColors[i];
      // })
      .text(function (d) {
        return label_formater(d);
      });

    // add a tooltip
    var tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "venntooltip")
      .styles({
        position: "absolute",
        border: "${TOOLTIP_BORDER}px solid black",
        padding: `${TOOLTIP_PADDING}px`,
        "background-color": "#dfdfdf",
      });

    // add listeners to all the groups to display tooltip on mouseover
    base_selection
      .selectAll("g")
      .on("mouseover", function (d, i) {
        // sort all the areas relative to the current item
        sortAreas(base_selection, d);

        // Display a tooltip with the current size
        tooltip.transition().duration(400).style("opacity", 0.9);
        tooltip.text(() => tooltipFormater(d));

        // highlight the current path
        var selection = d3.select(this).transition("tooltip").duration(400);
        selection
          .select("path")
          .styles({
            "stroke-width": 3,
            "stroke-opacity": HOVERED_CIRCLE_BORDER_OPACITY,
          })
          .style(
            "fill-opacity",
            d.sets.length == 1
              ? HOVERED_CIRCLE_FILL_OPACITY
              : HOVERED_INTERSECTION_FILL_OPACITY
          );
      })

      .on("mousemove", function () {
        tooltip
          .style("left", `${d3.event.pageX}px`)
          .style("top", `${d3.event.pageY - PAGE_Y_SHIFT}px`);
      })

      .on("mouseout", function (d, i) {
        tooltip.transition().duration(400).style("opacity", 0);
        var selection = d3.select(this).transition("tooltip").duration(400);
        selection.select("path").styles({
          "stroke-width": BASE_CIRCLE_STROKE_WIDTH,
          "fill-opacity": BASE_CIRCLE_FILL_OPACITY,
          "stroke-opacity": CIRCLE_BORDER_OPACITY,
        });
      });
  }
  componentWillUnmount() {
    document.body.removeChild(this.tooltip_container);
    //TODO confirm we don't need to clean up event listeners
  }
}
