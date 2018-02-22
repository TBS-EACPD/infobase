exports = module.exports;
// module responsible for providing concentric circle navigation
// of departments. Based on the route, the departments will be
// organized differently.  For example, by ministry, or by their
// vote/stat components.
require('./dept_explore.scss');
const { text_maker } = require('../models/text.js')
require("./dept_explore.ib.yaml");
const { Dept, Gov } = require('../models/subject.js');
const { infograph_href_template } = require('../link_utils.js');
const ROUTER = require("../core/router.js");
const { PACK } = require('../core/D3');
const { abbrev } = require("../core/utils.js");
const { Table } = require('../core/TableClass.js');
const { deptSearch } = require('../search/search.js');
const {formats} = require('../core/format');
const {get_info} = require('../core/Statistics.js');
const { ensure_loaded } = require('../core/lazy_loader.js');
const { rpb_link } = require('../rpb/rpb_link.js');
let BubbleOrgList;


ROUTER.add_container_route("explore-{method}","_explore",function(container,method){
  this.add_crumbs([{html: text_maker("dept_explore_title")}]);
  this.add_title("dept_explore_title");

  d4.select(container).append('div').attr('class','sr-only')
    .html(a11y_markup({
      table4_link: rpb_link({
        preferTable: true,
        table: 'table4', 
        columns: [ 
          "{{pa_last_year}}exp",
        ],
        sorting_column : "{{pa_last_year}}exp",
        descending: true,
      }),
      table12_link: rpb_link({
        preferTable: true,
        table: 'table12',
        sorting_column : "{{pa_last_year}}",
        descending: true,
        columns: [ 
          "{{pa_last_year}}",
        ],
      }),
      igoc_link: "#igoc",
    }));

  const sub_app_container = d4.select(container).append('div').attr('aria-hidden',true);

  const spin_el =  new Spinner({scale:4}).spin().el;
  container.appendChild(spin_el)
  ensure_loaded({
    stat_keys : [ 
      'table4_gov_info', 
      'table12_gov_info',
    ],
    table_keys : [
      'table4',
      'table12',
    ],
  }).then(()=> {
    container.removeChild(spin_el);
    new BubbleOrgList(this.app,d4.select(this.nav_area),sub_app_container, method);
  });

});

const a11y_markup = ({ table4_link, table12_link, igoc_link }) => `<div class="sr-only">
  <h2>Explore the government's organizations...</h2>
    <ul> 
      <li> <a href="${table4_link}"> By their total spending  </a> </li>
      <li> <a href="${table12_link}"> By their employment numbers   </a> </li>
      <li> <a href="${igoc_link}"> By the type of organization   </a> </li>
    </ul>
</div>
`;

BubbleOrgList = function(app,nav_area,container,method){

  // match the different organization schemes to their respective
  // functions
  this.organization_schemes = {
    "dept" : {func: this.by_min_dept, href:"#explore-dept"},
    "people-total": {func:this.by_this_year_emp, href:"#explore-people-total"},
    "dept-type" : {func: this.by_dept_type, href:"#explore-dept-type"},
  };

  this.app = app;
  this.container = container;

  container.html( text_maker("explore_t"));
  var common_content = container.select(".common_content");

  const infos = get_info(
    Gov, 
    [
      'table4_gov_info', 
      'table12_gov_info',
    ]
  );

  var button_explain_text;
  var other_methods = _.chain(this.organization_schemes)
    .map(function(val,key){
      if (key === method){
        button_explain_text = "explore_" + key + "_text";
      }
      return {
        button_text : text_maker("by_"+key),
        href :val.href, 
        active : key === method,
      };
    })
    .value();

  common_content.html( text_maker("explore_common_t",{
    buttons : other_methods, 
    summary : text_maker("details"),
    __details : text_maker(button_explain_text, infos),
  }));
  this.organization_schemes[method].func.call(this);
};


var p = BubbleOrgList.prototype;
// responsible for determining which circle packing
// method should be used

p.by_min_dept = function(){
  // this function regroups departments into their respective ministries
  // 1 - all departments in table8 are obtained
  // 2 - the depratments are mapped into an object with three keys
  //      min, name, value=total_net_auth, _value
  //      becuase value will be changed during the softening, _value is held
  //      for the tooltip
  // 3 - departments with a 0 value are filtered out
  // 4 - departments are grouped by ministry
  // 5 - the ministry groups are mapped into new objects with three keys
  //      name, children=depts and value=sum of total net auth
  //      in addition, the relative value of each department's total not auth
  //      is softened for display purposes'
  var table = Table.lookup('table4');

  // group the departments by
  // minisries and then do a reduce sum to extract the fin size
  // of each ministry

  var min_objs =  _.chain(table.depts)
    .keys()
    .map(dept_code => ({ 
      dept: Dept.lookup(dept_code),
      last_year: table.q(dept_code).sum("{{pa_last_year}}exp"),
    }))
    .filter( ({last_year}) => _.isNumber(last_year) && last_year !== 0)
    .filter(({dept}) => !_.isUndefined(dept.status) && !_.isUndefined(dept.ministry) )
    .map( ({ dept, last_year}) => ({
      subj_obj : dept,
      min : dept.ministry.name,
      unique_id : dept.unique_id,
      name : dept.sexy_name,
      __value__ : last_year,
      value : Math.abs(last_year),
    }))
    .filter(d => d.value !== 0)
    .groupBy(_.property('min'))
    .map((depts, min_name) => {
      PACK.soften_spread(depts);
      return {
        name : min_name,
        children : depts,
        value : d4.sum(depts, _.property('value')),
        __value__ : d4.sum(depts, _.property('__value__')),
      };
    })
    .value();

  // nest the data for exploring
  var data = this.nest_data_for_exploring(min_objs,text_maker("goc_total"),[1,2,4,5] );
  _.each(min_objs, d => { delete d.value; });
  this.build_graphic(data,_.keys(table.depts));
};

p.by_dept_type = function(){
  var table = Table.lookup('table4');
  // group the departments by
  // minisries and then do a reduce sum to extract the fin size
  // of each ministry
  var min_objs =  _.chain(table.depts)
    .keys()
    .map(function(key){
      const dept = Dept.lookup(key);
      const total = table.q(key).sum("{{pa_last_year}}exp");
      return {
        subj_obj : dept,
        type : dept.type,
        unique_id : dept.unique_id,
        name : dept.sexy_name,
        __value__ : total,
        value : Math.abs(total),
      };
    })
    .filter(d => d.value !== 0)
    .groupBy(_.property('type'))
    .tap( dept_groups => _.each(dept_groups, depts => PACK.soften_spread(depts) ) )
    .map( (depts, type) => ({
      name : type,
      children : depts,
      value : d4.sum(depts, _.property('value')),
      __value__ : d4.sum(depts, _.property('__value__')),
    }))
    .value();

  // nest the data for exploring
  var data = this.nest_data_for_exploring(min_objs,text_maker("goc_total"), [1,2,6] );
  this.build_graphic(data,_.keys(table.depts));
};

p.by_this_year_emp   = function(){
  var table = Table.lookup("table12");
  var by_people =  _.chain(table.depts)
    .keys()
    .map(key => {
      const dept = Dept.lookup(key);
      const total = table.q(key).sum("{{pa_last_year}}");
      return {
        subj_obj : dept,
        unique_id : dept.unique_id,
        name : dept.sexy_name,
        __value__ : total,
        value : Math.abs(total),
      };
    })
    .filter(d => d.value !== 0)
    .value();

  // nest the data for exploring
  var data = this.nest_data_for_exploring(by_people, text_maker("goc_total"), [1,2.5] );
  this.build_graphic(data, _.keys(table.depts), formats["big_int_real"]); 
};

p.nest_data_for_exploring = function(to_be_nested, top_name, rangeRound){
  // pack the data using a specialised scale to create a two level packing
  rangeRound = rangeRound || [1,2,4,5];

  var data = PACK.pack_data(to_be_nested,text_maker("smaller_orgs"),{
    soften : true,
    scale : d4.scaleSqrt()
      .domain(d4.extent(to_be_nested, _.property('value')))
      .rangeRound(rangeRound),
    per_group : grp => {
      grp._value = d4.sum(grp.children,_.property('__value__'));
    },
  });

  data.name = top_name;
  return data;
};


p.build_graphic = function(data,depts,formater){
  formater = formater || formats.compact;
  const container = this.container;

  let chart;

  const dept_search_node = container.node().querySelector("#__dept_search");
  deptSearch( dept_search_node, {
    include_gov : true,
    search_text :  text_maker("org_search"),
    onSelect: subject => {
      dept_search_node.scrollIntoView();
      PACK.navigate_packing(
        chart.dispatch,
        chart.root,
        d => d.data.name === subject.sexy_name,
        750
      );
    },
  });
  d4.select(dept_search_node).attr('aria-hidden', true);
  
  const colors = d4.scaleOrdinal(d4.schemeCategory10);

  chart = new PACK.pack(
    container.select('.svg-container'),
    { height: 680 ,
      fill_func : d => {
        if (d.subj_obj && d.subj_obj.is("dept")){
          return colors(1);
        }
        return colors(0);
      },
    }
  );

  // this function will draw the breadcumb trail of circles
  // as the user explores,
  // ```
  // ```
  //  |----------------------|
  //  |   breadcrumb         |
  //  |----------------------|
  //  |                      |
  //  |                      |
  //  |   circles            |
  //  |                      |
  //  ------------------------
  // ```
  chart.dispatch.on("dataClick.breadcrumb",function(d){
    // `d` : the data bound to the current node
    var pointer=d; // used to walk back up the parent tree
    var parents=[]; // list of parents of the recently
    // clicked node
    var crumbs;
    var containers;
    var height=60;
    var scale;

    // walk up the parent chain and collect them
    while (pointer.parent != null && (typeof pointer.parent !== "undefined")){
    // while (pointer.parent != null && (typeof pointer.parent !== "undefined")){
      parents.push(pointer.parent);
      pointer = pointer.parent;

    }

    // d is added into the list of parents to create
    // list of all the bubbles
    parents.unshift(d);
    parents.reverse();

    // create the scale for sizing the radius of the circles
    scale = d4.scaleLinear()
      .domain([0,parents[0].r])
      .range([1.5,height/2]);

    // remove the link which might have been left over from
    // a department having previous been clicked on
    d4.select(".info_graph_link").remove();

    // bind the parents using the `rid` which is added by
    // [d4.pack.js](d3/pack.js)
    crumbs = d4.select("div.breadcrumb")
      .selectAll("div.crumb")
      .data(parents,function(x){ return x.rid;});

    crumbs.exit().remove();

    // create the container divs
    containers = crumbs
      .enter()
      .append("div")
      .attr("class",'crumb ')
      .styles({ 
        "margin":"10px 0px 0px 0px",
        "width":"200px",
        "float" : "left",
      })

    // containers is just the newly added
    // for each container, add an svg to hold the circle
    // crumbs.merge(containers)
    containers
      .append("div")
      .attr("class","svg-container")
      .style("height",height+10+"px")
      .append("svg")
      .attr("width","200")
      .append("circle")
      .attr("fill","rgba(37,114,180,0.7)")
      .attrs({
        cx : function(d){
          return this.parentNode.parentNode.offsetWidth/2;
        },
        cy : height/2,
        r : function(d){return scale(d.r);},
      })

    // for each container, add the label
    containers
      .append("div")
      .attrs({ "class" : "center-text" })
      .html(d => 
        _.isUndefined(d.parent) ?
        `${d.name} - ${formater(d.__value__)}` : 
        `${d.data.name} - ${formater(d.data.__value__)}`
      );

    // set the width of the breadcumbs container, if it overflows
    // the parent of the breadcrumb container has the overflow property
    // set to auto, so we'll get a scroll bar
    container.select("div.breadcrumb").style("width",parents.length*210+"px");

    d4.select("div.breadcrumb .clear").remove();
    d4.select("div.breadcrumb").append("div").attr("class","clear");

  });

  chart.render({
    zoomable : true,
    invisible_grand_parent : false,
    data: data,
    hover_text_func : d => d.data.name + " - " + formater(d.data.__value__),
    aria_label_func : d => ( 
      d.subj_obj ? 
      text_maker("a11y_see_infograph_for",{subject:d.subj_obj}) :
      text_maker("a11y_drill_down_label")
    ),
    href_func : d => ( d.data.subj_obj && infograph_href_template(d.data.subj_obj) ) || '',
    text_func : d => {

      const val = formater(d.data.__value__);
      if (d.zoom_r > 60) {
        return d.data.name + " - "+ val;
      } else if (d.zoom_r > 40) {
        return _.take(d.data.name.split(" "),2).join(" ")+ " - "+ val;
      } else {
        return abbrev(d.data.name + " - "+ val,5,false);
      }
    },
  });

};
