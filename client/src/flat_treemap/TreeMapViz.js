
import classNames from "classnames";
import { make_unique } from "../general_utils";
import common_charts_utils from '../charts/common_charts_utils';
import './TreeMap.scss';

export class FlatTreeMapViz extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <div ref={div => this.el = div} />
  }
  componentDidUpdate() {
    this._imperative_render();
  }
  _imperative_render() {
    debugger;
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
      .sort((a, b) => {
        return b.value - a.value || b.height - a.height
      })
    );

    debugger;

    const programs = d3.select('svg g')
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
        stroke: "white",
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

    // d3.select('svg g')
    //   .data(root.descendants())
    //   .enter()
    //   .append('rect')
    //   .attr('x', function (d) { return d.x0; })
    //   .attr('y', function (d) { return d.y0; })
    //   .attr('width', function (d) { return d.x1 - d.x0; })
    //   .attr('height', function (d) { return d.y1 - d.y0; })
    //   .styles(d => ({
    //     fill: "none",
    //     stroke: "red",
    //   }))
    const nodes = d3.selectAll('svg g')
      .selectAll('g')
      .data(root.children)
      .enter()
      .append('g')
      .attr('transform', function (d) { return 'translate(' + [d.x0, d.y0] + ')' })

    nodes
      .append('rect')
      .attr('width', function (d) { return d.x1 - d.x0; })
      .attr('height', function (d) { return d.y1 - d.y0; })
      .styles(d => ({
        fill: "none",
        stroke: "white",
        "stroke-Width": 3,
      }))

    nodes
      .append('text')
      .attr('dx', 10)
      .attr('dy', 20)
      .text(function (d) {
        return d.data.name;
      })


    const tt = viz_root.append("div")   
      .attr("class", "FlatTreeMap__ToolTip")               
      .style("opacity", 0);
  

    programs.on("mouseover", function (d) {
      tt
        .transition()
        .duration(1)
        .style("opacity", .9);
      tt
        .html(`
          Name: ${d.data.name} <br/>
          Amount: ${d.data.amount} <br/>
          FTEs: ${d.data.ftes} <br/>
          Total indicators: ${d.data.drr17_total} <br/>
          Indicators met: ${d.data.drr17_met}
          `)
        .styles(() => ({
          left: (d.x0) + "px",
          top: (d.y0) + "px",
          "max-width": "200px",
        }))
    })
      .on("mouseout", function (d) {
        tt.transition()
          .duration(1)
          .style("opacity", 0);
      });


    return viz_root;
  }
}

