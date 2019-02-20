import text from './TreeMap.yaml';
import { create_text_maker } from '../models/text.js';
import { formats } from '../core/format.js';
import classNames from "classnames";
import { smaller_items_text } from './data.js';
import { get_static_url } from '../request_utils.js';


const text_maker = create_text_maker(text);

let currentMouseX, currentMouseY;
function updateMousePositionVars(evt) {
  currentMouseX = evt.clientX;
  currentMouseY = evt.clientY;
}
export class TreeMap extends React.Component {
  constructor(props){
    super();
    this.my_state = { my_org_route: [...props.org_route] };
  }
  render() {
    return <div ref={div => this.el = div} />
  }
  _update() { 
    this._imperative_render();
  }
  componentDidMount() {
    this._update = _.bind(this._update, this);
    //window.addEventListener("resize", this._update)
    window.addEventListener("mousemove", updateMousePositionVars);
    this._update();
  }
  componentDidUpdate() {
    // reset the state to match the props
    this.my_state.my_org_route = [...this.props.org_route];
    this._update();
  }
  componentWillUnmount() {
    //window.removeEventListener("resize", this._update)
    window.removeEventListener("mousemove", updateMousePositionVars);
  }
  shouldComponentUpdate(nextProps,nextState){
    //debugger;
    // if(!_.isEqual(this.my_state.my_org_route.sort(), nextState.my_org_route.sort()) )
    // {
    //   return false; // don't update on state change (controlled from within the viz)
    // }
    if (
      this.props.perspective !== nextProps.perspective ||
      this.props.year !== nextProps.year ||
      this.props.color_var !== nextProps.color_var ||
      this.props.filter_var !== nextProps.filter_var )
    {
      return true;
    }
    if (!_.isEqual(this.my_state.my_org_route, nextProps.org_route) &&
        nextProps.org_route.length < this.my_state.my_org_route.length)
    {
      return true; // only override with zoomed out view
    }
    return false;
  }

  _imperative_render() {
    const {
      data,
      color_var,
      colorScale,
      tooltip_render,
      node_render,
      setRouteCallback,
      viz_height,
    } = this.props;
    let org_route = this.my_state.my_org_route;
    //debugger;
    if (!_.isEqual(this.my_state.my_org_route.sort(), this.props.org_route.sort()) &&
      this.props.org_route.length < this.my_state.my_org_route)
    {
      org_route = this.props.org_route;
    }
    const el = this.el;



    el.innerHTML = `
        <div  class="TreeMap__Mainviz">
          <div class="viz-root" style="min-height: ${viz_height}px; position: relative;" >
            </div>
        </div>`;

    const html_root = d3.select(el).select('div');

    // the actual treemap div
    const zoom_ctrl = html_root.select('.TreeMap__ZoomControl');
    const viz_root = html_root.select('.viz-root');
    const side_menu = html_root.select('.TreeMap__SideBar');

    const width = viz_root.node().offsetWidth;
    let height = viz_height;
    

    // sets x and y scale to determine size of visible boxes
    const x = d3.scaleLinear()
      .domain([0, width])
      .range([0, width]);
    const y = d3.scaleLinear()
      .domain([0, height])
      .range([0, height]);

    const treemap = d3.treemap()
      .tile(d3.treemapSquarify.ratio(1))
      .size([width, height]);

    let transitioning;

    // d3 creating the treemap using the data
    let root = data;

    if (!transitioning && !_.isEmpty(org_route)) {
      const route_length = org_route.length;
      for(let i = 0; i < route_length; i++){ // TODO: rewrite to use lodash and return original root if any of them fail
        const next_name = org_route.shift();
        const next_item = _.filter(root.children, d => d.name==next_name);
        root = next_item[0];
      }
    }

    root = d3.hierarchy(root);

    treemap(root
      .sum(d => _.isEmpty(d.children) ? d.size : 0) // ternary to avoid double counting
      .sort((a, b) => {
        if (a.data.name === smaller_items_text) {
          return 9999999
        }
        if (b.data.name === smaller_items_text) {
          return -9999999
        }
        return b.value - a.value || b.height - a.height
      })
    );


    const display = d => {
      //debugger;
      if (!d.children) {
        return;
      }
      // inserts text on the top bar
      /*       zoom_ctrl
              .datum(d.parent)
              .classed("TreeMap__ZoomControl--has-zoom-out", !!d.parent)
              .on('click', transition)
              .select('.TreeMap__ZoomControl__Text')
              .html(zoom_ctrl_text(d)); */

      //sidebar
      /* const side_bar_text_items = side_menu
        .selectAll(".TreeMap_SideBar__Text")
        .data( _.uniq(d.ancestors().reverse().concat([d])) ) 

      side_bar_text_items.exit().remove();
      side_bar_text_items.enter()
        .append("div")
        .attr("class","TreeMap_SideBar__Text")
        .merge(side_bar_text_items)
        .html(sidebar_item_html)
        .style("cursor", sidebar_data_el => d === sidebar_data_el ? "normal" : "pointer" )
        .classed("TreeMap__ZoomControl--has-zoom-out", !!d.parent)
        .on('click', function(sidebar_data_el){
          if(d === sidebar_data_el){
            return;
          }
          transition.call(this, ...arguments)
        }); */

      const g1 = viz_root.insert('div')
        .datum(d)
        .attr('class', 'depth');

      g1.html("");
      const main = g1.selectAll('.TreeMap__Division')
        .data(d.children)
        .enter()
        .append('div')

      // add class and click handler to all g's with children
      if (!window.feature_detection.is_mobile()) {
        main
          .filter(d => d.children)
          .classed('TreeMap__Division', true)
          .on('click', d => {
            this.my_state.my_org_route.push(d.data.name);
            setRouteCallback(d.data.name, false);
            transition(d);
            //this.setState({my_org_route: this.state.my_org_route.concat(d.data.name)}, () => {
            //  setRouteCallback(this.state.my_org_route);
            //})
            //org_route.push(d.data.name);
            
          })
      } else {
        main
          .filter(d => d.children)
          .classed('TreeMap__Division', true)
      }

      main.selectAll('.TreeMap__Rectangle--is-child')
        .data(d => d.children || [d])
        .enter()
        .append('div')
        .attr('class', 'TreeMap__Rectangle TreeMap__Rectangle--is-child')
        .call(rectan)

      main.append('div')
        .attr('class', 'TreeMap__Rectangle TreeMap__Rectangle--is-parent')
        .call(rectan)

      //TODO: some of this needs to be put into functions
      if (!window.feature_detection.is_mobile()) {
        main.append('div')
          .attr('class', d => classNames('TreeMapNode__ContentBoxContainer', !_.isEmpty(d.children) && "TreeMapNode__ContentBoxContainer--has-children"))
          .on("mouseenter", function (d) {
            const el = this;
            setTimeout(() => {
              const coords = el.getBoundingClientRect();
              if (!(
                currentMouseX >= coords.left && currentMouseX <= coords.right &&
                currentMouseY >= coords.top && currentMouseY <= coords.bottom
              )) {
                return;
              }
              var tool = d3.select(this).append("div")
                .attr("class", "TM_TooltipContainer")
                .style("opacity", 0);
              tool.transition()
                .style("opacity", 1);
              tool
                .call(tooltip_render, color_var)
            }, 300)
          })
          .on("mouseleave", function (d) {
            d3.select(this)
              .selectAll('.TM_TooltipContainer')
              .filter(tooltip_data => tooltip_data === d)
              .remove();
          })
          .call(treemap_node_content_container)
      } else {
        main.append('div')
          .attr('class', d => classNames('TreeMapNode__ContentBoxContainer', !_.isEmpty(d.children) && "TreeMapNode__ContentBoxContainer--has-children"))
          .on("click", function (d) {
            if (d.toolTipped) {
              d3.select(this)
                .selectAll('.TM_TooltipContainer')
                .remove();
              d3.select(this).classed("TreeMapNode__ContentBoxContainer--tapped", false);
              d.toolTipped = false;
              if (d.children) {
                transition(d);
              }
            } else {
              //remove others first
              d3.selectAll('.TM_TooltipContainer')
                .remove();
              d3.selectAll('.TreeMapNode__ContentBoxContainer')
                .classed("TreeMapNode__ContentBoxContainer--tapped", false)
                .each(function (d) {
                  d.toolTipped = false;
                });
              d3.select(this).classed("TreeMapNode__ContentBoxContainer--tapped", true);
              setTimeout(() => {
                var tool = d3.select(this).append("div")
                  .attr("class", "TM_TooltipContainer")
                  .style("opacity", 0);
                tool.transition()
                  .style("opacity", 1);
                tool
                  .call(tooltip_render)
              }, 100)
              d.toolTipped = true;

            }
          })

          .call(treemap_node_content_container)
      }

      function transition(d) {
        if (transitioning || !d) return;
        transitioning = true;

        // Remove all tooltips when transitioning
        // TODO: will this actually work? this is never set
        d3.select(this)
          .select('.TM_TooltipContainer')
          .remove();

        const g2 = display(d);
        const t1 = g1.transition().duration(650);
        const t2 = g2.transition().duration(650);

        x.domain([d.x0, d.x1]);
        y.domain([d.y0, d.y1]);

        // Hide overflow while transitioning
        viz_root.style('overflow', "hidden");

        // Draw child nodes on top of parent nodes.
        viz_root.selectAll('.depth').sort((a, b) => a.depth - b.depth);

        // Transition to the new view.
        t1.selectAll('.TreeMap__Rectangle').call(rectan);
        t2.selectAll('.TreeMap__Rectangle').call(rectan);

        // Remove text when transitioning, then display again
        t1.selectAll('.TreeMapNode__ContentBox').style('display', 'none');
        t1.selectAll('.TreeMapNode__ContentBoxContainer').call(treemap_node_content_container);
        t2.selectAll('.TreeMapNode__ContentBox').style('display', 'block');
        t2.selectAll('.TreeMapNode__ContentBoxContainer').call(treemap_node_content_container);

        t2.selectAll('.TreeMapNode__ContentBoxContainer').call(treemap_node_content_container); // TODO: why is this here?

        // Remove the old node when the transition is finished.
        t1.on('end.remove', function () {
          this.remove();
          transitioning = false;
          viz_root.style("overflow", "visible");
          g2.selectAll('.TreeMapNode__ContentBoxContainer').call(node_render);
        });
      }

      return main;
    }

    // Draw the coloured rectangles
    function rectan(sel) {
      sel.styles(d => ({
        left: `${x(d.x0)}px`,
        top: `${y(d.y0)}px`,
        width: `${x(d.x1) - x(d.x0)}px`,
        height: `${y(d.y1) - y(d.y0)}px`,
        "background-color": colorScale(d),
      }));
    }

    // Draw the invisible text rectangles
    function treemap_node_content_container(sel) {
      sel
        .styles(d => ({
          left: `${x(d.x0)}px`,
          top: `${y(d.y0)}px`,
          width: `${x(d.x1) - x(d.x0)}px`,
          height: `${y(d.y1) - y(d.y0)}px`,
        }))
      // .select('.textdiv').style('opacity', d=> (y(d.y1) - y(d.y0)) < 45 ? 0 : 1) //TODO do we still need this? 
    }


    const main = display(root);
    //node_render is special, we call it once on first render (here) 
    //and after transitions
    if (main) { main.selectAll('.TreeMapNode__ContentBoxContainer').call(node_render) }

  }
}

function zoom_ctrl_text(d) {
  return (
    d.parent ?
      `<span class="TreeMap__ZoomControl__Title">${d.data.name} - </span>${text_maker("click_to_zoom_out")}` :
      text_maker("click_rect_to_zoom_in")
  );
}



