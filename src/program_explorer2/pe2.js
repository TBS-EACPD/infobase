require("./pe2.ib.yaml");
const ROUTER = require("../core/router.js");
const { ensure_loaded } = require('../core/lazy_loader.js');
const {text_maker,run_template} = require("../models/text");
const {formats : {compact1,big_int_real}} = require('../core/format.js');
const {PARTITION}= require("../core/D3");
const utils = require("../core/utils");
const Subject = require("../models/subject");
const {
  value_functions,
  create_ministry_hierarchy,
  create_spend_type_hierarchy,
  create_tag_hierarchy,
  create_org_info_hierarchy,
  mock_model,
} = require("./hierarchies"); 
const { reactAdapter } = require('../core/reactAdapter');
const {
  TextMaker,
  AutoAccordion,
} = require('../util_components');

const formaters = {
  "exp" : compact1,
  "fte" : big_int_real,
  "org_info" : big_int_real,
};
const wrap_in_brackets = (text) => " (" + text + ")";
const templates = {
  "exp" : "partition_spending_was",
  "fte" : "partition_fte_was",
  "org_info" : "partition_org_info_was",
}
const url_template = (method,value)=>`#partition/${method}/${value}`;
const search_required_chars = 1;
const search_debounce_time = 500;

ROUTER.add_container_route("partition/:method:/:value_attr:","partition",function(container,method="dept",value_attr="exp"){
  
  this.add_crumbs([{html: text_maker("partition_title")}]);
  
  const spinner = new Spinner({scale:4});
  spinner.spin(document.querySelector('#app'));

  ensure_loaded({
    table_keys : ['table6', 'table12','table305'],
  }).done(()=> {
    new GovPartition(this.app, d4.select(container), method,value_attr);
  }).done(()=> {
    spinner.stop();
  });
});

const show_partial_children = function(node){
  if (!node.children ){
    return ;
  }
  if( !_.isUndefined(_.last(node.children).data.hidden_children)){ 
    return node.children;
  }
  let to_be_shown,to_be_compressed, new_compressed_child, children;
  if (_.isFunction(node.how_many_to_show)){
    [to_be_shown,to_be_compressed] = node.how_many_to_show(node);
  } else {
    if (node.how_many_to_show >= node.children.length){
      to_be_shown = node.children;
      to_be_compressed = [];
    } else {
      to_be_shown = _.take(node.children,node.how_many_to_show);
      to_be_compressed = _.tail(node.children,node.how_many_to_show);
    }
  }
  if ( to_be_compressed.length > 0  ) {
    new_compressed_child = Object.assign(
      d4.hierarchy({}),
      {  
        height : node.height-1,
        depth : node.depth+1,
        id_ancestry : _.reduce(to_be_compressed, (memo,x)=>memo+"-"+x.data.id, "compressed>")+"-<compressed-"+node.id_ancestry,
        open : true,
        parent : node,
        value : d4.sum( to_be_compressed,x=>x.value),
        __value__ : d4.sum( to_be_compressed,x=>x.value),
        data : mock_model(
          _.map( to_be_compressed , x=>x.data.id)+"compressed",
          "+",
          "",
          "compressed",
          {hidden_children :  to_be_compressed}
        ),
      }
    );
    children = to_be_shown.concat(new_compressed_child);
  } else {
    children = to_be_shown;
  }
  return children;
};

const show_all_children = function(node){
  let children;
  const compressed = _.last(node.children);
  if (!_.isUndefined(compressed.data.hidden_children)){
    children = node.children.concat(compressed.data.hidden_children);
    compressed.data.unhidden_children = compressed.data.hidden_children
    delete compressed.data.hidden_children;
    compressed.data.id = "minimize"+compressed.id_ancestry;
    compressed.value =  1;
    compressed.data.name = "-";
    _.each(children,_node=> {
      _node.parent=node;
    });
  } else {
    children = node.children;
  }
  return children;
};

const get_common_popup_options = d => {
  return {
    year: run_template("{{pa_last_year}}"),
    up_to: false,
    exp: d.exp,
    exp_is_negative: d.exp < 0,
    fte: d.fte,
    org_info: d.org_info,
    name: d.data.name,
    tags: d.data.tags,
    level: d.data.level,
    id: d.data.id,
    color: d.color,
  };
}

class GovPartition {
  constructor(app, container,method,value_attr){

    // A negative margin-left value is explicitly set, and kept updated, on .partition-container so that the 
    // extra wide partition area can effectively escape the narrow main.container area, which we're forced in 
    // to by the Canada.ca banner/WET. Styling this would be so much easier without that...
    this.container = container.append("div")
      .classed("partition-container",true)
      .style("margin-left", -d4.select("main.container").node().offsetLeft+"px");
    window.addEventListener("resize", () => {
      this.container.style("margin-left", -d4.select("main.container").node().offsetLeft+"px");
    });

    this.chart = new PARTITION.Partition(this.container, {
      height : 700,
    });
    const sort_vals = this.sort_vals = _.sortBy([ 
      { id: "exp", text: text_maker("spending"), presentation_schemes: ["goca", "dept", "hwh", "st"] },
      { id: "fte", text: text_maker("fte_written"), presentation_schemes: ["goca", "dept", "hwh"] },
      { id: "org_info", text: text_maker("orgs"), presentation_schemes: ["org_info_all", "org_info_with_data"] },  
    ], d => d.id === value_attr ? -Infinity : Infinity);

    this.all_presentation_schemes = [
      { id: "goca", text: text_maker("spending_area_plural") },
      { id: "dept", text: text_maker("ministries") },
      { id: "hwh", text: Subject.Tag.tag_roots.HWH.name },
      { id: "st", text: text_maker("type_of_spending") },
      { id: "org_info_all", text: text_maker("by_all") },
      { id: "org_info_with_data", text: text_maker("all_orgs_with_data") },
    ];

    const presentation_schemes = _.chain(this.all_presentation_schemes)
      .filter(d => _.indexOf(sort_vals[0].presentation_schemes, d.id) !== -1)
      .sortBy(d => d.id === method ? -Infinity : Infinity)
      .value();

    this.container.select(".controls").html(text_maker("partition_controls",{
      presentation_schemes,sort_vals,search:true, 
    }));
    
    this.container.select("input.search").on("keydown", () => {
      // Prevent enter key from submitting input form 
      // (listening on the submit event seems less consistent than this approach)
      if(d4.event.which == 13){
        d4.event.stopPropagation();
        d4.event.preventDefault();
      }
    });
    this.container.select("input.search").on("keyup", this.search_handler.bind(this));

    this.container.select(".select_value_attr").on("change", this.change_value_attr.bind(this));
    this.container.select(".select_root").on("change", this.reroot.bind(this));
    this.container.select(".partition-control-block > .glyphicon").on("click", this.add_intro_popup.bind(this));
    this.container.select(".partition-control-block > .glyphicon").on("keydown", () => {
      if(d4.event.which == 13){
        this.add_intro_popup.call(this);
      }
    });

    this.container.select(".accessible.sr-only").html(text_maker("partition_sr_only_content"));

    this.method = presentation_schemes[0].id;
    this.value_attr = sort_vals[0].id;
    this.root_id = 0; // counter to append to root of each hierarchy, makes identifying ancestry_id values unique even in D3 merge step
    ROUTER.navigate(url_template(this.method,this.value_attr),{navigate:false});
    this[this.method]();
  }
  change_value_attr(){
    this.value_attr = d4.event.target.value;

    // Filter presentation_schemes to those available on this method
    const sort_val = _.find(this.sort_vals, d => d.id === this.value_attr);
    const presentation_schemes = _.chain(this.all_presentation_schemes)
      .filter(d => _.indexOf(sort_val.presentation_schemes, d.id) !== -1)
      .sortBy(d => d.id === this.method ? -Infinity : Infinity)
      .value();
    this.method = presentation_schemes[0].id;

    ROUTER.navigate(url_template(this.method,this.value_attr),{navigate:false});

    // Update presentation_schemes dropdown options
    const presentation_scheme_dropdown = this.container.select(".select_root");
    presentation_scheme_dropdown.selectAll('option').remove();
    presentation_scheme_dropdown
      .selectAll('option')
      .data(presentation_schemes)
      .enter()
      .append('option')
      .attr('value', d => d.id)
      .html(d => d.text);
    
    // Blink background colour of .select-root form to indicate that the options have updated
    presentation_scheme_dropdown
      .transition()
      .duration(200)
      .ease(d4.easeLinear)
      .style("background-color", "#b8d3f9")
      .transition()
      .duration(100)
      .ease(d4.easeLinear)
      .style("background-color", "#ffffff")
      .transition()
      .duration(100)
      .ease(d4.easeLinear)
      .style("background-color", "#b8d3f9")
      .transition()
      .duration(200)
      .ease(d4.easeLinear)
      .style("background-color", "#ffffff");

    this[this.method]();
  }
  reroot(){
    this.method = d4.event.target.value;
    ROUTER.navigate(url_template(this.method,this.value_attr),{navigate:false});
    this[this.method]();
  }
  dept(){
    const skip_crsos = true;
    this.hierarchy_factory =  ()=>create_ministry_hierarchy(this.value_attr,skip_crsos,this.root_id+=1);
    const hierarchy = this.hierarchy = this.hierarchy_factory(value_functions[this.value_attr]);
    this.hierarchy
      .each(node => {
        node.__value__ = node.value;
        node.open = true
        if (node.data.is("gov")){
          node.how_many_to_show = 8;
        } else if (node.data.is("ministry")){
          node.how_many_to_show = function(_node){
            if (_node.children.length === 2){ return [_node.children,[]];}
            const show = [_.head(_node.children)];
            const hide = _.tail(_node.children);
            const unhide = _.filter(hide, __node=> __node.value > hierarchy.value/50);
            return [show.concat(unhide),_.difference(hide,unhide)];
          }
        } else if (node.data.is("dept") || node.data.is("crso")){
          node.how_many_to_show = function(_node){
            if (_node.children.length === 2){ return [_node.children,[]];}
            const show = [_.head(_node.children)];
            const hide = _.tail(_node.children);
            const unhide = _.filter(hide, __node=> __node.value > hierarchy.value/50);
            return [show.concat(unhide),_.difference(hide,unhide)];
          }
        }
      })
      .each(node => { 
        if (! _.isUndefined(node.children) ) {
          node.children = show_partial_children(node);
        }
      })

    this.value_formater = d => wrap_in_brackets(formaters[this.value_attr](d[this.value_attr]));
    
    this.popup_template = function(d){
      const common_popup_options = get_common_popup_options(d);
      if (d.data.is("program")) {
        return text_maker("partition_program_popup", 
          _.extend(common_popup_options, {
            description: d.data.description,
            dept_name: d.data.dept.name,
            dept_id: d.data.dept.id,
          })
        );
      } else if (d.data.is("dept")) {
        return text_maker("partition_org_or_goca_popup", 
          _.extend(common_popup_options, {
            description: d.data.mandate,
          })
        );
      } else if (d.data.is("ministry")) {
        return text_maker("partition_ministry_or_sa_popup", 
          _.extend(common_popup_options, {
            focus_text: d.magnified ? text_maker("partition_unfocus_button") : text_maker("partition_focus_button"),
          })
        );
      }
    }

    this.update_diagram_notes();

    this.enable_search_bar();

    // If search active then reapply to new hierarchy, else normal render
    const query = this.container.select("input.search").node().value.toLowerCase();
    if(query.length >= search_required_chars){
      this.search_actual(query);
    } else {
      this.render();
    }
  }
  hwh(){
    this.hierarchy_factory = ()=>create_tag_hierarchy("HWH",this.value_attr,this.root_id+=1);
    const hierarchy = this.hierarchy = this.hierarchy_factory(value_functions[this.value_attr]);
    this.hierarchy
      .each(node => {
        node.__value__ = node.value;
        node.open = true
        if (node.data.is("tag") && node.children[0].data.is("tag")){
          node.how_many_to_show = Infinity;
        }else if (node.data.is("tag") && node.children[0].data.is("program")){
          node.how_many_to_show = function(_node){
            if (_node.children.length <= 1){ return [_node.children,[]];}
            const show = [_.head(_node.children)];
            const hide = _.tail(_node.children);
            const unhide = _.filter(hide, __node=> __node.value > hierarchy.value/100);
            return [show.concat(unhide),_.difference(hide,unhide)];
          }
        }
      })
      .each(node => {
        node.children = show_partial_children(node);
      });

    this.value_formater = d => d.data.is("tag") ?
      wrap_in_brackets(text_maker("up_to") + " " + formaters[this.value_attr](d[this.value_attr])) :
      wrap_in_brackets(formaters[this.value_attr](d[this.value_attr]));
    
    this.popup_template = function(d){
      const common_popup_options = get_common_popup_options(d);
      if (d.data.is("program")) {
        return text_maker("partition_program_popup", 
          _.extend(common_popup_options, {
            up_to: false,
            dept_name: d.data.dept.name,
            dept_id: d.data.dept.id,
            description: d.data.description,
          })
        );
      } else if (d.data.is("tag")) {
        return text_maker("partition_hwh_tag_popup", 
          _.extend(common_popup_options, {
            up_to: true,
            description: d.data.description,
            focus_text: d.magnified ? text_maker("partition_unfocus_button") : text_maker("partition_focus_button"),
          })
        );
      }
    }

    this.update_diagram_notes("MtoM_tag_warning");

    this.enable_search_bar();

    // If search active then reapply to new hierarchy, else normal render
    const query = this.container.select("input.search").node().value.toLowerCase();
    if(query.length >= search_required_chars){
      this.search_actual(query);
    } else {
      this.render();
    }
  }
  goca(){
    this.hierarchy_factory = ()=>create_tag_hierarchy("GOCO",this.value_attr,this.root_id+=1);
    const hierarchy = this.hierarchy = this.hierarchy_factory(value_functions[this.value_attr]);

    this.hierarchy
      .each(node => {
        node.__value__ = node.value;
        node.open = true
        if (node.data.is("tag") && node.children && node.children[0] && node.children[0].data.is("tag")){
          node.how_many_to_show = Infinity;
        } else if (node.data.is("tag") && node.children[0].data.is("program")){
          node.how_many_to_show = function(_node){
            if (_node.children.length <= 1){ return [_node.children,[]];}
            const show = [_.head(_node.children)];
            const hide = _.tail(_node.children);
            const unhide = _.filter(hide, __node=> __node.value > hierarchy.value/100);
            return [show.concat(unhide),_.difference(hide,unhide)];
          }
        }
      })
      .each(node => {
        node.children = show_partial_children(node);
      })
   
    this.value_formater = d => wrap_in_brackets(formaters[this.value_attr](d[this.value_attr]));
    
    this.popup_template = function(d){
      const common_popup_options = get_common_popup_options(d);
      if (d.data.is("program")) {
        return text_maker("partition_program_popup", 
          _.extend(common_popup_options, {
            dept_name: d.data.dept.name,
            dept_id: d.data.dept.id,
            description: d.data.description,
          })
        );
      } else if (d.data.is("tag") && d.children[0].data.is("program")) {
        return text_maker("partition_org_or_goca_popup", 
          _.extend(common_popup_options, {
            description: d.data.description,
          })
        );
      } else if (d.data.is("tag") && d.children[0].data.is("tag")) {
        return text_maker("partition_ministry_or_sa_popup", 
          _.extend(common_popup_options, {
            description: d.data.description,
            focus_text: d.magnified ? text_maker("partition_unfocus_button") : text_maker("partition_focus_button"),
          })
        );
      }
    }

    this.update_diagram_notes();

    this.enable_search_bar();

    // If search active then reapply to new hierarchy, else normal render
    const query = this.container.select("input.search").node().value.toLowerCase();
    if(query.length >= search_required_chars){
      this.search_actual(query);
    } else {
      this.render();
    }
  }
  st(){
    this.value_attr  = "exp";
    this.hierarchy_factory = ()=>create_spend_type_hierarchy( this.value_attr,  this.root_id+=1 );
    const hierarchy = this.hierarchy = this.hierarchy_factory(value_functions[this.value_attr]);

    this.hierarchy
      .each(node => {
        node.__value__ = node.value;
        node.open = true
        if (node.data.is("gov") ||  node.data.is("type_of_spending") ){
          node.how_many_to_show = Infinity;
        } else if (node.data.is("so") ){
          node.how_many_to_show = function(_node){
            if (_node.children.length <= 1){ return [_node.children,[]];}
            const show = [_.head(_node.children)];
            const hide = _.tail(_node.children);
            const unhide = _.filter(hide, __node=> __node.value > hierarchy.value/100);
            return [show.concat(unhide),_.difference(hide,unhide)];
          };
        }
      })
      .each(node => {
        node.children = show_partial_children(node);
      })
   
    this.value_formater = d => wrap_in_brackets(formaters[this.value_attr](d[this.value_attr]));

    this.popup_template = function(d){
      const common_popup_options = get_common_popup_options(d);
      if (d.data.is("program_fragment")) {
        return text_maker("partition_program_popup", 
          _.extend(common_popup_options, {
            up_to: false,
            dept_name: d.data.dept.name,
            dept_id: d.data.dept.id,
            level: "program",
            id: d.data.program_id,
            description: d.data.description,
          })
        );
      } else if (d.data.is("so")) {
        return text_maker("partition_so_popup", 
          _.extend(common_popup_options, {
            description: d.data.description,
          })
        );
      } else if (d.data.is("type_of_spending")) {
        return text_maker("partition_ministry_or_sa_popup", 
          _.extend(common_popup_options, {
            focus_text: d.magnified ? text_maker("partition_unfocus_button") : text_maker("partition_focus_button"),
          })
        );
      }
    }

    this.update_diagram_notes("program_SOBJ_warning");

    this.disable_search_bar();

    this.render();
  }
  org_info_all(){
    const only_orgs_with_data = false;
    this.org_info(only_orgs_with_data);
  }
  org_info_with_data(){
    const only_orgs_with_data = true;
    this.org_info(only_orgs_with_data);
  }
  org_info(only_orgs_with_data){
    this.value_attr = "org_info";
    this.hierarchy_factory = ()=>create_org_info_hierarchy( this.value_attr, this.root_id+=1, only_orgs_with_data);
    this.hierarchy = this.hierarchy_factory(value_functions[this.value_attr]);
    
    this.hierarchy
      .each(node => {
        node.__value__ = node.value;
        node.open = true
        node.how_many_to_show = Infinity;
      });
   
    this.value_formater = d => !d.data.is("dept") ?
      wrap_in_brackets(formaters[this.value_attr](d[this.value_attr]) + " " + text_maker("orgs")):
      "";

    this.popup_template = function(d){
      const common_popup_options = get_common_popup_options(d);
      if (d.data.is("dept")) {
        return text_maker("partition_org_info_org_popup", 
          _.extend(common_popup_options, {
            description: d.data.mandate,
            inst_form_name: d.parent.data.name,
            ministry_name: d.parent.parent.data.name, 
          })
        );
      } else if (d.data.is("inst_form")) {
        return text_maker("partition_org_info_inst_form_popup", 
          _.extend(common_popup_options, {
            description: d.data.description,
            ministry_name: d.parent.data.name,
          })
        );
      } else if (d.data.is("ministry")) {
        return text_maker("partition_org_info_ministry_popup", 
          _.extend(common_popup_options, {
            focus_text: d.magnified ? text_maker("partition_unfocus_button") : text_maker("partition_focus_button"),
          })
        );
      }
    }

    this.update_diagram_notes();

    this.enable_search_bar();

    this.render();
  }
  render(){
    const default_formater = d => formaters[this.value_attr](d[this.value_attr]);
    const value_formater = this.value_formater || default_formater;
    const template = templates[this.value_attr];
    const wrapper = new PARTITION.DataWrapper(
      this.hierarchy,
      show_partial_children,
      show_all_children
    );
    const show_root_rollup = this.method !== "hwh" && this.method !== "st";

    this.chart.render({
      data : wrapper,
      popup_template: this.popup_template,
      dont_fade : this.dont_fade,
      html_func : function(d){
        const should_add_value = (
          Math.abs(d.value) / wrapper.root.value > 0.02 &&
           _.isUndefined(d.data.hidden_children)
        );
        let name;
        if (should_add_value && d !== wrapper.root) {
          name = d.data.name + value_formater(d);
        } else if ( !should_add_value && d !== wrapper.root){
          name =  utils.abbrev(d.data.name, 80);
        } else if ( d === wrapper.root ) {
          name = text_maker(template, {x:wrapper.root.value, show_root_rollup});
        }
        return name;
      },
    });
  }
  enable_search_bar(){
    const partition_control_search_block = this.container
      .selectAll(".partition-control-block")
      .filter(function(){
        return this.querySelectorAll(".form-control.search").length;
      });
    const partition_control_search_input = partition_control_search_block.select(".form-control.search");
    if (partition_control_search_input.property("disabled")){
      partition_control_search_input
        .property("disabled", false);

      partition_control_search_block
        .transition()
        .duration(300)
        .ease(d4.easeLinear)
        .style("opacity", "1")
        .style("height", partition_control_search_block.node().previousElementSibling.offsetHeight + "px");
    }
  }
  disable_search_bar(){
    const partition_control_search_block = this.container
      .selectAll(".partition-control-block")
      .filter(function(){
        return this.querySelectorAll(".form-control.search").length;
      });
    const partition_control_search_input = partition_control_search_block.select(".form-control.search");
    if (!partition_control_search_input.property("disabled")){
      this.dont_fade = [];

      partition_control_search_input
        .property("disabled", true);
      
      partition_control_search_block
        .transition()
        .duration(300)
        .ease(d4.easeLinear)
        .style("opacity", "0")
        .style("height", "0px");
    }
  }
  // Where the actual search happens
  search_actual(query) {
    this.dont_fade = [];
    this.search_matching = [];
    
    const search_tree = this.hierarchy_factory();
    const deburred_query = _.deburr(query).toLowerCase();

    search_tree.each(node=>{
      if (
        node.data.is("dept") && 
           (
             _.deburr(node.data.acronym.toLowerCase()) === deburred_query ||
             _.deburr(node.data.fancy_acronym.toLowerCase()) === deburred_query ||
             _.findIndex(node.data.name.toLowerCase().split(" "), word => _.deburr(word) === deburred_query) !== -1 ||
             _.findIndex(node.data.applied_title.toLowerCase().split(" "), word => _.deburr(word) === deburred_query) !== -1
           )
      ) {
        this.search_matching.push(node);
        _.each(node.children, children => this.search_matching.push(children));
      } else if (node.data.search_string.indexOf(deburred_query) !== -1){
        this.search_matching.push(node);
      }
    });  
    const to_open = _.chain(this.search_matching)
      .map(n=>n.ancestors())
      .flatten(true)
      .uniq()
      .value();
    const how_many_to_be_shown = node=> {
      const partition =  _.partition(node.children, child=>_.includes(to_open,child))
      return partition;
    }; 
    
    search_tree
      .each(node => {
        node.value = node[this.value_attr],
        node.__value__ = node.value;
        node.open =  true;
        node.how_many_to_show = how_many_to_be_shown
        if (_.includes(this.search_matching,node)){
          this.dont_fade.push(node);
          node.id += "found";
        }
      })
      .each(node => {
        node.children = show_partial_children(node);
      });
    _.each(_.last(search_tree.children).data.hidden_children, node =>{
      node.eachAfter(d=>{
        d.how_many_to_show = 1;
      });
    });

    this.hierarchy = search_tree;
    this.render();
  }
  // Deals with event details and debouncing
  search_handler(){
    d4.event.stopImmediatePropagation();
    d4.event.preventDefault();
    const query = d4.event.target.value.toLowerCase();
    this.search_matching = [] || this.search_matching;

    this.debounced_search = this.debounced_search || _.debounce(this.search_actual, search_debounce_time);

    this.debounced_refresh = this.debounced_refresh || _.debounce(function(){
      this.dont_fade = [];
      this.search_matching = [];
      this[this.method]();
    }, search_debounce_time/2);

    if (d4.event.keyCode === 13 ||
        d4.event.keyCode === 37 ||
        d4.event.keyCode === 38 ||
        d4.event.keyCode === 39 ||
        d4.event.keyCode === 40) {
      // Bail on enter and arrow keys. Note: this DOESN'T bail already debounced searches
      return;
    }
    if (query.length < search_required_chars) {
      this.debounced_search.cancel();
      if (query.length === 0){
        this.debounced_refresh.call(this);
      }
    } else {
      this.debounced_refresh.cancel();
      this.debounced_search.call(this, query);
    }
  }
  add_intro_popup(){
    const partition_control_info = this.container.select("#partition-control-info-button");

    if (!partition_control_info.select(".partition-intro").node()){
      const intro_popup = partition_control_info.append("div")
        .classed("partition-popup", true)
        .classed("partition-intro", true)
        .html(text_maker("partition_intro_popup"));

      const tab_catch_before = intro_popup.append("a")
        .attr("id","tab-catch-before")
        .attr("tabindex", 0);

      const tab_catch_after = partition_control_info.insert("a", ".glyphicon")
        .attr("id", "tab-catch-after")
        .attr("tabindex", 0);

      const intro_popup_fader = this.container.select(".visual")
        .insert("div",".controls")
        .classed("partition-diagram-fader",true)
        .style("width", this.container.select(".visual").node().offsetWidth+"px");

      const intro_popup_cleanup = function(){
        intro_popup.remove();
        intro_popup_fader.remove();
        tab_catch_after.remove();
      }
   
      intro_popup_fader.on("click", intro_popup_cleanup);
      tab_catch_before.on("focusout", intro_popup_cleanup);
      tab_catch_after.on("focusout", intro_popup_cleanup);
    } else {
      this.container.select(".partition-diagram-fader").on("click")();
    }
  }
  update_diagram_notes(note_text_key){
    const diagram_note_div = this.container.select(".diagram-notes");
    if (!note_text_key) {
      // smoothly transition the height and opacity 0
      diagram_note_div
        .style("height", this.offsetHeight+"px")
        .transition()
        .ease(d4.easePoly)
        .duration(600)
        .style("height", "0px")
        .style("opacity", 0);
      // NOTE: the react isn't unmounted here, timing that to happen after the transition would be
      // more hacky than it is worth. Unmounting is done at the start of the next content-containing update
    } else {
      // unmount any existing (but currently hidden) notes
      ReactDOM.unmountComponentAtNode(diagram_note_div.node());

      // reset diagram-note div height and opacity
      diagram_note_div
        .style("height", "100%")
        .style("opacity", 1);

      // update the diagram-note div with react AutoAccordian containing note content
      const view = <div className="mrgn-bttm-sm">
        <AutoAccordion 
          title={text_maker("some_things_to_keep_in_mind")}
          usePullDown={true}
        >
          <div style={{paddingLeft: '10px', paddingRight:'10px'}}>
            <TextMaker text_key={note_text_key} />
          </div>
        </AutoAccordion>
      </div>;
      reactAdapter.render( view, diagram_note_div.node());

      // now open the AutoAccordian, to get the nice height transition
      diagram_note_div.select(".pull-down-accordion-header").node().click();
    }
  }
}
