let window_width_last_updated_at = window.innerWidth;

const GraphRegistry = {
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
    window_width_last_updated_at = window.innerWidth;

    this.registry.forEach( (graph_obj) => {
      graph_obj.outside_width = graph_obj.html.node().offsetWidth;
      graph_obj.outside_height = graph_obj.options.height || 400;
                  
      // Remove all labels associated with the graph (that is, all siblings of the svg's container).
      // Graphs with "preserve_labels_on_update" must be re-rendered with all labels intact, so nothing is removed here.
      const html_container = graph_obj.html.node();
      const preserve_labels = !_.isNull( html_container.querySelector("[preserve_labels_on_update]") );
      if (!preserve_labels){
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

const should_graphs_update = () => window.innerWidth !== window_width_last_updated_at;

window.addEventListener(
  "hashchange", 
  _.debounce(function(){ 
    GraphRegistry.update_registry();
  }, 250)
);
window.addEventListener(
  "resize", 
  _.debounce(function(){
    if ( should_graphs_update() ){
      GraphRegistry.update_registry();
      GraphRegistry.update_graphs();
    }
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

  GraphRegistry.add(instance);
};

GraphRegistry.setup_graph_instance = setup_graph_instance;

window._DEV_HELPERS.GraphRegistry = GraphRegistry;


export default GraphRegistry;