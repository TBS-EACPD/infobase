import common_charts_utils from './common_charts_utils.js';
import { make_unique } from '../core/utils.js';

const navigate_class = "navigate_packing";

var _setup_events = function(container){
  d3.select(container).on("click."+navigate_class, function(d){
    var target = d3.select(d3.event.target);
    var data = target.datum();
    if (!target.classed(navigate_class)){
      return;
    }
    navigate_packing(data.dispatch, data.packed_data,data.filter);
  });
};

var find_in_pack = function(packed_root, filter){
  if (filter(packed_root)){
    return packed_root;
  }
  if (packed_root.children && packed_root.children.length > 0){
    return _.chain(packed_root.children)
      .map(function(_packed_root){
        return find_in_pack(_packed_root, filter);
      })
      .compact()
      .head()
      .value();
  }
  return;
};

var add_parents = function(node){
  if (node.parent){
    return [node].concat( add_parents(node.parent) );
  }
  return [node];
};

var _navigate_packing = function(dispatcher,parents,speed){
  speed = speed || 501;
  if (parents.length === 0){
    return;
  }
  var head = _.head(parents);
  var matching_circle = d3.select("circle[rid='"+head.rid+"']").node();
  var navigate_to_next = function(){
    dispatcher.on("renderEnd.__nav__",undefined);
    _.delay(function(){
      _navigate_packing(dispatcher,_.tail(parents),speed);
    },speed);
  };

  dispatcher.on("renderEnd.__nav__",navigate_to_next);
  dispatcher.call("dataClick", matching_circle,head, {auto_focus_largest: false});
};

export const navigate_packing = function(dispatcher,packed_data,filter,speed){
  var target = find_in_pack(packed_data, filter);
  if (_.isUndefined(target)){
    return;
  }
  var parents = add_parents(target).reverse();
  _navigate_packing(dispatcher,parents,speed);
};

export const pack_data = function(data, level_name,options = {}){
  //
  // expects an array of objects
  //  and then packs them into a structure suitible for presentation
  //  this is useful for when there are large difference between the numbers
  //
  let attr = options.attr || 'value';
  if (options.force_positive){
    _.each(data, x => {
      x["__"+attr+"__"] = x[attr];
      x[attr] = Math.abs(x[attr]);
    });
  }
  if (options.filter_zeros){
    data = _.filter(data, x => x[attr] !== 0 );
  }
  let soften = _.isUndefined(options.soften) ? true : options.soften;
  let accessor = _.property(attr);
  const { level_assigner } = options;
  
  let groups = d3.nest()
    .key(d =>level_assigner(accessor(d)))
    .entries(data);

  let sorted = _.sortBy(groups,g => parseInt(g.key,10));

  // the value of pointer will be reassigned to new lower levels
  let rtn;
  let __value__;

  _.each(sorted,function(group,i){
    var softened = soften ? soften_spread(group.values,attr): group.values;
    if (i === 0){
      __value__ = d3.sum(softened, _.property("__value__"));
      rtn = {
        name: level_name, 
        children: softened, 
        __value__,
      };
    } else if (i === groups.length -1){
      softened = softened.concat(rtn);
      __value__ = d3.sum(softened, _.property("__value__"))
      rtn = {
        name: "", 
        children: softened, 
        __value__,
      };
    } else {
      softened = softened.concat(rtn);
      __value__ = d3.sum(softened, _.property("__value__"));
      rtn = {
        name: level_name, 
        children: softened, 
        __value__,
      };
    }
    if (options.per_group){
      options.per_group(rtn);
    }
  });
  return rtn;
};

export function soften_spread(data,attr = "value",p = 0.005){
  // expected array of objects with one particular attribute
  // whose value ranges from 0 upwards
  let accessor = _.property(attr);
  let max = d3.max(data,accessor);
  let map = d3.scaleLinear().domain([0,max]).range([p*max,max]);
  _.each(data, d => {
    d[attr] = map(d[attr]);
  });
  return data;
};

export class Pack { 
  constructor(container,options){
    _setup_events(container.node());
    // ```
    //  {
    //    name: '' ,
    //    value : 10000,
    //    children : [
    //  ]
    //  }
    //  ```

    common_charts_utils.setup_graph_instance(this,container,options);

    var _graph_area = this.svg.append("g").attr("class","_graph_area");
    this.graph_area = _graph_area.append("g").attr("class","inner_graph_area");

    _.bindAll(this,'setup_for_zoom',"mouse_enter", "mouse_leave", "hover_in","hover_out");

    this.current_hover_node = undefined;
    this.rand = Math.round(Math.random()*1000000); 
  }

  absolute_zoom_position(x,y){
    const parent_element = this.svg.node().closest(":not(svg)");       
    var offset = {
      top: parent_element.offsetTop,
      left: parent_element.offsetLeft,
    };
    var pos = this.zoom_position(x,y);
    return {x: pos.x+offset.left,y: pos.y+offset.top};
  }

  apply_scales(){
    var that = this;
    _.each(this.nodes, function(node){
      node.zoom_pos = that.zoom_position(node.x,node.y);

      node.absolute_zoom_pos = that.absolute_zoom_position(node.x,node.y);
      node.zoom_r = that.k * node.r;
    });
  }

  zoom_position(x,y){
    return {
      x: this.x_scale(x),
      y: this.y_scale(y),
    };
  }

  hover_out(d){
    this.current_hover_node = undefined;
    this.html.selectAll("div.full_label").remove();
  }

  hover_in(d){
    this.current_hover_node = d;
    // traverse back up to the
    this.html.append("div")
      .attr("class","full_label center-text")
      .attr("aria-hidden",true)
      .styles({
        "padding": "1px",
        "background-color": "#F0F0F0",
        "border-radius": "5px",
        "border": "1px solid grey",
        "font-size": "12px",
        "top": d.zoom_pos.y-d.zoom_r + "px",
        "left": this.translate[0]+d.zoom_pos.x + "px",
        "position": "absolute",
      })
      .html(this.hover_text_func(d));
  }

  add_zoom_out_link(node){
    var that = this;
    this.html.selectAll(".zoom a").datum(node);

    if (node.depth >=1 && node.children && !this.html.select(".zoom").node()){
      this.html
        .insert("div", "div.__svg__")
        .attr("class","zoom")
        .styles({
          "position": "absolute",
          "left": "10px",
          "top": "10px",
        })
        .append("button")
        .datum(node)
        .attr("href","#")
        .attr("class","zoom-out-link btn btn-sm btn-ib-primary")
        .html(window.lang === 'en' ? "Zoom Out" : "Dézoomer")
        .on("click",function(d){
          d3.event.preventDefault();
          var matching_circle = that.svg.select("circle[rid='"+d.parent.rid+"']").node();
          that.dispatch.call("dataClick", matching_circle, d.parent);
        });
    } else if (_.isUndefined(node.parent)){
      this.html.selectAll(".zoom").remove();
    }
  }

  setup_for_zoom(node){

    var that = this;
    
    this.add_zoom_out_link(node);

    var _setup_for_zoom = function(){

      if (node.children && node.children.length > 0){

        that.k = that.radius / node.r / 2;
        that.x_scale.domain([node.x - node.r, node.x + node.r]);
        that.y_scale.domain([node.y - node.r, node.y + node.r]);
        that.apply_scales();
        that.zoom_on_node(node);

      } else if (!node.children){
        var matching_link = that.html.select("div[rid='"+this.getAttribute("rid")+"'] a").node();
        if (matching_link){
          matching_link.focus();
          that.hover_in(node);
        } else {
          that.setup_for_zoom(node.parent);
        }
      }
    };

    this.html.selectAll(".full_label").remove();

    if (!(_.isUndefined(node.parent) || _.isNull(node.parent))){

      var svgnode = this.graph_area.selectAll("circle[rid='"+node.rid+"']");
      var fillopacity = svgnode.style("fill-opacity");
     
      var fill = svgnode.style("fill");
      var stroke = svgnode.style("stroke");

      svgnode
        .styles({
          "stroke-width": "5px",
          "stroke-opacity": "1",
          "stroke": "rgb(152, 223, 138)",
          "fill": "rgb(152, 223, 138)",
          "fill-opacity": 0.9,
        })
        .transition()
        .duration(500)
        .styles({
          "stroke-width": "1px",
          "stroke-opacity": "0.6",
          "stroke": stroke,
          "fill": fill,
          "fill-opacity": fillopacity,
        }) 
        .on("end",_setup_for_zoom);

    } else {
      _setup_for_zoom();
    }
  }

  render(options){
    
    this.options = _.extend(this.options,options);
    this.fill_func = this.options.fill_func || false;;
    this.colors = this.options.colors || common_charts_utils.tbs_color();
    this.invisible_grand_parent = _.isUndefined(this.options.invisible_grand_parent) ? true : this.options.invisible_grand_parent;
    // be default just add the empty # as the href 
    this.href_func = this.options.href_func || _.constant("#");
    this.aria_label_func = this.options.aria_label_func;
    this.cycle_colours = this.options.cycle_colours || false;
    this.top_font_size = this.options.top_font_size || 14;
    this.bottom_font_size = this.options.bottom_font_size || 12;
    this.zoomable = this.options.zoomable || false;
    this.auto_focus_largest = !_.isUndefined(this.options.auto_focus_largest) ? false : this.options.auto_focus_largest;
    let data = this.options.data;
    this.hover_text_func = this.options.hover_text_func || _.noop;
    this.text_func = this.options.text_func || _.property('name');
    this.on_focusout = this.options.on_focusout || _.noop;
    this.on_focusin = this.options.on_focusin || _.noop;
    this.radius = Math.min(this.outside_width, this.outside_height)-11;
    this.x_scale = d3.scaleLinear().range([0,this.radius]);
    this.y_scale = d3.scaleLinear().range([0,this.radius]);

    let value_attr = this.options.value_attr || "value";
    
    if (!this.pack) {
      this.pack = d3.pack();

      const root = this.root = d3.hierarchy(data)
        .sum(function(d) {return d[value_attr]; })
        .sort((a, b) => {return (b.value - a.value)});
    
      this.pack
        .padding(0)
        .size([this.radius,this.radius]);

      this.nodes = this.pack(root).descendants();

      // assign a unique id to each node
      _.each(this.nodes, n => n.rid = make_unique() );
    }

    this.translate = [(this.outside_width - this.radius)/2,10];
    
    // filter to only show the first two depths of the packed circles
    if (!this.zoomable){
      this.nodes = _.filter(this.nodes,d => d.depth <= 1);
    }

    // normal svg setuup with the height, width
    this.svg.attr("width", this.outside_width);
    this.svg.attr("height", this.outside_height);
  
    this.graph_area.attr("transform", "translate("+this.translate+")");

    this.dispatch.on("dataFocusIn.__",this.hover_in);
    this.dispatch.on("dataMouseEnter.__",this.hover_in);
    this.dispatch.on("dataFocusOut.__",this.hover_out);
    this.dispatch.on("dataMouseLeave.__",this.hover_out);
    // if the graph is zoomable, setup the event listeners and trigger
    // a zoom event on the root node
    // otherwise, don't handle click events and just render the graph
    // once
    if (this.zoomable){
      this.dispatch.on("dataClick.__zoom__", this.setup_for_zoom);
    } 
    _.delay(this.setup_for_zoom,0,this.nodes[0]);
    this.dispatch.call("dataClick","breadcrumb", this.nodes[0]);
    return this;
  }

  mouse_enter(d){
    if (d === this.current_hover_node){
      return;
    }
    this.dispatch.call("dataMouseEnter","__",d);
  }

  mouse_leave(d){
    this.dispatch.call("dataMouseLeave",d);
  }

  zoom_on_node(node){

    var that = this;
    var text_class;
    this.dispatch.call("renderBegin", node);

    var depth = this.depth = node.depth;

    // filter to the ondes which are being drawn
    // i.e. the current depth plus 2 down
    var nodes_shown = _.filter(this.nodes, d => d.depth <= depth +2)
    // filter to the ondes which are being drawn
    // i.e. only those who are children of the current node
    var nodes_with_text = _.chain(this.nodes)
      .filter(d => _.includes(node.children,d))
      // return negative value for reverse sort so
      // the text nodes are sorted according to the 
      // spiral display
      .sortBy(d => -d.value)
      .value();


    var font_scale = d3.scaleLinear()
      .domain(d3.extent(nodes_with_text, _.property('zoom_r')))
      .rangeRound([this.bottom_font_size,this.top_font_size]);

    // join the filtered data to the circles
    let circle = this.graph_area
      .selectAll("circle.node")
      .data(nodes_shown, _.property('rid'))

    // join the filtered data to any divs with labels
    circle.exit().remove();

    let new_circles = circle
      .enter()
      .append("circle")
      .attr("class","node")
      .attr("rid", _.property('rid'))
      .filter(d => !(d.depth === 0 && that.invisible_grand_parent ))
      .on("click", function(d){
          
        d3.event.preventDefault();
        if(d.parent !== null){
          var matching_circle = that.svg.select("circle[rid='"+d.parent.rid+"']").node();
          that.dispatch.call("dataClick", matching_circle, d);
        }

      })
      .styles({
        "pointer-events": d => (
          d.depth === depth+2 ? "none" : "all"
        ),
        "stroke": d => (
          d.__value__ && d.__value__ < 0 ? 
          "red" :
          "rgba(37,114,180,0.9)"
        ),
        "stoke-width": "2px",
        "stroke-opacity": d => {

          if (d.depth === 0 && that.invisible_grand_parent){
            return 0;
          }
          return 0.6;
        },
        "fill": d => {
          if ( this.fill_func) { 
            return this.fill_func(d);
          }
          if (d.__value__ && d.__value__ <0){
            return "red";
          }
          return "rgb(37,114,180)";
        },
        "fill-opacity": d => {
          if (d.depth === 0 && that.invisible_grand_parent){
            return 0;
          } else if ((d.depth === 0 && !that.invisible_grand_parent) ||
                      d.depth <= depth+1 ){
            return 0.2;
          } else {
            return 0.4;
          }
        },
      })
      .attrs({
        "cx": d => {return d.zoom_pos.x},
        "cy": d => d.zoom_pos.y,
        "r": d => d.zoom_r,
      });

    if ( !window.feature_detection.is_mobile() ){
      new_circles
        .on("mouseenter", this.mouse_enter)
        .on("mouseleave", this.mouse_leave);
    }

    var circles = circle
      .transition()
      .styles({
        "pointer-events": d => (
          d.depth === depth+2 ? "none" : "all"
        ),
        "stroke": d => (
          d.__value__ && d.__value__ < 0 ? 
          "red" :
          "rgba(37,114,180,0.9)"
        ),
        "stoke-width": "2px",
        "stroke-opacity": d => {
          if (d.depth === 0 && that.invisible_grand_parent){
            return 0;
          }
          return 0.6;
        },
        "fill": d => {
          if ( this.fill_func) { 
            return this.fill_func(d);
          }
          if (d.__value__ && d.__value__ <0){
            return "red";
          }
          return "rgb(37,114,180)";
        },
        "fill-opacity": d => {
          if (d.depth === 0 && that.invisible_grand_parent){
            return 0;
          } else if ((d.depth === 0 && !that.invisible_grand_parent) ||
                      d.depth <= depth+1 ){
            return 0.2;
          } else {
            return 0.4;
          }
        },
      })
      .attrs({
        "cx": d => d.zoom_pos.x,
        "cy": d => d.zoom_pos.y,
        "r": d => d.zoom_r,
      });

    if (this.cycle_colours){
      // the circles should be sorted so the colour application
      // will be predictable
      circles
        .filter(d=> d.depth === depth+1)
        .styles({
          "fill": (d,i)=> {
            return this.colors(i);
          },
          "stroke": (d,i)=> this.colors(i),
          "stroke-width": "2px",
          "fill-opacity": "0.5",
        });
    }

    text_class = "text"+this.rand;

    var text = this.html.selectAll("div."+text_class)
      .data(nodes_with_text,_.property('rid'))

    text.exit().remove();

    var text_divs = text
      .enter()
      .append("div")
      .attr("rid",_.property('rid'))
      .attr("class",text_class);
    if (this.zoomable){

      text_divs = text_divs
        .append("a")
        .attr("href",this.href_func)
        .attr("tabindex","0");
      if(this.aria_label_func){
        text_divs.attr('aria-label', this.aria_label_func);
      }
    }

    text_divs
      .classed("center-text",true)
      .styles({
        "color": "#000",
        "text-decoration": "none",
        "font-size": d => font_scale(d.zoom_r)+"px",
        "position": "absolute",
        "width": d => d.zoom_r*1.5+"px",
      })
      .attr("rid",d => d.rid)
      .html(this.text_func)
      .on("click", function(d){
        const href = that.href_func(d);
        if(_.isEmpty(href) || href === "#"){
          d3.event.preventDefault();
        }
        var matching_circle = that.svg.select("circle[rid='"+this.getAttribute("rid")+"']").node();

        that.dispatch.call("dataClick", matching_circle, d);
      })
      .on("blur", function(d){
        var matching_circle = that.svg.select("circle[rid='"+this.getAttribute("rid")+"']").node();

        that.dispatch.call("dataFocusOut",matching_circle,d);
      })
      .on("focus", function(d){
        var matching_circle = that.svg.select("circle[rid='"+this.getAttribute("rid")+"']").node();

        that.dispatch.call("dataFocusIn",matching_circle,d);
      })
      .transition()
      // after the transition time, the text has been rendered
      // and we can use the rendered height and width to position
      // it in the center of the circle
      .duration(1)
      .each(function(d,i){
        // by default focus on the first and largest element
        if (that.auto_focus_largest === true && i === 0){
          this.focus();
          if (!_.isUndefined(that.svg.node().parentNode.scrollIntoView)) {
            that.svg.node().parentNode.scrollIntoView();
          }
        }
        var t = d.zoom_pos.y - this.offsetHeight/2 + font_scale(d.zoom_r);

        var l = that.translate[0] + d.zoom_pos.x - this.offsetWidth/2; 
        d3.select(this).styles({
          "top": t+'px',
          "left": l+"px",
        });
      });


    if ( !window.feature_detection.is_mobile() ){
      text_divs
        .on("mouseenter", this.mouse_enter)
        .on("mouseleave", this.mouse_leave);
    }

    this.auto_focus_largest = true;
    this.dispatch.call("renderEnd", node); 

  }
}
