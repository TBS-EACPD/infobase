import { text_maker, TM } from './vote_stat_text_provider.js';
import {
  util_components,
  run_template,
  declarative_charts,
  StdPanel,
  Col,
  NivoResponsiveBar,
  dollar_formats,

  declare_panel,
} from "../../shared.js";


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
      series: _.map(in_year_estimates_split,1),
      ticks: _.map(in_year_estimates_split,0),
    },
    last_year: {
      series: _.map(last_year_estimates_split,1),
      ticks: _.map(last_year_estimates_split,0),
    },
  };
};

const estimates_split_render_w_text_key = text_key => ({calculations, footnotes, sources}) => {
  const {
    info,
    panel_args: {
      in_year: in_year_bar_args,
    },
  } = calculations;
  let content;

  if(window.is_a11y_mode){
    const { series, ticks } = in_year_bar_args;
    const data = _.chain(ticks)
      .zip(series)
      .map( ([label, amt])=> ({
        label,
        data: <Format type="compact1_written" content={amt} />,
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
    const keys = in_year_bar_args.ticks;
    const estimate_data = _.map(
      in_year_bar_args.series,
      (data, index) => ({
        "label": keys[index],
        [keys[index]]: data,
      }) 
    );
 
    content = (
      <div style={{ height: "450px" }} aria-hidden = {true}>
        <NivoResponsiveBar
          data = {estimate_data}
          table_switch = {true}
          keys = {keys}
          label_format = { d => <tspan y={ -4 }> {dollar_formats.compact2_raw(d)} </tspan>}
          isInteractive = {false}
          enableLabel = {true}
          indexBy = "label"
          colorBy = {d => d.data[d.id] < 0 ? window.infobase_color_constants.highlightColor : window.infobase_color_constants.secondaryColor}
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
                  fill: window.infobase_color_constants.textColor,
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
  );
};


export const declare_in_year_estimates_split_panel = () => declare_panel({
  panel_key: "in_year_estimates_split",
  levels: ["gov", "dept"],
  panel_config_func: (level, panel_key) => {
    switch (level){
      case "gov":
        return {
          machinery_footnotes: false,
          depends_on: ["orgVoteStatEstimates"],
          info_deps: ["orgVoteStatEstimates_gov_info"],
          calculate: estimates_split_calculate,
          render: estimates_split_render_w_text_key("gov_in_year_estimates_split_text"),
        };
      case "dept":
        return {
          machinery_footnotes: false,
          depends_on: ["orgVoteStatEstimates"],
          info_deps: [
            'orgVoteStatEstimates_gov_info', 
            'orgVoteStatEstimates_dept_info', 
          ],
          calculate: estimates_split_calculate,
          render: estimates_split_render_w_text_key("dept_in_year_estimates_split_text"),
        };
    }
  },
});
