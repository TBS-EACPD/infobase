import { text_maker, TM } from './vote-stat-text-prodiver.js';
import {
  formats,
  PanelGraph,
  util_components,
  run_template,
  declarative_charts,
  StdPanel,
  Col,
} from "../shared";

const { Format } = util_components;

const { 
  A11YTable,
  Bar,
} = declarative_charts;

const estimates_split_calculate = function(subject, info,options){
  const in_year_estimates_split = info[subject.level+"_in_year_estimates_split"];
  const last_year_estimates_split = info[subject.level+"_last_year_estimates_split"];
  if (_.isEmpty(in_year_estimates_split)){
    return false;
  }
  return {
    in_year: {
      series : {'': _.map(in_year_estimates_split,1) },
      ticks : _.map(in_year_estimates_split,0),
    },
    last_year: {
      series : {'': _.map(last_year_estimates_split,1) },
      ticks : _.map(last_year_estimates_split,0),
    },
  };
};

//NOTE: Once supps A comes out, we'll need to switch all the est_last_year to est_in_year, here, in the titles and in the text.

const estimates_split_render_w_text_key = text_key => ({calculations, footnotes, sources}) => {
  const {
    info,
    graph_args : {
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
          label_col_header : text_maker("estimates_doc"), 
          data_col_headers: [ run_template("{{est_in_year}}") ],
          data : data,
        }}
      />
    );


  } else {

    const static_bar_args = {
      add_xaxis : true,
      x_axis_line : true,
      add_yaxis : false,
      add_labels : true,
      colors : infobase_colors(),
      margin : {top: 20, right:20, left: 60, bottom: 80},
      formater : formats.compact1,
    };

    content = (
      <Bar 
        {...static_bar_args}
        {...in_year_bar_args}
      />
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
  machinery_footnotes : false,
  depends_on : ["table8"],

  info_deps: [
    'table8_gov_info', 
    'table8_dept_info', 
  ],

  key : "in_year_estimates_split",
  calculate: estimates_split_calculate,
  render: estimates_split_render_w_text_key("dept_in_year_estimates_split_text"),
});

new PanelGraph({
  level: "gov",
  machinery_footnotes : false,
  depends_on : ["table8"],
  info_deps: ["table8_gov_info"],
  key : "in_year_estimates_split",
  calculate: estimates_split_calculate,
  render: estimates_split_render_w_text_key("gov_in_year_estimates_split_text"),
});

