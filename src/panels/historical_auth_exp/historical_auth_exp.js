import text from  './historical_auth_exp.yaml';

import {
  formats,
  run_template,
  PanelGraph,
  years,
  util_components,
  declarative_charts,
  StdPanel,
  Col,
  CreateTmCmpnt,
} from "../shared";

const { 
  Bar, 
  GraphLegend,
  A11YTable,
} = declarative_charts;

const { std_years } = years;
const { Format } = util_components;

const [ text_maker, TM ] = CreateTmCmpnt(text);

const auth_cols = _.map(std_years, yr=>yr+"auth");
const exp_cols = _.map(std_years, yr=>yr+"exp");

const text_keys_by_level = {
  dept: "dept_historical_auth_exp_text",
  program: "program_historical_auth_exp_text",
  tag: "tag_historical_auth_exp_text",
  gov: "gov_historical_auth_exp_text",
};


const calculate = function( subject,info,options ) {
  const {
    table6,
    table4, 
  } = this.tables;

  let stacked = false;
  let auth,exp;

  if (subject.is("gov")){
    const q = table4.q();
    auth = q.sum(auth_cols,{as_object:false});
    exp = q.sum(exp_cols,{as_object:false});
  } else if (  subject.is("dept")) {
    const q = table4.q(subject);
    auth = q.sum(auth_cols,{as_object:false});
    exp = q.sum(exp_cols,{as_object:false});
  } else if (  subject.is("program") ) {
    const row = _.first(table6.programs.get(subject));
    auth = _.map(auth_cols, col => row[col] );
    exp =   _.map(exp_cols, col => row[col] );
    if (d3.sum(auth) === 0 && d3.sum(exp)===0 ) {
      return false;
    }
  } else if (  subject.level === 'tag') {
    if(subject.is('tag') && subject.root.id !== 'GOCO'){ 
      //turn off this graph for Many-to-many tags 
      return false; 
    }
    const q = table6.q(subject);
    auth = q.sum(auth_cols,{as_object:false});
    exp = q.sum(exp_cols,{as_object:false});
  }

  if  (_.every(auth, (x,i)=> auth[i]-exp[i] >= 0   ) &&
        _.every(auth.concat(exp), d=> d>=0)
  ){
    auth = _.map(auth, (x,i)=> auth[i] - exp[i]);
    stacked = true;
  }
  return {exp,auth,stacked};
};

const render = function({calculations, footnotes, sources}) {
  const { info, graph_args, subject } = calculations;
  const ticks = _.map(std_years, run_template);
  const {exp,auth,stacked} = graph_args;
  
  
  const series_labels = (
    stacked ? 
    [text_maker("expenditures"),text_maker("unused_authorities" )] : 
    [text_maker("authorities"),text_maker("expenditures")]
  );

  let graph_content;
  if(window.is_a11y_mode){
    const data = _.zip(
      ticks,
      (
        stacked ? 
        _.zip(exp, auth) :
        _.zip(auth,exp)
      )
    ).map( ([label,data ])=>({
      label,
      /* eslint-disable react/jsx-key */
      data: data.map( amt => <Format type="compact1" content={amt} /> ),
    }));

    graph_content = (
      <A11YTable
        data_col_headers={series_labels}
        data={data}
      />
    );

  } else {
    const colors = infobase_colors();
    const legend_items = [
      {
        id: "x",
        label: series_labels[0],
        color: colors(series_labels[0]),
      },
      {
        id: "y",
        label: series_labels[1],
        color: colors(series_labels[1]),
      },
    ];

    graph_content = <div>
      <div className="legend-container">
        <GraphLegend
          items={legend_items}
          isHorizontal
        />
      </div>
      <div>
        <Bar
          {...{
            colors,
            series_labels,
            ticks,
            stacked, 
            formater : formats.compact_raw,
            height : 400,
            series : {
              [series_labels[0]] :  stacked ? exp : auth,
              [series_labels[1]] :  stacked ? auth : exp,
            },
          }}
        />
      </div>
    </div>;

  }

  return (
    <StdPanel
      title={text_maker("historical_auth_exp_title")}
      {...{footnotes,sources}}
    >
      <Col size={6} isText>
        <TM k={text_keys_by_level[subject.level]} args={info} />
      </Col>
      <Col size={6} isGraph>
        {graph_content}
      </Col>
    </StdPanel>
  );
  
};

new PanelGraph({
  level: "gov",
  key : "historical_auth_exp",
  info_deps : ["table4_gov_info"],
  depends_on: ["table4"],
  calculate,
  render,
});

new PanelGraph({
  level: "dept",
  key : "historical_auth_exp",
  depends_on: ["table4"],
  info_deps : ["table4_dept_info"],
  calculate,
  render,
});

new PanelGraph({
  level: "program",
  key : "historical_auth_exp",
  depends_on: ["table6"],
  info_deps : ["table6_program_info"],
  calculate,
  render,
});

new PanelGraph({
  level: "tag",
  key : "historical_auth_exp",
  depends_on: ["table6"],
  info_deps : ["table6_tag_info"],
  calculate,
  render,
});



