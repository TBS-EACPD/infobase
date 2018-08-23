import './dept_explore.scss';
import { StandardRouteContainer } from '../core/NavComponents.js';
import { infograph_href_template } from '../link_utils.js';
import { Pack } from '../core/charts_index.js';
import { abbrev } from '../core/utils.js';
import { deptSearch } from '../search/search.js';
import { formats } from '../core/format.js';
import { get_info } from '../core/Statistics.js';
import { ensure_loaded } from '../core/lazy_loader.js';
import { rpb_link } from '../rpb/rpb_link.js';
import { Subject } from '../models/subject.js';
import { text_maker, TM } from './text_provider.js';

import { by_dept_type, by_min_dept, by_this_year_emp } from './data_schemes.js';

const { Gov } = Subject;

let BubbleOrgList;

BubbleOrgList = function(container,method){

  // match the different organization schemes to their respective
  // functions
  this.organization_schemes = {
    "dept" : {func: by_min_dept, href:"#explore-dept"},
    "people-total": {func: by_this_year_emp, href:"#explore-people-total"},
    "dept-type" : {func: by_dept_type, href:"#explore-dept-type"},
  };

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

  const { data, keys, format } = this.organization_schemes[method].func();
  this.build_graphic(data,keys,format);
};


var p = BubbleOrgList.prototype;
// responsible for determining which circle packing
// method should be used



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
      Pack.navigate_packing(
        chart.dispatch,
        chart.root,
        d => d.data.name === subject.sexy_name,
        750
      );
    },
  });
  d3.select(dept_search_node).attr('aria-hidden', true);
  
  const colors = d3.scaleOrdinal(d3.schemeCategory10);

  chart = new Pack.Pack(
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
    scale = d3.scaleLinear()
      .domain([0,parents[0].r])
      .range([1.5,height/2]);

    // remove the link which might have been left over from
    // a department having previous been clicked on
    d3.select(".info_graph_link").remove();

    // bind the parents using the `rid` which is added by
    // [d3.pack.js](d3/pack.js)
    crumbs = d3.select("div.breadcrumb")
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

    d3.select("div.breadcrumb .clear").remove();
    d3.select("div.breadcrumb").append("div").attr("class","clear");

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

class BubbleExplore_ extends React.Component {
  componentDidMount(){ this._render(); }
  componentDidUpdate(){ this._render(); }
  render(){ return <div ref={el => this.el = el} /> }
  _render(){
    const { perspective } = this.props;
    const { el } = this;

    el.innerHTML = "";
    
    const sub_app_container = d3.select(el).append('div').attr('aria-hidden',true);

    const spin_el =  new Spinner({scale:4}).spin().el;
    el.appendChild(spin_el)
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
      el.removeChild(spin_el);
      new BubbleOrgList(sub_app_container, perspective);
    });

  }


}

function A11yContent(){
  const table4_link = rpb_link({
    preferTable: true,
    table: 'table4', 
    columns: [ 
      "{{pa_last_year}}exp",
    ],
    sorting_column : "{{pa_last_year}}exp",
    descending: true,
  });
  const table12_link= rpb_link({
    preferTable: true,
    table: 'table12',
    sorting_column : "{{pa_last_year}}",
    descending: true,
    columns: [ 
      "{{pa_last_year}}",
    ],
  });
  const igoc_link = "#igoc";

  return (
    <div className="sr-only">
      <div className="h2"> {"Explore the government's organizations..."} </div>
      <ul> 
        <li> <a href={table4_link}> By their total spending  </a> </li>
        <li> <a href={table12_link}> By their employment numbers   </a> </li>
        <li> <a href={igoc_link}> By the type of organization   </a> </li>
      </ul>
    </div>
  );
}



class BubbleExplore extends React.Component {
  render(){
    const {
      match: {
        params : {
          perspective,
        },
      },
    } = this.props; 

    return (
      <StandardRouteContainer
        title={text_maker("dept_explore_title")}
        breadcrumbs={[text_maker("dept_explore_title")]}
        route_key="_explore"
        non_a11y_route={true}
      >
        <h1> <TM tmf={text_maker} k="dept_explore_title" /> </h1>
        <A11yContent />
        <BubbleExplore_ perspective={perspective} />
      </StandardRouteContainer>
    )

  }
}

export { BubbleExplore };
