import text from './TreeMap.yaml'; 
import { create_text_maker } from '../models/text.js';
import { formats } from '../core/format.js';
import classNames from "classnames";
import { smaller_items_text } from './data.js';
import { get_static_url } from '../request_utils.js';


const text_maker = create_text_maker(text);

let currentMouseX, currentMouseY;
function updateMousePositionVars(evt){
  currentMouseX = evt.clientX;
  currentMouseY = evt.clientY;
}
export class TreeMap extends React.PureComponent {
  render(){
    return <div ref={div => this.el = div } />
  }
  _update(){
    this._imperative_render();
  }
  componentDidMount(){
    this._update = _.bind(this._update, this);
    window.addEventListener("resize", this._update)
    window.addEventListener("mousemove", updateMousePositionVars);
    this._update();
  }
  componentDidUpdate(){
    this._update();
  }
  componentWillUnmount(){
    window.removeEventListener("resize", this._update)
    window.removeEventListener("mousemove", updateMousePositionVars);

  }

  _imperative_render(){

    const { 
      data,
      colorScale,
      tooltip_render,
      node_render,
      side_bar_title,
    } = this.props;

    const el = this.el;

    let height=700;
    if(window.feature_detection.is_mobile()){
      height= Math.ceil(0.8*screen.height);
    }

    el.innerHTML=`<div>
      <div class="frow no-gutters">
        <div id="treemap-viz-container" class=" fcol-md-10">
          <div class="TreeMap__ZoomControl">
            <div class="TreeMap__ZoomControl__Text"></div>
          </div>
          <div
              class="viz-root"
              style="
                position:relative;
                min-height: ${height}px;"
              >
            </div>
        </div>
        <div style="padding-left: 1px; padding-bottom: 2px" class=" fcol-md-2 sm-hide">
          <div 
            class="TreeMap__SideBar"
            style="min-height:100%"
          >
            <div>
              <ul>
                <li>
                  <a href="#treemap/drf"> DRF spending </a>
                </li>
                <li>
                  <a href="#treemap/tp"> Transfer Payments </a>
                </li>
                <li>
                  <a href="#treemap/vote_stat"> Vote stat items </a>
                </li>
                <!-- <li>
                  <a href="#treemap/org_results"> Organization results </a>
                </li> -->
              </ul>
            </div>
            <div class="TreeMap_SideBar__Title">
              ${side_bar_title}
              <hr class="BlueHLine"/>
            </div>
            <div class="TreeMap_SideBar__Text">
            </div>
          </div>
        </div>
      </div>
    </div>`;

    const html_root = d3.select(el).select('div');

    
    // the actual treemap div
    const zoom_ctrl = html_root.select('.TreeMap__ZoomControl');
    const viz_root = html_root.select('.viz-root');
    const side_menu = html_root.select('.TreeMap__SideBar');

    const width = viz_root.node().offsetWidth;
    const ratio = 3;

    // sets x and y scale to determine size of visible boxes
    const x = d3.scaleLinear()
      .domain([0, width/3])
      .range([0, width]);
    const y = d3.scaleLinear()
      .domain([0, height]) 
      .range([0, height]);
    
    const treemap = d3.treemap()
      .tile(d3.treemapSquarify.ratio(1))
      .size([width / ratio, height]);

    
    let transitioning;
    
  
    // d3 creating the treemap using the data
    const root = data;
    treemap(root
      .sum( d => _.isEmpty(d.children) ? d.size : 0 ) // ternary to avoid double counting
      .sort( (a, b) => {
        if(a.data.name === smaller_items_text){ 
          return 9999999 
        }
        if(b.data.name === smaller_items_text){
          return -9999999 
        }
        return b.value - a.value || b.height - a.height 
      })
    );
    
    const main = display(root);
    //node_render is special, we call it once on first render (here) 
    //and after transitions
    main.selectAll('.TreeMapNode__ContentBoxContainer').call(node_render);

    function display(d) {
      // inserts text on the top bar
      zoom_ctrl
        .datum(d.parent)
        .classed("TreeMap__ZoomControl--has-zoom-out", !!d.parent)
        .on('click', transition)
        .select('.TreeMap__ZoomControl__Text')
        .html(zoom_ctrl_text(d));


      //sidebar
      const side_bar_text_items = side_menu
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
        });

      const g1 = viz_root.insert('div')
        .datum(d)
        .attr('class', 'depth');
      
      g1.html("");
      const main = g1.selectAll('.TreeMap__Division')
        .data(d.children)
        .enter()
        .append('div')

      // add class and click handler to all g's with children
      if(!window.feature_detection.is_mobile()){
        main
          .filter( d => d.children )
          .classed('TreeMap__Division', true)
          .on('click', transition)
      } else {
        main
          .filter( d => d.children )
          .classed('TreeMap__Division', true)
      }

      main.selectAll('.TreeMap__Rectangle--is-child')
        .data( d => d.children || [d] )
        .enter()
        .append('div')
        .attr('class', 'TreeMap__Rectangle TreeMap__Rectangle--is-child')
        .call(rectan)

      main.append('div')
        .attr('class', 'TreeMap__Rectangle TreeMap__Rectangle--is-parent')
        .call(rectan)

      //TODO: some of this needs to be put into functions
      if(!window.feature_detection.is_mobile()){
        main.append('div')
          .attr('class', d => classNames('TreeMapNode__ContentBoxContainer', !_.isEmpty(d.children) && "TreeMapNode__ContentBoxContainer--has-children") )
          .on("mouseenter", function(d) {
            const el = this;
            setTimeout(()=> {
              const coords = el.getBoundingClientRect();
              if( !(
                currentMouseX >= coords.left && currentMouseX <= coords.right &&
                currentMouseY >= coords.top && currentMouseY <= coords.bottom
              )){
                return;
              }
              var tool = d3.select(this).append("div")
                .attr("class", "TM_TooltipContainer")
                .style("opacity", 0);
              tool.transition()
                .style("opacity", 1);
              tool
                .call(tooltip_render)
            }, 300)
          })
          .on("mouseleave", function(d) {
            d3.select(this)
              .selectAll('.TM_TooltipContainer')
              .filter(tooltip_data => tooltip_data === d)
              .remove();
          })
          .call(treemap_node_content_container)
      } else{
        main.append('div')
          .attr('class', d => classNames('TreeMapNode__ContentBoxContainer', !_.isEmpty(d.children) && "TreeMapNode__ContentBoxContainer--has-children") )
          .on("click", function(d) {
            //debugger;
            if(d.toolTipped){
              d3.select(this)
                .selectAll('.TM_TooltipContainer')
                .remove();
              d3.select(this).classed("TreeMapNode__ContentBoxContainer--tapped",false);
              d.toolTipped = false;
              if(d.children){
                transition(d);
              }
            } else{
              //remove others first
              d3.selectAll('.TM_TooltipContainer')
                .remove();
              d3.selectAll('.TreeMapNode__ContentBoxContainer')
                .classed("TreeMapNode__ContentBoxContainer--tapped",false)
                .each(function(d) {
                  d.toolTipped = false;
                });
              d3.select(this).classed("TreeMapNode__ContentBoxContainer--tapped",true);
              setTimeout(()=> {
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
        viz_root.selectAll('.depth').sort( (a, b) => a.depth - b.depth );

        // Transition to the new view.
        t1.selectAll('.TreeMap__Rectangle').call(rectan);
        t2.selectAll('.TreeMap__Rectangle').call(rectan);

        // Remove text when transitioning, then display again
        t1.selectAll('.TreeMapNode__ContentBox').style('display', 'none');
        t1.selectAll('.TreeMapNode__ContentBoxContainer').call(treemap_node_content_container);
        t2.selectAll('.TreeMapNode__ContentBox').style('display', 'block');
        t2.selectAll('.TreeMapNode__ContentBoxContainer').call(treemap_node_content_container);

        t2.selectAll('.TreeMapNode__ContentBoxContainer').call(treemap_node_content_container);

        // Remove the old node when the transition is finished.
        t1.on('end.remove', function(){
          this.remove();
          transitioning = false;
          viz_root.style("overflow","visible");
          g2.selectAll('.TreeMapNode__ContentBoxContainer').call(node_render);
        });
      }
      return main;
    }
  
    // Draw the coloured rectangles
    function rectan(sel) {
      sel.styles( d=> ({
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
        .styles(d=> ({
          left: `${x(d.x0)}px`,
          top: `${y(d.y0)}px`,
          width: `${x(d.x1) - x(d.x0)}px`,
          height: `${y(d.y1) - y(d.y0)}px`,
        }))
        // .select('.textdiv').style('opacity', d=> (y(d.y1) - y(d.y0)) < 45 ? 0 : 1) //TODO do we still need this? 
    }

   
  }
}

function zoom_ctrl_text(d) {
  return (
    d.parent ? 
    `<span class="TreeMap__ZoomControl__Title">${d.data.name} - </span>${text_maker("click_to_zoom_out")}` :
    text_maker("click_rect_to_zoom_in")
  );
}


const chevron_html = `<img class="TreeMap__SideBar__Chevron" src=${get_static_url("svg/chevron.svg")}/>`;
const sidebar_item_html = function(d){
  return (`
  ${ d.parent ? chevron_html : ""}
  <div> ${d.data.name} </div>
  <div> ${formats.compact1(d.data.amount)} </div>
`)
}

