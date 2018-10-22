import { formats } from '../core/format.js';

const tbs_color = function(){
//
//
// return a d3 scale which will map an ordinal input domain
// to 9 individual TBS corporate colours.  Handy for chart
// legends without a large number of elements
// 
// For a large number of elements, use infobase_colors or 
//   d3.scale.category20
//
// conversion to RGB
//
//
  return d3.scaleOrdinal()
    .range([ 
      '#005172', 
      '#3095B4', 
      '#37424A', 
      '#63CECA',
      '#CD202C', 
      '#CCDC00',
    ]);
};

const add_grid_lines = function(direction, grid_line_area, axis, tick_size){
  const axis_clone = _.cloneDeep(axis);
  const tick_size_orientation = direction === "vertical" ? 1 : -1;

  grid_line_area
    .selectAll(".grid"+direction)
    .remove();

  grid_line_area
    .call(axis_clone
      .tickSize(tick_size_orientation*tick_size)
      .tickFormat("")
    )
    .selectAll("g.tick")
    .attr("class", "grid"+direction)
    .selectAll("line")
    .attrs({
      "fill": "none",
      "shape-rendering": "auto",
    })
    .styles({
      "stroke": "steelblue",
      "stroke-opacity": 0.3,
      "stroke-width": "1px",
    });

  grid_line_area
    .selectAll("path.domain")
    .remove();
};

const create_list = function(container, data,options){
  //
  //  `container` is html element
  //  `data` is an array of data objects with no standard
  //  applied as to the attributes, accessor functions are supplied
  //  through the `options` object below, however, if they aren't
  //  supplied, some defaults are provided
  //  options
  //  * `html` is funciton which extacts
  //   the relevant data to be displayed
  //  * `
  //  * `height` is a number
  //  * `legend` is the title
  //  * `ul_classes` : the classes applied to the list el
  //  * `li_classes` : the classes applied to each of the li
  //  * `interactive` - if set to true, will
  //   put all legend text in anchor elements
  //   and dispatch an event when they are clicked
  //  * `align` specifies whether to right or left align
  //     the legend
  //
  //
  options.key = options.key || ( (d,i) => i );
  options.colors = options.colors || ( () => "transparent" );
  options.legend = options.legend || false;
  options.html = options.html || _.identity;
  options.legend_class = options.legend_class || "";
  options.li_classes = options.li_classes || "";
  options.a_class = options.a_class || "";
  options.align = options.align || "center";
  const horizontal = options.orientation === 'horizontal';
  const non_interactive_legend = !options.interactive && options.legend;

  //added extra class to style legends with targetted specificity
  if (options.legend){
    options.legend_class = "legend-container " + (horizontal ? "horizontal " : "") + options.legend_class ;
    options.ul_classes = "legend-list-inline " + options.ul_classes;
    options.li_classes = "legend-list-el " + options.li_classes;
  }

  const dispatch = d3.dispatch("click", "hover");

  container = d3
    .select(container)
    .append("div")
    .attr("aria-hidden", options.legend)
    .classed("d3-list " + options.legend_class, true);

  if (horizontal) {
    options.ul_classes = "horizontal " + options.ul_classes;
  } else {
    container.classed("well", true);
  }
  
  // the height will not always be specified
  if (options.height){
    container.style("max-height", options.height+"px");
  }

  if (options.title && !horizontal) {
    container.append("p")
      .attr("class", "mrgn-bttm-0 mrgn-tp-0 nav-header centerer")
      .html(options.title);
  }

  const list = container
    .append("ul")
    .attr("class", "list-unstyled " + options.ul_classes)
    .style("margin-left", "5px")
    .selectAll("li.d3-list")
    .data(data, options.key);

  list.exit().remove();

  const new_lis = list
    .enter()
    .append("li")
    .attr("class","d3-list " + options.li_classes);

  // if the legend tag is true, then coloured squares  will be 
  // added
  if (options.legend) {
    new_lis
      .append("span")
      .attr("class", "legend-color-checkbox color-tag transparent_div")
      .styles({
        "float": "left",
        "width": "20px",
        "height": "20px",
        "border-radius": "3px",
        "margin-left": "5px",
        "margin-right": "5px",
      })
      .styles({ 
        "border": (d,i) => "1px solid " + options.colors( options.html(d) ),
      })
      .filter( (d) => d.active || non_interactive_legend )
      .styles({ 
        "background-color": (d,i) => options.colors( options.html(d) ),
      });
  }

  new_lis
    .append("div")
    .styles({
      "float": "left",
      "width": () => horizontal ? undefined : "75%",
    })

  list.merge(new_lis);

  // if interactive is true, then each of the items
  // will be placed inside an anchor element
  if (options.interactive){

    // make the coloured square created above clickable 
    new_lis
      .selectAll(".color-tag")
      .style("cursor", "pointer")
      .on( "click", (d,i) => dispatch.call("click", "", d, i, d3.select(this), new_lis) );

    new_lis
      .selectAll('div')
      .append("span")
      .attr("role", "button")
      .attr("tabindex", 0)
      .attr("class", "link-styled " + options.a_class)
      .on( "click", (d,i) => dispatch.call("click", "", d, i, d3.select(this), new_lis) )
      .on( "keydown", (d,i) => {
        if(d3.event.which === 13 || d3.event.which === 32){
          dispatch.call("click", "", d, i, d3.select(this), new_lis);
        }
      })
      .html(options.html);
  }
  
  if (!options.interactive){
    new_lis.selectAll('div').html(options.html);
  }

  new_lis.append("div").attr("class","clearfix");

  // return the dispatcher, the list of li, the first li and the container
  return {
    dispatch,
    new_lis,
    first: d3.select( new_lis.node() ),
    legend: container,
  };
};

const on_legend_click = function(graph, _colors){
  return function(d, i, el, list){
    //
    //  works with list which were bound using the 
    //  `charts_index.create_legend` function
    //  *  `d` : the data bound to the element
    //  *  `i` : the index of the clicked item 
    //  *  `el` : the actual clicked element
    //  *  `list` : the collection of items
    //  *  `each li` is expected to have bound data in the following
    //  format:
    //  ```javascript
    //    { label : "label", 
    //    data : [arrayofdata], 
    //    active : true/false}
    //  ```
    //
    d.active = !d.active;
    var data = {};

    var colors = _colors || infobase_colors();
    var tags = list.selectAll(".color-tag");

    tags.style("background-color", "transparent");
    
    const no_items_active = !list.filter( d => d.active ).node();
    if (no_items_active){
      d.active = true; // don't let the last active item in the list be deactivated
    }

    list.filter( d => d.active )
      .select(".color-tag")
      .each( d => data[d.label] = d.data )
      .styles({
        "background-color": d => colors(d.label),
      });

    // all graphs have a render function
    graph.render({
      colors: colors,
      series: data,
    });
  };
};

const graph_registry = {
  registry: [],
  
  add(instance){ 
    this.registry.push(instance);
  },

  update_registry(){
    var new_registry = this.registry.filter(
      (graph_obj) => document.body.contains( graph_obj.html.node() ) 
    );
    this.registry = new_registry;
  },
  
  update_graphs(){
    this.registry.forEach( (graph_obj) => {
      graph_obj.outside_width = graph_obj.html.node().offsetWidth;
      graph_obj.outside_height = graph_obj.options.height || 400;
                  
      // Remove all labels associated with the graph (that is, all siblings of the svg's container).
      // Graphs with "preserve_labels_on_update" must be re-rendered with all labels intact, so nothing is removed here.
      const svg_container = graph_obj.svg.node().parentNode;
      const preserve_labels = !_.isNull( svg_container.getAttribute("preserve_labels_on_update") );
      if (!preserve_labels){
        const html_container = graph_obj.html.node();

        // forEach directly on this nodeList is spoty, mapping it through to an array first works consistently though
        _.map(html_container.childNodes, _.identity) 
          .forEach(
            child => {
              if ( !_.isUndefined(child) && !child.className.includes("__svg__") ){
                html_container.removeChild(child);
              }
            }
          );
      }

      graph_obj.render(graph_obj.options);
    });
  },
};

window.addEventListener(
  "hashchange", 
  _.debounce(function(){ 
    graph_registry.update_registry();
  }, 250)
);
window.addEventListener(
  "resize", 
  _.debounce(function(){ 
    graph_registry.update_registry();
    graph_registry.update_graphs();
  }, 250)
);


const setup_graph_instance = function(instance, container, options = {}) {
  var base_dispatch_events = [
    "renderBegin",
    "renderEnd",
    'dataMouseEnter',
    'dataMouseLeave',
    'dataFocusIn',
    "dataFocusOut",
    "dataClick",
    "dataHover",  
    "dataHoverOut",
  ];

  instance.options = options;

  container
    .attr("aria-hidden", "true")
    .append("div")
    .classed("__svg__", true);

  if (options.alternative_svg){
    container.select(".__svg__").html(options.alternative_svg);
  } else {
    container.select(".__svg__").append("svg");    
  }

  instance.svg = container.select("svg");
  instance.outside_width = container.node().offsetWidth;
  instance.outside_height = options.height || 400;

  instance.html = container; 

  instance.dispatch = options.dispatch = d3.dispatch.apply(
    this,
    base_dispatch_events.concat(options.events || [])
  );

  graph_registry.add(instance);
};

window._graph_registry = graph_registry;

export default {
  formats,
  tbs_color,
  add_grid_lines,
  create_list,
  on_legend_click,
  graph_registry,
  setup_graph_instance,
}