exports = module.exports
const {create_text_maker, trivial_text_maker, text_maker, run_template } = require( "../models/text");
const {formats} = require('../core/format.js');
const {PanelGraph, layout_types} = require("../core/PanelGraph.js");
const { 
  Panel,
  StdPanel,
  TextPanel,
  Col,
} = require('../components/panel-components.js');
const { reactAdapter } = require('../core/reactAdapter');
const { 
  HeightClipper,
  TabbedContent,
  TM,
} = require('../util_components.js');

const declarative_charts = require('../charts/declarative_charts.js');

const {
  SafePie,
  TabularPercentLegend,
  D3GraphWithLegend,
} = declarative_charts;

const {
  rpb_link,
  get_appropriate_rpb_subject,
} = require('../rpb/rpb_link');


const { Table } = require('../core/TableClass.js');

const util_components = require('../util_components');
exports.charts_index = require("../core/charts_index");
exports.declarative_charts = declarative_charts;
exports.Table = Table;
exports.rpb_link = rpb_link;
exports.get_appropriate_rpb_subject = get_appropriate_rpb_subject;
exports.Subject = require("../models/subject");
exports.formats = formats;
exports.text_maker = text_maker; 
exports.trivial_text_maker = trivial_text_maker; 
exports.create_text_maker = create_text_maker;
exports.run_template = run_template;
exports.PanelGraph = PanelGraph;

exports.StdPanel = StdPanel;
exports.TextPanel = TextPanel;
exports.Panel = Panel;
exports.Col = Col;

exports.layout_types = layout_types;
exports.years = require("../models/years.js").years;
exports.business_constants = require('../models/businessConstants.js'),
exports.utils = require('../core/utils.js'); 
exports.FootNote = require("../models/footnotes");
exports.reactAdapter = require('../core/reactAdapter').reactAdapter;
exports.TabbedContent = TabbedContent;
exports.util_components = require('../util_components');
exports.infograph_href_template = require('../infographic/routes.js').infograph_href_template;
exports.glossary_href = require('../link_utils.js').glossary_href;
exports.Results = require('../models/results.js');
exports.Statistics = require('../core/Statistics.js').Statistics;
exports.TM = TM;

const {
  Format,
} = util_components;

exports.PplSharePie = ({graph_args, label_col_header, sort_func}) => {
  sort_func = sort_func || ((a,b) => b.value-a.value);

  const data = graph_args
    .map( d => 
      ({
        value : d.five_year_percent, 
        label : d.label,
      })
    ).sort(function (a, b) {
      return sort_func(a,b);
    });

  const color_scale = infobase_colors();

  const legend_items = _.map(data, ({value, label }) => ({
    value,
    label,
    color: color_scale(label),
    id: label,
  }));

  return <div aria-hidden={true}
    className="ppl-share-pie-area"
  >
    <div className="ppl-share-pie-graph">
      <SafePie 
        label_attr={false}
        showLabels={false}
        color={color_scale}
        pct_formatter={formats.percentage1}
        data={data}
        inner_radius={true}
        inner_text={true}
        inner_text_fmt={formats.compact1_raw}
        inner_text_content={label_col_header}
      />
    </div>
    <div className="ppl-share-pie-legend">
      <div className="centerer">
        <div className="centerer-IE-fix">
          <span className="ppl-share-percent-header">
            {trivial_text_maker("five_year_percent_header")}
          </span>
          <TabularPercentLegend
            items={legend_items}
            get_right_content={item => 
              <span>
                <Format type="percentage1" content={item.value} />
              </span>
            }
          />
        </div>
      </div>
    </div>
  </div>;
};

exports.HeightClippedGraphWithLegend = ({create_graph_with_legend_options}) => {
  return (
    <HeightClipper clipHeight={185} allowReclip={true} buttonTextKey={"show_content"} gradientClasses={"gradient gradient-strong"}>
      <div className="height-clipped-graph-area" aria-hidden={true}>
        <D3GraphWithLegend options={create_graph_with_legend_options}/>
      </div>
    </HeightClipper>
  );
};

exports.collapse_by_so = function(programs,table,filter){
  // common calculation for organizing program/so row data by so
  // and summing up all the programs for the last year of spending 
  // then sorting by largest to smallest
  
  return _.chain(programs)
    .map(prog => table.programs.get(prog))
    .compact()
    .flatten()
    .compact()
    .groupBy("so")
    .toPairs()
    .map(key_value => ({
      label : key_value[0], 
      so_num : key_value[1][0].so_num,
      value : d3.sum(key_value[1],d=>d["{{pa_last_year}}"]),
    }))
    .filter(filter || (()=>true))
    .sortBy(d=>-d.value)
    .value();
};

exports.sum_a_tag_col = function sum_tag_col(tag, table, col){
  return _.chain(tag.programs)
    .map(p => table.programs.get(p))
    .flatten()
    .compact()
    .filter(col)
    .map(col)
    .reduce( ( (acc,amt) => acc + amt) , 0 )
    .value();
};



exports.common_react_donut = function render(panel, calculations, options){
  const { graph_args } = calculations;
  
  const node = panel.areas().graph.node();

  const color_scale = infobase_colors();

  const total = d3.sum(graph_args, _.property('value'));

  const has_neg = _.chain(graph_args)
    .map('value')
    .min()
    .value() < 0;

  const legend_items = !has_neg && _.chain(graph_args)
    .sortBy('value')
    .reverse()
    .map( ({value, label }) => ({
      value,
      label,
      color: color_scale(label),
      id: label,
    }))
    .value();

  reactAdapter.render(
    <div aria-hidden={true}>
      <SafePie 
        label_attr={false}
        showLabels={false}
        color={color_scale}
        pct_formatter={formats.percentage1}
        data={graph_args}
        inner_radius={true}
        inner_text={true}
        inner_text_fmt={formats.compact1_raw}
        height={this.height || null}
      />
      { !has_neg && 
        <div className="centerer" style={{marginTop: "-40px"}}>
          <div 
            style={{
              width: "100%", /* IE 11 */ 
              maxWidth: '400px', 
              flexGrow: 1,
            }}
          >
            <TabularPercentLegend
              items={legend_items}
              get_right_content={item => 
                <div style={{width: "120px", display: "flex"}}>
                  <div style={{width: "60px"}}>
                    <Format type="compact1" content={item.value} />  
                  </div>
                  <div style={{width: "60px"}}>
                    (<Format type="percentage1" content={(item.value)*Math.pow(total,-1)} />)
                  </div>
                </div>
              }
            />
          </div>
        </div>
      }
    </div>,
    node
  );

}

exports.CommonDonut = function({data}){

  const color_scale = infobase_colors();

  const total = d3.sum(data, _.property('value'));

  const has_neg = _.chain(data)
    .map('value')
    .min()
    .value() < 0;

  const legend_items = !has_neg && _.chain(data)
    .sortBy('value')
    .reverse()
    .map( ({value, label }) => ({
      value,
      label,
      color: color_scale(label),
      id: label,
    }))
    .value();

  return (
    <div aria-hidden={true}>
      <SafePie 
        label_attr={false}
        showLabels={false}
        color={color_scale}
        pct_formatter={formats.percentage1}
        data={data}
        inner_radius={true}
        inner_text={true}
        inner_text_fmt={formats.compact1_raw}
        height={this.height || null}
      />
      { !has_neg && 
        <div className="centerer" style={{marginTop: "-40px"}}>
          <div 
            style={{
              width: "100%", /* IE 11 */ 
              maxWidth: '400px', 
              flexGrow: 1,
            }}
          >
            <TabularPercentLegend
              items={legend_items}
              get_right_content={item => 
                <div style={{width: "120px", display: "flex"}}>
                  <div style={{width: "60px"}}>
                    <Format type="compact1" content={item.value} />  
                  </div>
                  <div style={{width: "60px"}}>
                    (<Format type="percentage1" content={(item.value)*Math.pow(total,-1)} />)
                  </div>
                </div>
              }
            />
          </div>
        </div>
      }
    </div>
  );

}

exports.PlannedActualTable = ({
  planned_ftes,
  actual_ftes,
  diff_ftes,

  planned_spend,
  actual_spend,
  diff_spend,
}) => (
  <table className="table">
    <thead><tr>
      <th></th>
      <th scope="col"> <TM k="planned" /></th>
      <th scope="col"> <TM k="actual" /></th>
      <th scope="col"> <TM k="difference_planned_actual" /></th>
    </tr></thead>
    <tbody>
      <tr>
        <th scope="row"> <TM k="spending"/> </th>
        <td> <Format type="compact1" content={planned_spend} /> </td>
        <td> <Format type="compact1" content={actual_spend} /> </td>
        <td> <Format type="compact1" content={diff_spend} /> </td>
      </tr>
      <tr>
        <th scope="row"> <TM k="ftes"/> </th>
        <td> <Format type="big_int_real" content={planned_ftes} /> </td>
        <td> <Format type="big_int_real" content={actual_ftes} /> </td>
        <td> <Format type="big_int_real" content={diff_ftes} /> </td>
      </tr>
    </tbody> 
  </table>      
);






exports.get_planned_spending_source_link = subject => {
  const appropriate_subject = get_appropriate_rpb_subject(subject);
  const table = Table.lookup('table6');
  return {
    html: table.name,
    href: rpb_link({
      subject: appropriate_subject.guid,
      table: table.id,
      mode: 'details',
      columns: ['{{planning_year_1}}'], 
    }),
  }
};

exports.get_planned_fte_source_link = subject => {
  const appropriate_subject = get_appropriate_rpb_subject(subject);
  const table = Table.lookup('table12');
  return {
    html: table.name,
    href: rpb_link({
      subject: appropriate_subject.guid,
      table: table.id,
      mode: 'details',
      columns: ['{{planning_year_1}}'], 
    }),
  }
};