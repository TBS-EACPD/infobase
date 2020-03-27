import './NivoCharts.scss';
import { ResponsivePie } from '@nivo/pie';
import classNames from 'classnames';
import {
  graph_text_maker,
  InteractiveGraph,
  general_default_props,
  infobase_colors_smart,
  get_formatter,
} from './nivo_shared.js';
import { formats } from "../../core/format.js";
import { newIBCategoryColors } from '../../core/color_schemes.js';
import {
  DisplayTable,
  Format,
} from '../../components/index.js';


const TabularPercentLegend = ({
  items, // [ { active, id, label, color }] 
  onClick, //id => { }
  get_right_content, //item => react element
}) => (
  <ul className="list-unstyled">
    {_.map(items, item => 
      <li
        key={item.id}
        className="tabular-legend-list-el"
      >
        <span 
          aria-hidden={true}
          className="legend-color-checkbox"
          style={{backgroundColor: item.color }}
        />
        <span>
          {item.label}
        </span>
        <span style={{marginLeft: 'auto', textAlign: 'right', whiteSpace: "nowrap"}}>
          { get_right_content(item) } 
        </span>
      </li>
    )}
  </ul>
);

export class NivoResponsivePie extends React.Component{
  render(){
    const {
      data,
      legend_data,
      graph_height,
      colors,
      colorBy,
      include_percent,
      tooltip,
      percent_value_tooltip,
      is_money,
      text_formatter,
      margin,
      display_horizontal,
      disable_table_view,
      table_name,
    } = this.props;

    const color_scale = infobase_colors_smart( d3.scaleOrdinal().range(colors || newIBCategoryColors) );
    const color_func = colorBy || (d=>color_scale(d.label));

    const legend_items = _.chain(legend_data)
      .sortBy('value')
      .reverse()
      .map( ({value, label }) => ({ 
        value,
        label,
        color: color_scale(label),
        id: label,
      }))
      .value();
    
    const data_with_absolute_values = _.map(
      data,
      (data) => ({
        ...data,
        value: Math.abs(data.value),
        original_value: data.value,
      })
    );
    
    const legend_total = _.reduce(
      legend_data,
      (sum, {value}) => sum + Math.abs(value),
      0 
    );

    const table_data = _.map(data, row => ({
      display_values: {
        label: row["label"],
        percentage: formats.percentage_raw(row.value/legend_total),
        value: get_formatter(is_money, text_formatter, true, true)(row.value),
      },
      sort_values: {
        label: row["label"],
        percentage: row.value/legend_total,
        value: row.value,
      },
      search_values: {
        label: row["label"],
      },
    }) );
    
    const column_names = {
      label: graph_text_maker("label"),
      value: graph_text_maker("value"),
      percentage: graph_text_maker("percentage"),
    };

    const ordered_column_keys = ["label", "value", "percentage"];

    const table = !disable_table_view && <DisplayTable rows={table_data} column_names={column_names} ordered_column_keys={ordered_column_keys} name={table_name || graph_text_maker("default_table_name")} />;

    const graph =
    <div className={display_horizontal ? classNames("common-donut__horizontal","common-donut") : "common-donut"} aria-hidden = {true}>
      <div className="common-donut__graph" style = {{height: graph_height}}>
        <ResponsivePie
          {...{
            data: data_with_absolute_values,
            margin,
            colors,
          }}
          colorBy={ color_func }
          tooltip={ (data) => {
            const data_with_original_values = {
              ...data,
              value: data.original_value,
            };

            if (include_percent){
              return percent_value_tooltip(
                [data_with_original_values],
                get_formatter(is_money, text_formatter, false), 
                _.sumBy(data_with_absolute_values, 'value')
              );
            } else {
              return tooltip(
                [data_with_original_values],
                get_formatter(is_money, text_formatter, false)
              );
            } 
          }}
          innerRadius={0.5}
          animate={false}
          borderWidth={0}
          enableSlicesLabels={false}
          enableRadialLabels={false}
        />
      </div>
      <div className="common-donut__legend">
        <div className="centerer">
          <div className="centerer-IE-fix">
            <TabularPercentLegend
              items={legend_items}
              get_right_content={
                (item) => (
                  <div>
                    <span className="common-donut__legend-data">
                      <Format type="compact1" content={item.value} />
                    </span>
                    <span className="common-donut__legend-data">
                      <Format type="percentage1" content={item.value/legend_total} />
                    </span>
                  </div>
                )
              }
            />
          </div>
        </div>
      </div>
    </div>;
    

    return <InteractiveGraph graph={graph} table={table} table_name={table_name} />;
  }
}
NivoResponsivePie.defaultProps = {
  ...general_default_props,
  margin: {
    top: 30,
    right: 80,
    bottom: 60,
    left: 50,
  },
  include_percent: true,
};