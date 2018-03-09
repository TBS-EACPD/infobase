require("./welcome_mat.ib.yaml");
require("./welcome-mat.scss");

const classNames = require('classnames');
const {
  formats,
  text_maker,
  run_template,
  PanelGraph,
  reactAdapter,
  util_components: { TextMaker },
  years : {std_years, planning_years},
} = require("../shared"); 

const {
  Bar,
  Line,
} = require('../../charts/declarative_charts.js');


const pane_templates = {
  exp : {
    was:  "spending_was",
    changed_to: "spending_change_was",
    will_be: "spending_change_will",
    will_be_1: "spending_will_be_1",
    bad_dept_will_be : "spending_authority_this_year",
    bad_dept_no_main_will_be : "no_spend_auth_this_year",
    no_history : "no_historical_spending",
  },
  fte : {
    was: "fte_was",
    changed_to: "fte_change_was",
    will_be:  "fte_change_will",
    will_be_1:  "fte_will_be_1",
    no_history : "no_historical_fte",
  },
};

// react function to make individual panes
const Pane = props => {

  const s = props.parent_props.subject;
  const header = _.find(props.parent_props.calcs.headers,{key:props._key});
  const half_layout = props.parent_props.half_layout;
  const calcs = props.parent_props.calcs;
  const template =  pane_templates[props.row_key];


  const no_data_because_not_provided = (
    !calcs.planning_or_fte_data && 
    (s.is("program") || s.is("tag") || s.is("crso")) && 
    props._key === 'will_be'
  );

  const no_data_because_new_program =  (
    props._key === "changed_to" &&
    (s.is("program") || s.is("crso")) && calcs.new_program 
  );

  const no_data = no_data_because_not_provided || no_data_because_new_program;
  if (no_data ){
    return null;
  }
  let template_key;;

  //FCAC funding comes from stat exp, no mains.
  if (!calcs.planning_or_fte_data && (s.acronym !== "FCAC") && s.is("dept") && props._key === 'will_be' ){
    template_key = "bad_dept_will_be";
  } else if (!calcs.planning_or_fte_data && ((s.acronym === "FCAC")) && s.is("dept") && props._key === 'will_be' ){
    template_key = "bad_dept_no_main_will_be";
  } 
  else if (props._key === "was" 
  && calcs.new_program && (s.is("program") || s.is("crso"))) {
    template_key =  "no_history";
  } else {
    template_key = props._key;
  }

  // need to use this method in order to stack 4 elements (can't have nesting or else it will ruin the flex styling)

  const dangerousHTML = `
    <div class="mat-grid__inner-panel mat-grid__inner-panel--large ${half_layout ?"": "mat-grid__inner-panel--large-hide"}">
      ${text_maker(header.header)}
    </div>
    ${text_maker(template[template_key],calcs[props.row_key])}
    ${(s.is("tag") && s.root.cardinality === "MtoM")? text_maker("tag_maximum") : ""}
  `;

  return (
    <div 
      className={`mat-grid__lg-panel${half_layout ? 100 : header.span} mat-grid__sm-panel`}>
      <div 
        className='mat-grid__inner-grid welcome-mat-rect' 
        dangerouslySetInnerHTML={{__html : dangerousHTML}}
      />
    </div>
  );
};

// react function to make the EXP and FTE rows
const GridRow = props => {
  const {
    half_layout,
    subject,
    calcs,
    _key,
  } = props;

  const { new_program } = calcs;

  if (!calcs.planning_or_fte_data && _key === "fte"){
    return null;
  }

  const ticks = create_ticks(subject, calcs);
  const graph_color = new_program ? _.constant('#335075') : _.constant('black');
  const GraphEl = new_program ? Bar : Line;
  const graph_markup = (
    _key === 'exp' ? 
    <GraphEl
      {...{
        margin : {top:5,bottom:5,left:55,right:5},
        height : 200,
        add_xaxis : false,
        hide_gridlines : true,
        ticks,
        colors : graph_color,
        formater : formats.compact_raw,
        series : {"0": calcs.exp.graph_data},
      }} 
    /> :
    <GraphEl
      {...{
        margin : {top:5,bottom:5,left:55,right:5},
        height : 200,
        add_xaxis : false,
        axis_class : "black",
        hide_gridlines : true,
        ticks,
        colors : graph_color,
        formater : formats.big_int_real_raw,
        series : {"1": calcs.fte.graph_data},
      }}
    />
  );

  return <div className={props.half_layout ? "" : "mat-grid__row"}>
    <Pane row_key={_key} _key={props.calcs.new_program ? "will_be_1" : "was"} parent_props={props}/>
    <Pane row_key={_key} _key="changed_to" parent_props={props}/>
    <Pane row_key={_key} _key= "will_be"  parent_props={props}/>
    <div className={`mat-grid__lg-panel${half_layout? 100 : 40} mat-grid__sm-panel`}>
      <div 
        className={`welcome-mat-rect graph font-xsmall ${_key}`}
        style={{position:"relative"}}
      >
        { graph_markup }
      </div>
    </div>
  </div>
}

// react function to make the header row
const WelcomeMatHeaderRow = props => {
  if (props.half_layout) {
    return null;
  }
  

  return <div className="mat-grid__row mat-grid__row--sm-hide" aria-hidden={true}>
    {props.headers.map(header=>{
      return (
        <div 
          className={"mat-grid__lg-panel"+header.span} 
          key={header.header}
        >
          <div 
            className='mat-grid__title welcome-mat-rect'
            dangerouslySetInnerHTML={{__html : text_maker(header.header)}}
          />
        </div>
      );
    })}
  </div>;
};
// react function to make the individual footer elements
const WelcomeMatFooter = props => {

  const footer = props.calcs.footers[props._key];
  const calcs = props.calcs[props._key].footer_vals;

  let width;
  if (props._key === 'fte' && !props.calcs.planning_or_fte_data) {
    return null;
  } else if ( props.half_layout || (props._key === 'exp' && !props.calcs.planning_or_fte_data)){
    width = 100;
  } else {
    width = 50;
  }
  return <div className={'mat-grid__sm-panel mat-grid__lg-panel'+width}>
    <div className='mat-grid__inner-grid welcome-mat-rect'>
      <div className='mat-grid__inner-panel mat-grid__inner-panel--small' >
        <TextMaker text_key={footer} args={calcs}/>
      </div>
    </div>
  </div>;
};

const WelcomeMatCRFooter = props => {
  const footer = props.calcs.footers.CR;

  const exp_calcs = props.calcs.exp.footer_vals;
  const fte_calcs = props.calcs.fte.footer_vals;

  const no_change = (exp_calcs.exp_plan_change === 0 && fte_calcs.fte_plan_change === 0)

  let width;

  if (props._key === 'fte' && !props.calcs.planning_or_fte_data) {
    return null;
  } else {
    width = 80;
  }

  
  return  <div className={'mat-grid__sm-panel mat-grid__lg-panel'+width}>
    <div className='mat-grid__inner-grid welcome-mat-rect'>
      <div  className='mat-grid__inner-panel mat-grid__inner-panel--small' >
        <TextMaker text_key={footer} args={{exp_calcs, fte_calcs, no_change}}/>
      </div>
    </div>
  </div>
};

const WelcomeMat = props => {
  const { 
    calcs,
    subject, 
    half_layout,
  } = props;

  const is_cr = subject.level === "crso" && subject.is_cr;
  const { new_program } = calcs;


  return <div className='mat-grid'>
    <WelcomeMatHeaderRow {...props} headers={calcs.headers}/>
    <GridRow {...props} _key="exp" />
    <GridRow {...props} _key="fte" />

    { !( is_cr || new_program ) &&
      <div className={classNames(!half_layout && "mat-grid__row")}>
        <WelcomeMatFooter _key="exp" {...props} />
        <WelcomeMatFooter _key="fte" {...props} />
      </div>
    }
    { is_cr &&
      <div className={classNames(!half_layout && "mat-grid__row")}>
        <WelcomeMatCRFooter {...props}/>
      </div>
    }
  </div>;
};


const create_headers = (subject,calcs) => {

  const headers = []

  if (calcs.new_program === true){
    headers.push(
      {header : 'in_this_year',key : "will_be_1", span:20},
      {header : 'in_three_years',key : "will_be", span:20},
      {header : '3_year_trend'  ,key : "graph", span:40}
    );
  }
  else{
    headers.push({header : 'five_years_ago',key : "was", span:20}); 
    headers.push({header:'last_year',key:"changed_to",span:20})

    if (calcs.planning_or_fte_data) {
      headers.push({header : 'in_three_years',key : "will_be", span:20});
      headers.push({header : '8_year_trend'  ,key : "graph", span:40}); 
    } else {
      if (subject.is("dept")){
        headers.push({ header : 'in_this_year',key : "will_be", span:20});       
      }
      headers.push({header : '5_year_trend'  ,key : "graph", span:40});
    }
  } 
  return headers;
};


const cols = subject => {
  const  has_planning_data = subject.has_planned_spending;
  return {
    exp : _.map(std_years,y=>y+"exp").concat(has_planning_data? planning_years : []),
    fte : std_years.concat(has_planning_data ? planning_years : []),
  };
};

const create_ticks = (subject,graph_args) => {
  if (graph_args.new_program){
    return planning_years.map(run_template);
  }
  if (subject.has_planned_spending){
    return  std_years.concat(planning_years).map(run_template);
  }
  return std_years.map(run_template);
};

const calculate = function( calcs, subject,info,options ) {

  calcs.headers = create_headers(subject,calcs);
  calcs.exp.hist_change = calcs.exp.changed_to - calcs.exp.was;

  calcs.exp.plan_change = calcs.new_program ?
      calcs.exp.will_be -  calcs.exp.will_be_1 :
      calcs.exp.will_be -  calcs.exp.changed_to;

  let exp_hist_change, exp_plan_change,fte_hist_change, fte_plan_change;

  if ( calcs.exp.changed_to === 0 &&  calcs.exp.was === 0) {
    exp_hist_change = 0;
  } else if ( calcs.exp.was === 0){
    exp_hist_change = 1;
  } else {
    exp_hist_change =  (calcs.exp.changed_to -  calcs.exp.was)/ calcs.exp.was
  }

  if ( calcs.exp.will_be === 0 &&  calcs.exp.changed_to === 0) {
    exp_plan_change  = 0
  } else if ( calcs.exp.changed_to === 0){
    // exp_plan_change = 1
    exp_plan_change = calcs.new_program ?
    ((calcs.exp.will_be - calcs.exp.will_be_1) / calcs.exp.will_be_1) :
    1;

  } else {
    exp_plan_change  = ( calcs.exp.will_be - calcs.exp.changed_to)/ calcs.exp.changed_to;
  }

  calcs.exp.footer_vals = { exp_hist_change, exp_plan_change, subject };

  if (calcs.planning_or_fte_data) {
    calcs.fte.hist_change = calcs.fte.changed_to - calcs.fte.was;

    calcs.fte.plan_change = calcs.new_program ?
      calcs.fte.will_be -  calcs.fte.will_be_1 :
      calcs.fte.will_be -  calcs.fte.changed_to;

    if ( calcs.fte.changed_to === 0 &&  calcs.fte.was === 0) {
      fte_hist_change = 0;
    } else if ( calcs.fte.was === 0){
      fte_hist_change = 1;
    } else {
      fte_hist_change =  (calcs.fte.changed_to -  calcs.fte.was)/ calcs.fte.was
    }
    if ( calcs.fte.will_be === 0 &&  calcs.fte.changed_to === 0) {
      fte_plan_change  = 0
    } else if ( calcs.fte.changed_to === 0){
      // fte_plan_change = 1

      fte_plan_change = calcs.new_program ?
      ((calcs.fte.will_be - calcs.fte.will_be_1) / calcs.fte.will_be_1) :
      1;

    } else {
      fte_plan_change  = ( calcs.fte.will_be - calcs.fte.changed_to)/ calcs.fte.changed_to;
    }
 
    calcs.fte.footer_vals = { fte_hist_change , fte_plan_change , subject };
  }

  return calcs;

};

const render = function( panel, calculations, options ) {
  const {graph_args , subject } = calculations;
  panel.areas().text.remove();
  const text_area = panel.areas().graph;

  reactAdapter.render(
    <WelcomeMat 
      calcs={graph_args} 
      subject={subject} 
      half_layout={options.layout === "half"}
    />, 
    text_area.node()
  );

};


new PanelGraph({
  level: "gov",
  key: 'welcome_mat',
  depends_on : ['table4','table6','table12'],
  info_deps: [ 'table4_gov_info', 'table6_gov_info','table12_gov_info'],
  layout: {
    full: {text: 12, graph:0},
    half : {text: 12, graph:0},
  },
  title : "welcome_mat_title",
  calculate(subject,info,options) {
    const c = cols(subject); 
    const {
      table6,
      table12,
    } = this.tables;
    return  calculate({
      planning_or_fte_data : true,
      exp : {
        was : info.gov_exp_pa_last_year_5,    
        changed_to : info.gov_exp_pa_last_year,      
        will_be : info.gov_exp_planning_year_3,
        graph_data :  table6.q().sum(c.exp , {as_object: false}),
      },
      fte : {
        was : info.gov_fte_pa_last_year_5,    
        changed_to : info.gov_fte_pa_last_year,      
        will_be : info.gov_fte_planning_year_3,
        graph_data :  table12.q().sum(c.fte, {as_object: false}),
      },
      footers : {
        exp : "gov_welcome_mat_spending_summary",
        fte : "welcome_mat_fte_summary",
      },
    },subject,info,options);
  },
  render,
});

new PanelGraph({
  level: "dept",
  key: 'welcome_mat',
  footnotes : ["MACHINERY", "PLANNED_EXP", "FTE", "PLANNED_FTE", "EXP"],

  depends_on : [ 'table6','table12'],
  info_deps: ['table4_dept_info', 'table6_dept_info','table12_dept_info',  'table8_dept_info'],
  missing_info :'ok' ,
  layout: {
    full: {text: 12, graph:0},
    half : {text: 12, graph:0},
  },
  title : "welcome_mat_title",
  calculate(subject,info,options) {
    const c = cols(subject); 
    const pd =  subject.has_planned_spending;
    const {
      table6,
      table12,
    } = this.tables;

    return  calculate({
      planning_or_fte_data : pd,
      exp : {
        was : info.dept_exp_pa_last_year_5,    
        changed_to : info.dept_exp_pa_last_year,      
        will_be :  pd ? info.dept_exp_planning_year_3 : info.dept_tabled_est_in_year_estimates,
        graph_data :  table6.q(subject).sum(c.exp , {as_object: false}),
      },
      fte : {
        was : pd ? info.dept_fte_pa_last_year_5 : undefined,
        changed_to : pd ? info.dept_fte_pa_last_year : undefined,
        will_be :  pd ? info.dept_fte_planning_year_3 : undefined,
        graph_data : table12.q(subject).sum(c.fte, {as_object: false}),
      },
      footers : {
        exp : pd ? "dept1_welcome_mat_spending_summary" : "dept2_welcome_mat_spending_summary", 
        fte :  "welcome_mat_fte_summary",
      },
    },subject,info,options);
  },

  render,
});

      
new PanelGraph({
  level: "program",
  key: 'welcome_mat',
  footnotes : ["MACHINERY", "PLANNED_EXP", "FTE", "PLANNED_FTE", "EXP"],
  depends_on : [ 'table6','table12'],
  info_deps: [ 'table6_program_info','table12_program_info'],
  missing_info :'ok' ,
  layout: {
    full: {text: 12, graph:0},
    half : {text: 12, graph:0},
  },
  title : "welcome_mat_title",
  calculate (subject,info,options) {
    const {
      table6,
      table12,
    } = this.tables;
    const c = cols(subject); 

    if (table6.programs.get(subject) === undefined ){

      return false;
    }
    const pd =  subject.has_planned_spending && table12.programs.get(subject) !== undefined ;

    let exp_graph_data =  _.map(c.exp,col => _.first(table6.programs.get(subject))[col]); 
    let fte_graph_data =  pd ? _.map(c.fte,col => _.first(table12.programs.get(subject))[col]) : undefined;
    const new_program = (
      d3.sum(std_years, (d,i)=> exp_graph_data[i]) === 0 && 
      (fte_graph_data ? d3.sum(std_years, (d,i)=> fte_graph_data[i]) === 0: true)
    );

    if (new_program){
      exp_graph_data = _.takeRight(exp_graph_data,3);
      fte_graph_data = _.takeRight(fte_graph_data,3);
    }

    return calculate({
      planning_or_fte_data : pd,
      new_program,
      exp : {
        was : new_program ? undefined : info.program_exp_pa_last_year_5,
        changed_to : new_program ? undefined : info.program_exp_pa_last_year,      
        will_be_1 :  (new_program && pd) ? info.program_exp_planning_year_1 : undefined,
        will_be :  pd ? info.program_exp_planning_year_3 : undefined,
        graph_data :  exp_graph_data,
      },
      fte : {
        was : pd ? info.program_fte_pa_last_year_5 : undefined,
        changed_to : (
          new_program ? 
          undefined : (
            pd ? 
            info.program_fte_pa_last_year : 
            undefined
          )
        ),
        will_be_1 :  (new_program  && pd) ? info.program_fte_planning_year_1 : undefined,
        will_be :  pd ? info.program_fte_planning_year_3 : undefined,
        graph_data :  fte_graph_data,
      },
      footers : {
        exp : pd ?  "program_welcome_mat_spending_summary" : "dept2_welcome_mat_spending_summary",
        fte: pd ?  "welcome_mat_fte_summary" : undefined, 
      },
    },  subject,info,options);
  },
  render,
});

new PanelGraph({
  level: "tag",
  key: 'welcome_mat',
  footnotes : ["MACHINERY"],
  depends_on : [ 'table6','table12'],
  info_deps: [ 'table6_tag_info','table12_tag_info'],
  missing_info :'ok' ,
  layout: {
    full: {text: 12, graph:0},
    half : {text: 12, graph:0},
  },
  title : "welcome_mat_title",
  calculate(subject,info,options) {
    const c = cols(subject); 
    const pd =  subject.has_planned_spending;
    const {
      table6,
      table12,
    } = this.tables;
    return   calculate({
      planning_or_fte_data : pd,
      exp : {
        was : info.tag_exp_pa_last_year_5,    
        changed_to : info.tag_exp_pa_last_year,      
        will_be :  pd ? info.tag_exp_planning_year_3 : undefined,
        graph_data :  table6.q(subject).sum(c.exp , {as_object: false}),
      },
      fte : {
        was : pd ? info.tag_fte_pa_last_year_5 : undefined,
        changed_to : pd ? info.tag_fte_pa_last_year : undefined,
        will_be :  pd ? info.tag_fte_planning_year_3 : undefined,
        graph_data :  table12.q(subject).sum(c.fte, {as_object: false}),
      },
      footers : {
        exp : "tag_welcome_mat_spending_summary", 
        fte : pd ?  "tag_welcome_mat_fte_summary" :  "dept2_welcome_mat_spending_summary",
      },
    },  subject,info,options);
  },
  render,
});

new PanelGraph({
  level: "crso",
  key: 'welcome_mat',
  footnotes : ["MACHINERY"],
  depends_on : [ 'table6','table12'],
  info_deps: [ 'table6_crso_info','table12_crso_info'],
  missing_info :'ok' ,
  layout: {
    full: {text: 12, graph:0},
    half : {text: 12, graph:0},
  },
  title : "welcome_mat_title",
  calculate (subject,info,options) {
    const c = cols(subject); 

    // This statement will not show the graph is there is no data
    if (this.tables.table6.q(subject) === undefined ){
      return false;
    }

    const crso_exp_data = this.tables.table6.q(subject).data;
    const crso_fte_data = this.tables.table12.q(subject).data;

    const sum_fte_Data = _.map(c.fte, function(row) {
      return d3.sum(_.map(crso_fte_data, xx => xx[row]))
    })
    
    //Changed variable definition in the declaration phase in subject.js 
    const pd =  subject.has_planned_spending && d3.sum(sum_fte_Data) !== 0 ;
    const psd = subject.has_planned_spending

    // let exp_graph_data =  _.map(c.exp, col => this.tables.table6.q(subject)[col]); 
    let exp_graph_data = _.map(c.exp, function(row) {
      return d3.sum(_.map(crso_exp_data, xx => xx[row]))
    });

    // let fte_graph_data =  pd ? _.map(c.fte,col => this.tables.table12.q(subject)[col]) : undefined;
    let fte_graph_data = pd ? _.map(c.fte, function(row) {
      return d3.sum(_.map(crso_fte_data, xx => xx[row]))
    })
      : undefined ;

    const new_program = (
      d3.sum(std_years, (d,i)=> exp_graph_data[i]) === 0 && 
      (fte_graph_data ? d3.sum(std_years, (d,i)=> fte_graph_data[i]) === 0: true)
    );

    if (new_program){
      exp_graph_data = _.takeRight(exp_graph_data,3);
      fte_graph_data = _.takeRight(fte_graph_data,3);
    }
  
    return calculate({
      planning_or_fte_data : pd,
      new_program,
      exp : {
        was : info.crso_exp_pa_last_year_5,    
        changed_to : info.crso_exp_pa_last_year,      
        will_be_1 :  psd ? info.crso_exp_planning_year_1 : undefined,
        will_be :  psd ? info.crso_exp_planning_year_3 : undefined,
        graph_data :  exp_graph_data,
      },
      fte : {
        was : pd ? info.crso_fte_pa_last_year_5 : undefined,
        changed_to : pd ? info.crso_fte_pa_last_year : undefined,
        will_be_1 :  pd ? info.crso_fte_planning_year_1 : undefined,
        will_be :  pd ? info.crso_fte_planning_year_3 : undefined,
        graph_data :  fte_graph_data,
      },
      footers : {
        exp : pd ?  "program_welcome_mat_spending_summary" : "dept2_welcome_mat_spending_summary",
        fte : pd ?  "welcome_mat_fte_summary": "dept2_welcome_mat_spending_summary",
        CR : "CR_exp_ftes_fte_summary",
      },
    },  subject,info,options);
  },
  render,
});

