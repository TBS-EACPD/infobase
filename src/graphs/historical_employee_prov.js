const {
  formats,
  text_maker,
  run_template,
  PanelGraph,
  years : {people_years},
  D3,
} = require("./shared"); 

const {provinces} = require('../models/businessConstants.js');


const prov_split_render = function(panel,data,options){

  const { graph_args } = data;

  const formater =  formats["big_int_real_raw"];
  const color_a =  a => `rgba(31, 119, 180,${a})`;

  let historical_graph_container;

  const row = panel.areas().graph.append("div").classed("frow no-container",true);
  const legend_area = row.append("div").classed("fcol-md-3 fcol-xs-12",true);
  const graph_area = row.append("div")
    .classed("fcol-md-9 fcol-xs-12",true)
    .style("position","relative");
  
  const has_qc = _.chain(graph_args.years_by_province)
    .map(d => _.has(d, "QC (minus NCR)"))
    .some()
    .value();
  const has_on = _.chain(graph_args.years_by_province)
    .map(d => _.has(d, "ON (minus NCR)"))
    .some()
    .value(); 

  // reformat the data for display
  //note: here we deep clone stuff because the graph_args should be immutable, because table dimensions are memoized
  const years_by_province = _.chain(graph_args.years_by_province)
    .map( obj => Object.assign({},obj) )  //deep clone each row  
    .each( year  => {
      if (year['QC (minus NCR)']) {
        year.QC = year['QC (minus NCR)'];
      } else if (has_qc) {
        graph_args.years_by_province
        year.QC = 0;
      }
      if (year['ON (minus NCR)']) {
        year.ON = year['ON (minus NCR)'];
      } else if (has_on) {
        year.ON = 0;
      }
      if (year["NCR ON"] || year['NCR QC']) {
        year.NCR = (year["NCR ON"] || 0 )+ (year['NCR QC'] || 0);
      }
      delete year['QC (minus NCR)'];
      delete year['ON (minus NCR)'];
      delete year['NCR ON'];
      delete year['NCR QC'];
    })
    .value()

  // calculate the maximum value to set the darkest
  // shading
  const max = d4.max(d4.values(_.last(years_by_province)));
  // use the max to calibrate the scale

  const color_scale = d4.scaleLinear()
    .domain([0,max])
    .range([0.2,1]);

  // add legend
  var list = D3.create_list(
    legend_area.node(),
    _.map( color_scale.ticks(5).reverse(), tick => 
      ({
        label : tick, 
        active : true,
      })
    ),
    {
      html : d => formater(d.label)+"+",
      legend : true,
      width : "100%",
      title : text_maker("legend"),
      ul_classes : "legend",
      interactive : false,
      colors : label => color_a(color_scale(accounting.unformat(label))),
    }
  );

  const ticks = _.map(people_years, y => `${run_template(y)}`);
  
  const canada_graph = new D3.CANADA.canada(graph_area.node(), {
    color : "rgb(31, 119, 180)",
    data : years_by_province,
    ticks : ticks,
    color_scale : color_scale,
    formater : formater,
  })

  if (!window.is_mobile) {
    // if it's not mobile, then the graph can go next to the map , under the legend

    historical_graph_container = d4.select(legend_area.node()).append("div");

    // copy the class names and style properties of the legend to ensure the graph fits in nicely
    historical_graph_container.node().className = list.legend.node().className;
    historical_graph_container.node().style.cssText = list.legend.node().style.cssText;
    
    historical_graph_container.styles({ 
      "margin-top" : "10px", 
    });

  } else {
    historical_graph_container  = d4.select(graph_area.node()).append("div");
  }


  const province_graph_title = function(prov){
    if (prov === 'ON' || prov === 'QC'){
      prov += " (minus NCR)";
    }
    if (prov === 'Canada' || prov === 'NCR'){
      return text_maker("five_year_history") + " " + prov;
    } else {
      return text_maker("five_year_history") + " " + provinces[prov].text;
    }
  }

  let active_prov;
  const add_graph = function(prov){

    var prov_data;
    var container = historical_graph_container;

    var no_data = false;
    if (prov !== "Canada") {
      prov_data = _.map(years_by_province, prov);
      no_data = _.every(prov_data,_.isUndefined);
    } 
    
    if (prov ==='Canada' || no_data) {
      prov = 'Canada';
      prov_data = _.map(years_by_province,function(year_data){
        return d4.sum(_.values(year_data));
      });
    }

    if (container.datum() === prov){
      return;
    } else {
      container.datum(prov);
    }
    //empty out the group
    container.selectAll("*").remove();
    // add title
    container.append("p")
      .classed("mrgn-bttm-0 mrgn-tp-0 centerer", true)
      .html(province_graph_title(prov));
    // add in the require div with relative positioning so the
    // labels will line up with the graphics
    container.append("div")
      .styles({ 
        "margin-bottom":"10px",
        position:"relative",
      });

    if(window.is_mobile ){ // create a bar graph
      (new D3.BAR.bar(
        container.select("div").node(),
        {
          colors : ()=>"#1f77b4",
          formater : formater,
          series : {"":prov_data},
          height : 200,
          ticks : ticks,
          margins: {top:10,bottom:10,left:10,right:10 },
        }
      )).render();

      container.selectAll("rect").styles({
        "opacity" :  color_scale(_.last(prov_data)) }); 
      container.selectAll(".x.axis .tick text")
        .styles({ 'font-size' : "10px" });
    } else { //use hbar

      (new D3.HBAR.hbar(
        container.select("div").node(),
        {
          x_scale : d4.scaleLinear(),
          // x_scale : d3.scale.linear(),
          axisFormater : formater,
          formater : formater,
          tick_number : 5,
          data : ticks.map((tick,i) => ({value : prov_data[i], name: tick}) ),
        }
      )).render();
    }
  };
  canada_graph.dispatch.on('dataMouseEnter',prov => {
    active_prov = true;
    add_graph(prov);    
  });
  canada_graph.dispatch.on('dataMouseLeave',() => {
    _.delay(() => {
      if (!active_prov) {
        add_graph("Canada");
      }
    }, 200);
    active_prov = false;

  });
  canada_graph.render();
  add_graph("Canada");

  // Add a11y table
  const ordered_provs = [ 
    {key: 'NCR', display: "NCR" },
  ].concat(
    _.chain(provinces)
      .map( (val,key) => ({ key, display: val.text }) )
      .reject( ({key}) => _.includes([
        'QC (minus NCR)',
        'ON (minus NCR)',
        "NCR ON",
        'NCR QC',
      ], key ) 
      )
      .value()
  );
  
  D3.create_a11y_table({
    container: panel.areas().graph, 
    label_col_header: text_maker("prov"), 
    data_col_headers: _.map(people_years, y => `${run_template(y)}`), 
    data: _.map(ordered_provs, function(op){
      return {
        label: op.display,
        data: _.map(years_by_province, function(ybp){
          return ybp[op.key];
        }),
      };
    }), 
    table_name : text_maker("historical_employee_prov_title"),
  });

};

new PanelGraph({
  level: "dept",
  key : "historical_employee_prov",
  info_deps: [
    'table10_dept_info',
    'table10_gov_info',
  ],
  depends_on: ['table10'],

  layout : {
    full : {text : 12, graph: [3,9]},
    half : {text : 12, graph: [12,12]},
  },

  text :  "dept_historical_employee_prov_text",
  title : "historical_employee_prov_title",
  include_in_bubble_menu : true,
  bubble_text_label : "geo_region",

  calculate(subject){
    const {table10} = this.tables;
    return { years_by_province : people_years.map( year => table10.prov_code(year,subject.unique_id)) };
  },

  render: prov_split_render,
});

new PanelGraph({
  level: "gov",
  key : "historical_employee_prov",
  depends_on: ['table10'],

  info_deps: [
    'table10_gov_info',
  ],
  layout : {
    full : {text : 12, graph: 12},
    half : {text : 12, graph: 12},
  },

  text :  "gov_historical_employee_prov_text",
  title : "historical_employee_prov_title",
  include_in_bubble_menu : true,
  bubble_text_label : "geo_region",

  calculate(){
    const {table10} = this.tables;
    return { years_by_province : people_years.map( year => table10.prov_code(year,false)) };
  },

  render: prov_split_render,
});

