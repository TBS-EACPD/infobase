
import classNames from "classnames";
import { make_unique } from "../general_utils";
import common_charts_utils from '../charts/common_charts_utils';

let currentMouseX, currentMouseY;
function updateMousePositionVars(evt) {
  currentMouseX = evt.clientX;
  currentMouseY = evt.clientY;
}

export class FlatTreeMapViz extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <div ref={div => this.el = div} />
  }
  componentDidMount() {
    window.addEventListener("mousemove", updateMousePositionVars);
    this._imperative_render();
  }
  componentDidUpdate() {
    this._imperative_render();
  }
  componentWillUnmount() {
    window.removeEventListener("mousemove", updateMousePositionVars);
  }
  _imperative_render() {
    const {
      data,
      colorScale,
      tooltip_render,
      node_render,
    } = this.props;

    let height = 500;
    let width = 1200;

    const el = this.el;
    el.innerHTML = `
    <div  class="TreeMap__Mainviz">
      <div
          class="viz-root"
          style="
            position:relative;
            min-height: ${height}px;"
          >
      </div>
    </div>`;

    const root = d3.hierarchy(data);
    const html_root = d3.select(el).select('div');
    // the actual treemap div
    const viz_root = html_root.select('.viz-root')

    viz_root
      .append("svg")
      .attr('height', height)
      .attr('width', width)
      .append("g")
      .attr("class", "_graph_area");

    const treemap = d3.treemap();

    treemap
      .size([width, height])
      .paddingOuter(0)
      .tile(d3.treemapSquarify.ratio(1))

    treemap(root
      .sum(d => _.isEmpty(d.children) ? d.size : 0) // ternary to avoid double counting
      .sort((a, b) => {
        return b.value - a.value || b.height - a.height
      })
    );

    d3.select('svg g')
      .selectAll('rect')
      .data(root.descendants())
      .enter()
      .append('rect')
      .attr('x', function (d) { return d.x0; })
      .attr('y', function (d) { return d.y0; })
      .attr('width', function (d) { return d.x1 - d.x0; })
      .attr('height', function (d) { return d.y1 - d.y0; })
      .styles(d => ({
        fill: d.children ?
          "none" :
          d.data.drr17_total ? colorScale(d.data.drr17_met / d.data.drr17_total) : "grey",
        opacity: 1,
        stroke: "none",
      }))

    // d3.selectAll("rect")
    //   .filter(d => {
    //     if (d.data.subject && d.data.subject === "Ministry") {
    //       return true;
    //     } else {
    //       //debugger;
    //     }
    //   })
    //   .styles(d => ({
    //     stroke: "red",
    //   }))

    d3.select('svg g')
      .data(root.descendants())
      .enter()
      .append('rect')
      .attr('x', function (d) { return d.x0; })
      .attr('y', function (d) { return d.y0; })
      .attr('width', function (d) { return d.x1 - d.x0; })
      .attr('height', function (d) { return d.y1 - d.y0; })
      .styles(d => ({
        fill: "none",
        stroke: "red",
      }))

    return viz_root;
  }
}

