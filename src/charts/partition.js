const D3CORE = require("./core");
const utils = require("../core/utils");
const {text_maker} = require("../models/text");
const vertical_placement_counters = {};
const cycle_colors = function(i){
  return d4.color(window.darkCategory10Colors[i % 10]);
};
const assign_colors_recursively = function(node,color){
  node.color = color;
  if (_.isUndefined(node.children)){ return; }
  _.each(node.children,(child,i)=>{
    assign_colors_recursively(child,color.brighter(0.15));
  });
};
const content_key = d=>d.id_ancestry;
const polygon_key = d=>d.target.id_ancestry;

export class Partition {
  constructor(container,options){
    this.outer_html = container.classed("__partition__",true);
    this.outer_html.html(`
      <div class='accessible sr-only'></div>
      <div class='visual' aria-hidden='true'>
         <div class='diagram-notes'>  </div>
         <div class='controls'>  </div>
         <div class='diagram'>  </div>
      </div>
    `);
    container = this.outer_html.select(".diagram");
    D3CORE.setup_graph_instance(this,container,options);
    this.defs = this.svg
      .append("defs");
    this.graph_area  = this.svg
      .append("g")
      .attr("class","graph_area");
    this.html
      .classed("__partition__",true)
      .style("position","relative")
      .style("zoom",0.4)
      .on("keydown", this.keydown_dispatch.bind(this))
      .on("focusin", this.focusin_dispatch.bind(this))
      .on("focusout", this.focusout_dispatch.bind(this))
      .on("click", this.click_dispatch.bind(this))
      .transition()
      .duration(500)
      .style("zoom",1)
      .on("end",this.render.bind(this));
  }
  render(options = {} ) {
    this.options = _.extend(this.options,options);
    this.popup_template = this.options.popup_template;
    this.dont_fade = this.options.dont_fade || [];
    const html_func = this.options.html_func;
    const data = this.data = this.options.data; 
    this.links =  this.data.links();
    const levels = data.to_open_levels();
    const height = this.options.height;
    const horizontal0_padding = 50;
    const horizontal_padding = 150;
    const col0_width = 250;
    const col_width = 350;
    const total_width = this.total_width = (_.keys(levels).length-1) * (col_width+ horizontal_padding) +  col0_width + horizontal0_padding;
    const yscale = d4.scaleLinear()
      .domain([0,data.root.value])
      .range([0,height]);

    _.each(data.root.children, (node,i)=> { 
      assign_colors_recursively(node, cycle_colors(i));
    });
    this.html.style("width",total_width + "px");

    this.outer_html.select(".visual")
      .style("width",total_width + "px");

    this.html_viewport_width = this.outer_html.node().offsetWidth;
    
    this.svg.attr("width", total_width);
    _.chain(levels)
      .keys()
      .each( key => vertical_placement_counters[key]= +key*30 )
      .value();
    const horizontal_placement_counters = _.mapValues(levels, (vals, key)=> {
      return +key === 0 ? 0 : col0_width + horizontal0_padding + (key-1)*(col_width+horizontal_padding);
    });

    this.html.selectAll("div.header").remove();

    this.html.selectAll("div.header")
      .data(_.keys(levels).sort().reverse())
      .enter()
      .filter(d=>d!=="0")
      .append("div")
      .classed("header",true)
      .style("left", (d,i)=>horizontal_placement_counters[+d]+"px") 
      .style("width", col_width+"px")
      .html(d=>{
        const has_plural = (
          _.chain(levels[+d])
            .map("data")
            .filter(d=>d.plural)
            .compact()
            .head()
            .value()
        );
        if (has_plural){
          return has_plural.plural();
        } 
        return "";
      });

    const html_content_join = this.html.selectAll("div.partition-content")
      .data(
        data.root.descendants().filter(d=>d.open), 
        content_key
      )
      .style("height" ,"")
      .each(function(d){
        d4.select(this)
          .select("div.partition-content-title")
          .classed("fat",false)
          .classed("right",d.data.is("compressed"))
          .html(html_func);
      }) ; //reset the calculated heights 
    html_content_join.exit().remove();

    const html_content_join_enter = html_content_join
      .enter()
      .append("div")
      .each(function(d){
        let sel = d4.select(this)
        
        if (d.value <0) {
          // Used in blanking out the striped negative value background consistently (for both fat and non-fat titles),
          // improves readability
          sel = sel
            .append("div")
            .classed("partition-negative-title-backing",true);
        } else if(d.data.is("compressed") && window.isIE()){
          // IE css for flex box and align-item are inconsistent, need an extra div
          // between the .content div and the .partition-content-title div to (partially) fix vertical alignment
          sel = sel
            .append("div")
            .classed("partition-right-ie-fix",true);
        }
        
        sel
          .append("div")
          .attr("tabindex", 0)
          .classed("partition-content-title",true)
          .classed("right",d.data.is("compressed"))
          .html(html_func);
      })
      .attr("class",d=>{
        let cls = 'partition-content';
        if (d===this.data.root){
          cls+= " root";
        }
        return cls;
      })
      .style("border-bottom","")
      .style("top",d=>{
        if (_.isNull(d.parent)){ 
          return "0px";
        }
        const index =  d.parent.children.indexOf(d);

        if ( index === 0 ){
          return d.parent.top + "px"
        } else {
          return d.parent.children[index-0].top +  d.parent.children[index-0].rendered_height + "px";
        }
      })
      .style("width", d=>{
        d.width = (d === data.root ? col0_width : col_width);
        return d.width + "px";
      });

    html_content_join_enter
      .merge(html_content_join)
      .each(function(d){
        d.DOM = this;
        d.scaled_height = yscale(Math.abs(d.value));
        d.polygon_links = new Map();
      })
      .classed("negative-value", d => d.value <0)
      .style("left", (d,i)=>horizontal_placement_counters[d.depth]+"px") 
      .style("height", d =>{
        d.rendered_height = Math.floor(d.scaled_height)+1;
        return d.rendered_height + "px";
      })
      .each(d=>{
        const d_node = d4.select(d.DOM);
        const title =  d_node.select(".partition-content-title").node();
        d.more_than_fair_space = title.offsetHeight > d.scaled_height;
        d_node
          .select(".partition-content-title")
          .classed("fat", d => d.more_than_fair_space && d.value >= 0 )
          .classed("negative-value", d => d.value <0);

        // IE fixes:  
        d_node
          .select(".partition-right-ie-fix")
          .classed("fat", d.more_than_fair_space )
          .style("margin-top", function(d){
            // use margin-top to fix vertical placement of +/-
            const content_height = this.parentElement.style.pixelHeight;
            const font_size = 12;
            if (d.more_than_fair_space && (content_height - font_size) < 0 ){
              return (content_height - font_size) + "px";
            } else {
              return "0px";
            }
          })
          .style("padding-top", function(d){
            // use padding-top to fix vertical placement of +/-
            const content_height = this.parentElement.style.pixelHeight;
            const font_size = 12;
            if (!d.more_than_fair_space){
              return (content_height*0.5 - font_size*0.75) + "px";
            } else {
              return "0px";
            }
          });
      })
      .style("background-color",d=> { 
        return d.color
      })
      .each(function(d){
        const level = d.depth;
        const title =  d4.select(d.DOM).select(".partition-content-title").node();
        const current_top =  vertical_placement_counters[level];
        const parent_top = d.parent ? d.parent.top : 0;
        const diff = (title.offsetHeight-d.DOM.offsetHeight)/2;
        let top_vertical_margin;
        if (d.parent && _.head(d.parent.children) !== d ){
          top_vertical_margin = 10;
        } else {
          top_vertical_margin = 25;
        }
        if (diff > 0 && diff > 0.5*top_vertical_margin){
          top_vertical_margin += diff;
        }
        const top = Math.max(parent_top, current_top);
        const height = Math.max(d.rendered_height, d.DOM.offsetHeight, title.offsetHeight);
        vertical_placement_counters[level] = top + height +  top_vertical_margin;
        d.top = top + top_vertical_margin;
      })
      .order();

    const total_height = _.max(_.values(vertical_placement_counters)) * 1.01;
    this.html.style("height", total_height + "px");
    this.svg.attr("height", total_height);

    const link_polygons = this.graph_area.selectAll("polygon.partition-svg-link")
      .data(_.filter(this.links,link => {
        return link.source.open && link.target.open && !link.target.data.unhidden_children;
      }), polygon_key);

    link_polygons.exit().remove();

    link_polygons
      .enter()
      .append("polygon")
      .classed("partition-svg-link",true)
      .merge(link_polygons)
      .each(function(d){
        d.source.polygon_links.set(d.target, d4.select(this));
      });

    this.html.selectAll("div.partition-content")
      .transition()
      .duration(1000)
      .style("top", function(d){ 
        return d.top + "px";
      })
      .on("start",d=> {
        if (d.children){
          d.height_of_all_children = d4.sum(d.children, child=>child.scaled_height || 0);
        }
        if (d.parent && !d.data.unhidden_children) {
          this.add_polygons(d)
        }
      });

    if (this.dont_fade.length >0){
      this.fade();
    }

    if (!_.isUndefined(this.unmagnify_all_popup)){
      this.remove_unmagnify_all_button();
    }
    if (this.are_any_children_magnified()){
      this.add_unmagnify_all_button();
    }
  }

  add_polygons(target){
    const source = target.parent
    if (target === source.children.filter( c => _.isUndefined(c.no_polygon) || !c.no_polygon )[0]){
      // (re)set vertical counter to source.top if drawing first polygon for this source
      source.vertical_counter = source.top;
    }
    if (!target.open || !source.open) { 
      return ; 
    }
    const target_x = target.DOM.offsetLeft;
    const target_y = target.top;
    const target_height = target.rendered_height;
    const source_x = source.DOM.offsetLeft + source.width; 
    const source_height = source.rendered_height * target.scaled_height/source.height_of_all_children;
    let tr,tl,br,bl,klass;
    tr = [target_x, target_y]; 
    tl = [source_x, source.vertical_counter];                      
    br = [target_x, target_y + target_height]; 
    bl = [source_x, tl[1] + source_height];  
    
    klass = bl[1] - tl[1] <= 1 ? "tiny" :  bl[1] - tl[1] < 5 ? "medium" :  'large';

    const gradient_def_id = target.color.toString().replace(/\(|\)|, /g,"-")+"grad";
    if (!this.defs.select("#"+gradient_def_id).node()) {
      const gradient_def = this.defs
        .append("linearGradient")
        .attr("id", gradient_def_id);

      gradient_def
        .append("stop")
        .attr("offset", "5%")
        .attr("stop-color", target.color)
        .attr("stop-opacity", "0.3");

      gradient_def
        .append("stop")
        .attr("offset", "95%")
        .attr("stop-color", target.color)
    }

    source.polygon_links.get(target)
      .classed(klass, true)
      .classed("root-polygon", d => d.source.parent === null)
      .style("fill",target.color)
      .attr("points", function(d){
        if (d4.select(this).attr("points")){
          return d4.select(this).attr("points");
        } else if (d.source.parent === null) {
          return `${tl} ${bl} ${bl} ${[0,bl[1]]} ${[0,tl[1]]} ${tl}`;
        } else {
          return `${tl} ${bl} ${bl} ${tl}`;
        }
      })
      .transition()
      .duration(1000)
      .attr("points", function(d){
        if (d.source.parent === null) {
          return `${tr} ${br} ${bl} ${[0,bl[1]]} ${[0,tl[1]]} ${tl}`;
        } else {
          return `${tr} ${br} ${bl} ${tl}`;
        }
      })
      .attr("stroke", "url(#"+gradient_def_id+")");

    source.vertical_counter += source_height ;
  }

  fade(data){
    const to_fade =  _.filter(data || this.data.root.descendants(),d=>!_.includes(this.dont_fade,d));
    this.svg.selectAll("polygon.partition-svg-link")
      .filter(d=> _.includes(to_fade,d.target))
      .classed("faded",true)
      .classed("highlighted",false);
    this.html.selectAll("div.partition-content")
      .filter(d=> _.includes(to_fade,d))
      .classed("faded",true);
  }

  unfade(data){
    if (this.dont_fade.length > 0) {
      data = data || this.dont_fade;
    } else {
      data = data || this.data.root.descendants();
    }
    const links = _.chain(data)
      .filter(source=>_.isArray(source.children))
      .map(source=> _.map(source.children, target=>({source,target})))
      .flatten(true)
      .value();
    this.graph_area.selectAll("polygon.partition-svg-link")
      .data(links,polygon_key)
      .filter(d=> links.length > 0 ? _.includes(links,d) : true)
      .classed("faded", false)
      .classed("highlighted",false);
    
    // The above doesn't select root polygons. If the data contains root, unfade root polygons here
    if (_.some(data, d => d.parent === null)) {
      this.graph_area
        .selectAll("polygon.partition-svg-link.root-polygon")
        .classed("faded", false)
        .classed("highlighted",false);
    }

    this.html.selectAll("div.partition-content")
      .data(data,content_key)
      .filter(d=> data.length > 0 ? _.includes(data,d) : true)
      .classed("faded",false);
  }
  
  // Same as unfade, but more discerning of polygons selected
  unfade_popup_parents(data){
    if (this.dont_fade.length > 0) {
      data = data || this.dont_fade;
    } else {
      data = data || this.data.root.descendants();
    }
    const lowest_node_id_ancestry = data[0].id_ancestry;
    const links = _.chain(data)
      .filter(source=>_.isArray(source.children))
      .map(source=> _.map(source.children, target=>({source,target})))
      .flatten(true)
      .filter(link => lowest_node_id_ancestry.includes(link.target.id_ancestry))
      .value();
    
    const unfade_parent_polygons = (polygon_selector) => {
      this.graph_area.selectAll(polygon_selector)
        .data(links,polygon_key)
        .filter(d=> links.length > 0 ? _.includes(links,d) : true)
        .classed("faded", false)
        .classed("highlighted",true);
    }
    unfade_parent_polygons("polygon.partition-svg-link.root-polygon");
    unfade_parent_polygons("polygon.partition-svg-link");

    this.html.selectAll("div.partition-content")
      .data(data,content_key)
      .filter(d=> data.length > 0 ? _.includes(data,d) : true)
      .classed("faded",false);
  }

  add_pop_up(d){
    if (_.isUndefined(d)){
      return;
    }
    this.fade();
    d4.select(d.DOM).node().focus();
    const content = d4.select(d.DOM);
    const popup_html = this.popup_template(d);
    let arrow_at_top;
    let pop_up_top;
    const pop_up = content
      .append("div")
      .classed("partition-popup",true)
      .style("border", `3px solid ${d.color}`)
      .style("left",0.9*d.DOM.offsetWidth +"px")
      .style("color",d.color)
      .html(popup_html);

    pop_up
      .style("top", function(d){
        let calculated_middle =  ( d.DOM.offsetHeight  - this.offsetHeight)/2;
        arrow_at_top =  d.DOM.offsetTop +  calculated_middle < 0 ;
        if (arrow_at_top){
          calculated_middle = -30;
        }
        pop_up_top = calculated_middle;
        return  calculated_middle  + "px";
      })

    // Pointer triangle made with css
    const popup_pointer = pop_up
      .append("div")    
      .attr("class","popup-pointer")
      .style("visibility", "hidden");

    const pointer_height = popup_pointer.node().offsetHeight;

    popup_pointer
      .style("top", -pop_up_top + d.DOM.offsetHeight/2 - pointer_height/2 - 3 + "px")
      .style("visibility", "visible");
    
    const absolute_pop_up_left = d.DOM.offsetLeft + pop_up.node().offsetLeft;
    scrollTo(absolute_pop_up_left, window.pageYOffset);
    pop_up.node().scrollIntoView();

    const to_be__highlighted = _.uniqBy(d.ancestors().concat(d.descendants()));
    this.unfade_popup_parents(to_be__highlighted);
    this.pop_up = d;
  }
  remove_pop_up(){
    d4.select(this.pop_up.DOM).select(".partition-popup").remove();
    d4.select(this.pop_up.DOM).node().focus();
    this.fade();
    this.unfade();
    this.svg.selectAll("polygon.partition-svg-link")
      .classed("highlighted",false);
    delete this.pop_up;
  }
  keydown_dispatch(){
    if (d4.event.keyCode === 13) {
      this.click_dispatch();
    }
  }
  focusin_dispatch(d){

  }
  focusout_dispatch(d){

  }
  click_dispatch(){
    // hold a reference to the current target
    const target = d4.select(d4.event.target);
    let content = utils.find_parent(d4.event.target,dom=>d4.select(dom).classed("partition-content"))
    // get a reference to the content 
    if (content === false) {
      if ( target.classed("unmagnify-all") ) {
        this.unmagnify_all();
        this.render();
      } else if (this.pop_up){
        this.remove_pop_up();
      } 
      // we're done with this event, ensure no further propogation
      d4.event.stopImmediatePropagation();
      d4.event.preventDefault();
      return;
    } 
    content = d4.select(content);
    const d = content.datum();
    if (d.DOM.className.includes("faded")){
      if (this.pop_up){
        this.remove_pop_up();
      } 
      d4.event.stopImmediatePropagation();
      d4.event.preventDefault();
      return;
    }
    if ( d.data.hidden_children 
      || d.data.unhidden_children 
      || this.data.collapsed(d)) {
      if (this.pop_up){
        this.remove_pop_up();
      } 
      if (d.data.unhidden_children) {
        this.data.show_partial_children(d.parent);
      } else if (d.data.hidden_children) {
        this.data.show_all_children(d.parent);
      } else if ( this.data.collapsed(d) ) {
        this.data.unhide_all_children(d);
        this.magnify(d); 
      }
      this.render();
      d4.event.stopImmediatePropagation();
      d4.event.preventDefault();
      return;
    }

    if ( target.classed("infographic") ) {
      //do nothing and let route be processed
      return;
    } else if ( target.classed("magnify") ) {
      this.remove_pop_up();
      if (d.magnified) {
        this.unmagnify(d);
      } else {
        this.magnify(d);
      }
      this.render();
    } else {
      if (this.pop_up){
        this.remove_pop_up();
      } else if (d !== this.data.root){
        this.add_pop_up(d); 
      }
    }
    d4.event.stopImmediatePropagation();
    d4.event.preventDefault();
  }
  unmagnify_all(){
    _.each(this.data.root.children, node => { if ( this.data.magnified(node) ){ this.data.unmagnify(node) } });
    if (this.should_remove_unmagnify_all_button()){
      this.remove_unmagnify_all_button();
    }
  }
  unmagnify(node){
    this.data.unmagnify(node)
    if (this.should_remove_unmagnify_all_button()){
      this.remove_unmagnify_all_button();
    }
  }
  magnify(node){
    this.data.magnify(node);
    if (_.isUndefined(this.unmagnify_all_popup)){
      this.add_unmagnify_all_button();
    }
  }
  add_unmagnify_all_button(){
    this.unmagnify_all_popup = this.html.append("div")
      .html(text_maker("partition_unfocus_all_popup"));
  }
  should_remove_unmagnify_all_button(){
    return !_.isUndefined(this.unmagnify_all_popup) && !this.are_any_children_magnified();
  }
  are_any_children_magnified(){
    return _.chain(this.data.root.children)
      .map(node => node.magnified)
      .some()
      .value();
  }
  remove_unmagnify_all_button(){
    this.unmagnify_all_popup.remove();
    delete this.unmagnify_all_popup;
  }
};



export class DataWrapper {
  constructor(root,show_partial_children,show_all_children){
    this.root = root;
    this.__show_partial_children = show_partial_children;
    this.__show_all_children = show_all_children;
  }
  to_open_levels(){
    const levels = {};
    this.root.each(node => {
      return (levels[node.depth] = levels[node.depth] || []).push(node)
    });
    return levels; 
  }
  links(){
    return _.chain(this.branches())
      .map(source=>source.children.map(target=>({source,target})))
      .flatten(true)
      .value();
  }
  branches(){
    return _.filter([this.root].concat(this.root.descendants()), node=> node.children);
  }
  show_partial_children(node){
    let children;
    // get rid of the minimize placeholder node
    node.children = node.children.filter(d=>_.isUndefined(d.data.unhidden_children));
    if (node.children) {
      children = this.__show_partial_children(node);
    }
    node.children = children
    return children;
  }
  show_all_children(node){
    if (!this.magnified(node)) {
      node.value = node.__value__;
    }
    if (node.children){
      const children = this.__show_all_children(node);
      _.chain(children)
        .difference(node.children)
        .filter(node=>node.value!==0)
        .each(child=>{
          child.eachAfter(d=>{
            if (d.children){
              d.children = this.__show_partial_children(d)
            }
          })
        })
        .value();
      node.children = children;
      node.eachAfter(c=> {
        if (!this.collapsed(c)) {
          c.open=true
        }
      });
      return children;
    }
  }
  hide_all_children(node){
    node.eachAfter(c=> c.open=c===node);
  }
  unhide_all_children(node){
    node.eachAfter(c=> c.open=true);
  }
  restore(node){
    if (!node.data.hidden_children && !node.data.unhidden_children) {
      node.value = node.__value__;
      this.show_partial_children(node);
    } else if (this.is_placeholder(node) && !_.isUndefined(node.data.hidden_children)) {
      node.value = d4.sum(node.data.hidden_children, child => child.__value__);
    }
  }
  unmagnify(node){
    node.value = node.__value__;
    const factor = 1/node.magnified;
    this.resize_children(node,factor);
    node.value = node.__value__;
    node.magnified = false;
    const parent = node.parent;
    if (!_.some(parent.children, d=> d.magnified)){
      parent.children
        .forEach(d=>{
          this.restore(d);
          this.unhide_all_children(d);
        })
    } else {
      node.value = 0;
      this.hide_all_children(node);
    }
  }
  magnify(node){
    const parent = node.parent;
    const top_sibling = parent.children[0];
    node.value = node.__value__;
    let factor;
    if ( node.value > 0.7 * top_sibling.__value__) {
      factor = 2;
    } else {
      factor = Math.abs(top_sibling.__value__/node.__value__);
    }
    this.resize_children(node,factor);
    node.magnified = factor;
    const siblings = parent.children.filter( d=> (
      d !== node && 
      !this.magnified(d)  &&
      d.value !== 0
    )); 
    _.each(siblings, d=>{
      d.value = 0
      this.hide_all_children(d);
    })
  }                     
  resize_children(node,factor){
    node.value *= factor;
    node.open = true;
    if (node.children){
      _.each(node.children, d=>{
        this.resize_children( d, factor );
      })
    }
    if (node.data.hidden_children){
      _.each(node.data.hidden_children, d=>{
        this.resize_children( d, factor );
      })
    } 
  }
  is_placeholder(node){
    return node.data.hidden_children || node.data.unhidden_children;
  }
  collapsed(node){
    return _.some(node.ancestors(), d=>d.value === 0);
  }
  magnified(node){
    return _.some(node.ancestors(), d=>d.magnified);
  }
};
