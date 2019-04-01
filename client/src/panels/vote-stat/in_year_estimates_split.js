import { text_maker, TM } from './vote-stat-text-prodiver.js';
import {
  PanelGraph,
  util_components,
  run_template,
  declarative_charts,
  StdPanel,
  Col,
  NivoResponsiveBar,
  dollar_formats,
} from "../shared";


const { Format } = util_components;

const { 
  A11YTable,
} = declarative_charts;

const estimates_split_calculate = function(subject, info, options){
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
    const keys = in_year_bar_args.ticks
    const estimate_data = in_year_bar_args.series[""].map(
      (data, index) => ({
        "label": keys[index],
        [keys[index]]: data,
      })
    );

    content = (
      <div style={{ height: "450px" }} >
        <NivoResponsiveBar
          data = {estimate_data}
          keys = {_.union(keys, [''])}
          label_format = { d => <tspan y={ -4 }> {dollar_formats.compact2_raw(d)} </tspan>}
          isInteractive = {false}
          enableLabel = {true}
          indexBy = "label"
          colors = "#335075"
          margin = {{            
            top: 50,
            right: 40,
            bottom: 120,
            left: 40, 
          }}
          bttm_axis= {{
            format: d => (_.words(d).length > 3) ? d.substring(0,20)+'...' : d,
            tickSize: 3,
            tickRotation: -45,
            tickPadding: 10,
          }}
          enableGridX = {false}
          remove_left_axis = {true}
          theme={{
            axis: {
              ticks: {
                text: { 
                  fontSize: 12,
                  fill: '#000',
                  fontWeight: '550',
                },
              },
            },
          }}
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

new PanelGraph({
  level: "gov",
  machinery_footnotes: false,
  depends_on: ["orgVoteStatEstimates"],
  info_deps: ["orgVoteStatEstimates_gov_info"],
  key: "in_year_estimates_split",
  calculate: estimates_split_calculate,
  render: estimates_split_render_w_text_key("gov_in_year_estimates_split_text"),
});