import './NivoCharts.scss';
import { ResponsiveBar } from '@nivo/bar';
import {
  graph_text_maker,
  InteractiveGraph,
  general_default_props,
  get_formatter,
  fix_legends_IE,
} from './nivo_shared.js';
import {
  DisplayTable,
} from '../../components/index.js';


const bar_table = (data, keys, indexBy, table_view_format, table_name, table_first_column_name) => {
  const table_data = _.map(data, row => ({
    display_values: _.mapValues(
      row,
      (values, key) => key === indexBy ? values : table_view_format(values)
    ),
    sort_values: {
      [indexBy]: row[indexBy],
      ...(_.omit(row, 'indexBy')),
    },
    search_values: {
      [indexBy]: row[indexBy],
    },
  }) );

  const ordered_column_keys = _.concat([indexBy],keys);
  const column_names = _.chain(ordered_column_keys)
    .zip( _.concat([table_first_column_name || graph_text_maker("label")], keys) )
    .fromPairs()
    .value();

  return <DisplayTable rows={table_data} ordered_column_keys={ordered_column_keys} column_names={column_names} name={table_name || graph_text_maker("default_table_name")}/>;
};


export class NivoResponsiveBar extends React.Component{
  render(){
    const{
      data,
      keys,
      groupMode,
      indexBy,
      margin,
      legends,
      graph_height,
      bttm_axis,
      left_axis,
      remove_bottom_axis,
      remove_left_axis,
      enableLabel,
      label,
      label_format,
      is_money,
      text_formatter,
      theme,
      colors,
      colorBy,
      tooltip,
      enableGridX,
      enableGridY,
      onMouseEnter,
      onMouseLeave,
      onClick,
      padding,
      borderWidth,
      disable_table_view,
      custom_table,
      table_name,
      table_first_column_name,
      isInteractive,
      animate,
      motionDamping,
      motionStiffness,
    } = this.props;

    const IE_fixed_legends = fix_legends_IE(legends);
  
    const table = !disable_table_view && (
      custom_table || bar_table(data, keys, indexBy, get_formatter(is_money, text_formatter, true, true), table_name, table_first_column_name)
    );

    // have to have an empty string in key to make sure that negative bars will be displayed
    const graph = 
      <div style={{height: graph_height }} aria-hidden='true'>
        <ResponsiveBar
          {...{data,
            margin,
            colors,
            groupMode,
            enableGridX,
            enableGridY,
            colorBy,
            theme, 
            indexBy, 
            onMouseEnter,
            onMouseLeave,
            onClick,
            padding,
            tooltip,
            enableLabel,
            label,
            borderWidth,
            isInteractive,
            animate,
            motionDamping,
            motionStiffness,
          }}
          legends={ IE_fixed_legends }
          keys={_.union([''],keys)}
          labelFormat={_.isUndefined(label_format) ? null : label_format}
          labelTextColor={window.infobase_color_constants.textColor}
          tooltip={ (d) => tooltip( [d], get_formatter(is_money, text_formatter, false) ) }
          axisBottom={remove_bottom_axis ? null : bttm_axis}
          axisLeft={
            remove_left_axis ?
              null :
              {
                tickValues: 6,
                format: (d) => get_formatter(is_money, text_formatter)(d),
                min: "auto",
                max: "auto",
                ...(left_axis || {}),
              }
          }
        />
      </div>;
    
    return <InteractiveGraph graph={graph} table={table} table_name={table_name}/>;
  }
};
NivoResponsiveBar.defaultProps = {
  ...general_default_props,
  padding: 0.3,
  bttm_axis: {
    tickSize: 7,
    tickPadding: 10,
    tickRotation: 0,
  },
};
  
  
  
export class NivoResponsiveHBar extends React.Component{
  render(){
    const{
      data,
      keys,
      groupMode,
      indexBy,
      margin,
      legends,
      graph_height,
      bttm_axis,
      left_axis,
      top_axis,
      remove_bottom_axis,
      remove_left_axis,
      add_top_axis,
      enableLabel,
      label,
      label_format,
      labelSkipWidth,
      is_money,
      text_formatter,
      theme,
      colors,
      colorBy,
      tooltip,
      enableGridX,
      enableGridY,
      padding,
      markers,
      disable_table_view,
      table_name,
      table_first_column_name,
      isInteractive,
      motionDamping,
      motionStiffness,
    } = this.props;
    
    const IE_fixed_legends = fix_legends_IE(legends);

    const table = !disable_table_view && bar_table(data, keys, indexBy, get_formatter(is_money, text_formatter, true, true), table_name, table_first_column_name);

    //have to have an empty string in key to make sure
    //that negative bars will be displayed
    const graph = 
    <div className="centerer" style={{height: graph_height}} aria-hidden='true'>
      <ResponsiveBar
        {...{data,
          margin,
          colors,
          groupMode,
          enableGridX,
          enableGridY,
          colorBy,
          theme, 
          indexBy, 
          enableLabel, 
          label,
          labelSkipWidth,
          padding,
          markers,
          isInteractive,
          motionDamping,
          motionStiffness,
        }}
        legends = { IE_fixed_legends }
        layout = 'horizontal'
        keys = {_.union([''],keys)}
        labelTextColor={window.infobase_color_constants.textColor}
        labelFormat={_.isUndefined(label_format) ? null : label_format}
        tooltip={ (d) => tooltip( [d], get_formatter(is_money, text_formatter, false) ) }
        axisBottom={remove_bottom_axis ? null : bttm_axis}
        axisTop={add_top_axis ? top_axis : null}
        axisLeft={
          remove_left_axis ?
            null :
            {
              tickValues: 6,
              format: (d) => get_formatter(is_money, text_formatter)(d),
              min: "auto",
              max: "auto",
              ...(left_axis || {}),
            }
        }
      />
    </div>;


    return <InteractiveGraph graph={graph} table={table} table_name={table_name} />;
  }
};
NivoResponsiveHBar.defaultProps = {
  ...general_default_props,
  bttm_axis: {
    tickSize: 7,
    tickPadding: 10,
  },
  theme: {
    legends: {
      text: {
        fontSize: 14,
      },
    },
    labels: {
      text: {
        fontSize: 14,
      },
    },
  },
  padding: 0.3,
  labelSkipWidth: 10,
};