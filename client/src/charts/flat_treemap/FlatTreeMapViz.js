import d3 from "src/app_bootstrap/d3-bundle.js";

import "./FlatTreeMap.scss";

export class FlatTreeMapViz extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div
        className="centerer"
        style={{ width: "100%" }}
        ref={(div) => (this.el = div)}
      />
    );
  }
  componentDidMount() {
    this._imperative_render();
  }
  componentDidUpdate() {
    this._imperative_render();
  }
  _imperative_render() {
    const {
      data,
      colorScale,
      node_render,
      tooltip_render,
      value_string,
    } = this.props;

    const el = this.el;
    const margin = {
      right: 50,
      left: 50,
    };
    const width = el.offsetWidth - margin.left - margin.right;
    const height = width;

    el.innerHTML = `
    <div
        class="viz-root"
        style="
          position: relative;
          height: ${height}px;
          width: ${width}px;"
        >
    </div>`;

    const root = d3.hierarchy(data);

    const treemap = d3.treemap();
    treemap.size([width, height]).tile(d3.treemapSquarify.ratio(2));

    treemap(
      root
        .sum(function (d) {
          return d[value_string];
        })
        .sort((a, b) => {
          if (a.data.others) {
            return 9999999;
          }
          if (b.data.others) {
            return -9999999;
          }
          return b.value - a.value || b.height - a.height;
        })
    );

    function treemap_node_content_container(sel) {
      sel.styles((d) => ({
        left: `${d.x0}px`,
        top: `${d.y0}px`,
        width: `${d.x1 - d.x0}px`,
        height: `${d.y1 - d.y0}px`,
      }));
    }

    function treemap_node_text_container(sel) {
      sel.styles((d) => ({
        width: `${d.x1 - d.x0}px`,
        height: `${d.y1 - d.y0}px`,
      }));
    }

    const html_root = d3.select(el).select("div");

    const items = html_root
      .selectAll("div")
      .data(root.children)
      .enter()
      .append("div")
      .attr("class", "FlatTreeMap__ContentBox")
      .attr("tabindex", 0)
      .call(treemap_node_content_container)
      .styles((d) => ({
        "background-color": colorScale(d.data),
      }));

    items
      .append("div")
      .attr("class", "FlatTreeMap__TextBox")
      .call(treemap_node_text_container)
      .call(node_render);

    items.each(tooltip_render);

    return html_root;
  }
}
