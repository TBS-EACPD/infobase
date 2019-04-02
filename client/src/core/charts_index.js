// The charts_index graphs were created with an intent of using them even
// outside of this application, therefore, there are no linkages
// between the graphs and the InfoBase. Accordingly, this adapter
// file is needed to provide extra information from the application
// to the graphs in a neutral format 

import '../charts/charts.scss';

import * as FORMAT from './format.js';
import common_charts_utils from '../charts/common_charts_utils.js';
import { trivial_text_maker } from '../models/text.js';
import { Bar } from '../charts/bar.js';
import { HBar } from '../charts/hbar.js';
import { CirclePieChart as CirclePieChart } from '../charts/circle_chart.js';
import { Canada } from '../charts/canada.js';
import { Arrow } from '../charts/arrow.js';
import { heatmap } from '../charts/heatmap.js';
import { ConceptExplorer } from '../charts/concept-explorer.js';
import { HBarComposition } from '../charts/hbar_composition.js';
import { TwoSeriesBar } from '../charts/two_series_bar.js';

var formats = FORMAT.formats;

import { reactAdapter } from './reactAdapter.js';
import { TextMaker } from '../util_components.js';

const templates = trivial_text_maker;

const create_a11y_table = function({
  container, //
  data, 
  label_col_header, //optional
  data_col_headers, 
  table_name, //optional
}){
  //
  // Adds a11y tables to panels
  //
  // Arguments:
  //   container : where the a11y table will be appended. In most cases, this is this.panel.areas().graph, BUT if the
  //   graph area layout only has one section, then this.panel.areas().graph itself is an aria-hidden element so appending
  //   the a11y table there is pointless. In that case, probably want to pass this.panel.areas().text
  //   label_col_header : header for column of data labels
  //   data_col_headers : headers for columns of data (ie. ticks, for most graphs)
  //   data : table data, formatted as in the following example
  //     [
  //       {
  //         label : "Indeterminate",
  //         data : [5721, 5089, 4405, 4204, 4098]
  //       },
  //       {
  //         ...
  //       },
  //       ...
  //     ]
  if(_.isElement(container)){ //if container is not a d3 selection, wrap it in a d3 selection
    container = d3.select(container);
  }
  const a11y_area = container.append('div');
  if(!window.is_a11y_mode){
    a11y_area.attr('class','sr-only');
  }
  
  // Note: strips html from tick (ie. the </br> in most people year ticks)
  const table_content = <div style={{overflow: "auto"}}>
    <table
      className="table table-striped table-bordered"
    >
      <caption>
        <div> 
          { 
            !_.isEmpty(table_name) ? 
            table_name : 
            <TextMaker text_key="a11y_table_title_default" />
          }
        </div> 
      </caption>
      <thead>
        <tr>
          <th 
            scope={
              label_col_header ? 
              "col" :
              null
            }
          >
            {label_col_header || ""}
          </th>
          {_.map(data_col_headers, (tick,i) => <th key={i}> <span dangerouslySetInnerHTML={{__html: tick}} /> </th>)} 
        </tr>
      </thead>
      <tbody>
        {_.map(data, ({label, data}) => 
          <tr key={label}>
            <th 
              scope={
                !label_col_header ?
                "row" :
                null
              }
            >
              {label}
            </th>
            {
              _.isArray(data) ? 
              _.map(data, (d,i) => <td key={i}> {d} </td> ) :
              <td> {data} </td>
            }
          </tr>
        )}
      </tbody>
    </table>
  </div>;


  reactAdapter.render(table_content, a11y_area.node());
};

export {
  create_a11y_table,
  Bar,
  templates,
  formats,
  HBar, 
  CirclePieChart, 
  Canada, 
  Arrow, 
  heatmap, 
  ConceptExplorer, 
  HBarComposition, 
  TwoSeriesBar,
  common_charts_utils, 
};