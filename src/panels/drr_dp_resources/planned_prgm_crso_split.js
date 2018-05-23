import './crso_resource_text.ib.yaml';
import {Program} from '../../models/subject.js';

import {
  reactAdapter,
  formats,
  PanelGraph,
  util_components,
  declarative_charts,
} from "../shared";

const {
  Bar,
  SafePie,
  TabularPercentLegend,
} = declarative_charts;

const { Format } = util_components;

const prg_crso_split_render = function(panel, calculations, options){
  const { subject, info } = calculations;

  const node = panel.areas().graph.node();
  
  const {table6} = this.tables;
  const table6_data = table6.q(subject).data;

  // data must be in the form:
  // data = [
  //      { active : true/false,
  //        value : [values],
  //        label : "series label"
  //      }
  //    ]

  const color_scale = infobase_colors();

  const col = "{{planning_year_1}}";
  const unfiltered_data = _.chain(table6_data)
    .map(d => ({ 
      value: d[col],
      label: d.prgm,
      data: d[col],
      formater : formats.compact1,
      li_href: Program.lookup(Program.unique_id(d.dept, d.activity_code)).link_to_infographic,
    }))
    .sortBy('value')
    .reverse()
    .value()

  const data_sum = d3.sum(_.map(unfiltered_data, "value"));

  const data = _.filter(
    unfiltered_data, 
    record => Math.abs(record.value/data_sum) > 0.001 
  );

  const has_neg = _.chain(data)
    .map('value')
    .min()
    .value() < 0;

  const legend_display = (!has_neg && 
      <TabularPercentLegend
        items={
          _.map(data, obj => ({...obj,
            color: color_scale(obj.label),
            id: obj.label,
          }))
        }
        get_right_content={item =>  
          <div style={{width: "120px", display: "flex"}}>
            <div style={{width: "60px"}}>
              <Format type="compact1" content={item.value} />  
            </div>
            <div style={{width: "60px"}}>
              (<Format type="percentage1" content={(item.value)*Math.pow(data_sum,-1)} />)
            </div>
          </div>
        }
      />
  );


  if (data.length > 3) {


    reactAdapter.render(
      <div>
        <SafePie 
          label_attr={false}
          color={color_scale}
          pct_formatter={formats.percentage1}
          data={data}
          inner_radius={true}
          inner_text={true}
          inner_text_fmt={formats.compact1_raw}
          showLabels={false}
          radius={150}
        />
        {legend_display}
      </div>,
      node
    );
  } else {
    
    const new_data = _.zipObject(_.map(data, "label"), _.zip(_.map(data, "value")))
    const series_labels = _.map(data, "label");
    

    reactAdapter.render(
      <div>
        <Bar 
          series={new_data}
          series_labels={series_labels}
          ticks={[info.planning_years[0]]}
          colors={color_scale}
          formater={formats.compact_raw}
        />
        { legend_display }
      </div>,
      node
    );

  }

};

new PanelGraph({
  level: "crso",
  key: 'planned_prg_crso_split',
  depends_on :  ['table6'],
  info_deps: ['table6_crso_info'],
  layout: {
    full:  {text : 7, graph: 5},       
    half : {text : 12, graph: 12},      
  },
  machinery_footnotes : false,
  title :"planned_prg_crso_split_title",
  text : "planned_prg_crso_split_text",
  calculate(subject,info){

    if(window.is_a11y_mode){
      return false;
      //this panel is covered entirely by crso_program_resources
    }

    // check for negative voted or statutory values
    const {table6} = this.tables;
    const table6_data = table6.q(subject).data;

    if(d3.sum(_.map(table6_data, yr => yr["{{planning_year_1}}"])) === 0){
      return false
    } 

    return { table6_data };

  },
  render: prg_crso_split_render,
});


