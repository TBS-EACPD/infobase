import { text_maker, TM } from './vote-stat-text-prodiver.js';
import { ResponsiveBar } from '../../../src/nivo-bar.js';
import {
  formats,
  PanelGraph,
  util_components,
  run_template,
  declarative_charts,
  StdPanel,
  Col,
  dollar_formats,
} from "../shared";

const { Format } = util_components;

const { 
  A11YTable,
} = declarative_charts;

const estimates_split_calculate = function(subject, info,options){
  const in_year_estimates_split = info[subject.level+"_in_year_estimates_split"];
  const last_year_estimates_split = info[subject.level+"_last_year_estimates_split"];
  if (_.isEmpty(in_year_estimates_split)){
    return false;
  }
  return {
    in_year: {
      series: {'': _.map(in_year_estimates_split,1) },
      ticks: _.map(in_year_estimates_split,0),
    },
    last_year: {
      series: {'': _.map(last_year_estimates_split,1) },
      ticks: _.map(last_year_estimates_split,0),
    },
  };
};

//NOTE: Once supps A comes out, we'll need to switch all the est_last_year to est_in_year, here, in the titles and in the text.

const estimates_split_render_w_text_key = text_key => ({calculations, footnotes, sources}) => {
  const {
    info,
    graph_args: {
      in_year: in_year_bar_args,
    },
  } = calculations;
  let content;

  if(window.is_a11y_mode){
    const { series, ticks } = in_year_bar_args;
    const data = _.chain(ticks)
      .zip(series[""])
      .map( ([label, amt])=> ({
        label,
        data: <Format type="compact1" content={amt} />,
      }))
      .value();
    
    content = (
      <A11YTable
        {...{
          label_col_header: text_maker("estimates_doc"), 
          data_col_headers: [ run_template("{{est_in_year}}") ],
          data: data,
        }}
      />
    );
  
  } else {    
    let keenanSuckss = calculations.info.gov_in_year_estimates_split
    let keys = [];
    keenanSuckss = keenanSuckss.map((d,i) =>{
      const label = d[0];
      const value = d[1];
      keys.push(label);
      let result = {};
      result[label]=value;
      result["title"]=label;
      return result;
    });


    // const static_bar_args = {
    //   add_xaxis: true,
    //   x_axis_line: true,
    //   add_yaxis: false,
    //   add_labels: true,
    //   colors: infobase_colors(),
    //   margin: {top: 20, right: 20, left: 20, bottom: 80},
    //   formater: formats.compact1,
    // };
    content = (
      <div className="keenansucks" style={{
        height: "450px",
      }} >
        <ResponsiveBar
          data={keenanSuckss}
          keys={keys}
          indexBy="title"
          margin={{
            "top": 50,
            "right": 55,
            "bottom": 120,
            "left": 40,
          }}
          labelFormat={d => <tspan y={ -4 }> {formats.compact1(d, {raw: true})} </tspan>}
          padding={0.3}
          colors="paired"
          borderColor="inherit:darker(1.6)"
          axisBottom={{
            "format" : d => `${(_.words(d).length>3)? d.substring(0,20)+'...':d}`,
            "tickSize": 3,
            "tickRotation": -45,
            "tickPadding": 10
          }}

          axisLeft={null}
          labelTextColor="inherit:darker(1.6)"
          motionStiffness={90}
          motionDamping={50}    
          isInteractive={false}
        />
      </div>
    );
  }
  

  return (
    <StdPanel
      title={text_maker("in_year_estimates_split_title")}
      {...{sources, footnotes}}
    >
      <Col isText size={6}>
        <TM k={text_key} args={info} />
      </Col>
      <Col isGraph={window.is_a11y_mode} size={6}>
        {content}
      </Col>
    </StdPanel>
  )
};
window._

new PanelGraph({
  level: "dept",
  machinery_footnotes: false,
  depends_on: ["orgVoteStatEstimates"],

  info_deps: [
    'orgVoteStatEstimates_gov_info', 
    'orgVoteStatEstimates_dept_info', 
  ],
  key: "in_year_estimates_split",

  calculate: estimates_split_calculate,
  render: estimates_split_render_w_text_key("dept_in_year_estimates_split_text"),
});

//change this back after
new PanelGraph({
  level: "gov",
  machinery_footnotes: false,
  depends_on: ["orgVoteStatEstimates"],
  info_deps: ["orgVoteStatEstimates_gov_info"],
  key: "in_year_estimates_split",
  calculate: estimates_split_calculate,
  render: estimates_split_render_w_text_key("gov_in_year_estimates_split_text"),
});

