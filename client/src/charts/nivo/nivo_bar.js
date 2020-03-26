import './NivoCharts.scss';
import { ResponsiveBar } from '@nivo/bar';
import {
  graph_text_maker,
  InteractiveGraph,
  general_default_props,
  fixed_symbol_shape,
  get_formatter,
} from './nivo_shared.js';
import {
  DisplayTable,
} from '../../components/index.js';


const bar_table = (data, keys, indexBy, table_view_format, table_name, table_first_column_name) => {
  const table_data = _.map(data, row => ({
    display_values: _.chain(row)
      .toPairs()
      .map(r => r[0]===indexBy ? [indexBy, r[1]] : [r[0],table_view_format(r[1])] )
      .fromPairs()
      .value(),
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
    .zip( _.concat([table_first_column_name ? table_first_column_name : graph_text_maker("label")], keys) )
    .fromPairs()
    .value();

  return <DisplayTable rows={table_data} ordered_column_keys={ordered_column_keys} column_names={column_names} name={table_name || graph_text_maker("default_table_name")}/>;
};


export class NivoResponsiveBar extends React.Component{
  render(){
    const{
      data,
      custom_table,
      keys,
      margin,
      graph_height,
      label_format,
      colors,
      bttm_axis,
      left_axis,
      isInteractive,
      indexBy,
      remove_bottom_axis,
      remove_left_axis,
      enableLabel,
      label,
      is_money,
      legends,
      tick_value,
      text_formatter,
      theme,
      colorBy,
      min,
      max,
      motion_damping,
      motion_stiffness,
      tooltip,
      enableGridX,
      groupMode,
      enableGridY,
      onMouseEnter,
      onMouseLeave,
      onClick,
      padding,
      animate,
      labelTextColor,
      borderWidth,
      disable_table_view,
      table_name,
      table_first_column_name,
    } = this.props;

    const IE_fixed_legends = legends ? (
      _.map(legends,
        legend => _.chain(legend)
          .clone()
          .assign({symbolShape: fixed_symbol_shape})
          .value() )
      ) :
      undefined;
  
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
            enableLabel, 
            isInteractive,
            motion_damping,
            motion_stiffness,
            onMouseEnter,
            onMouseLeave,
            onClick,
            padding,
            tooltip,
            label,
            animate,
            labelTextColor,
            borderWidth,
          }}
          legends={ IE_fixed_legends }
          keys={_.union([''],keys)}
          labelFormat={_.isUndefined(label_format) ? null : label_format}
          tooltip={ (d) => tooltip( [d], get_formatter(is_money, text_formatter, false) ) }
          axisBottom={remove_bottom_axis ? null : bttm_axis}
          axisLeft={
            remove_left_axis ?
              null :
              {
                tickValues: tick_value || 6,
                format: (d) => get_formatter(is_money, text_formatter)(d),
                min: min,
                max: max,
                ...(left_axis || {}),
              }
          }
          borderColor="inherit:darker(1.6)"
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
  labelTextColor: "inherit:darker(2)",
  isInteractive: true,
  motion_damping: 15,
  motion_stiffness: 95,
  table_switch: false,
};
  
  
  
export class NivoResponsiveHBar extends React.Component{
  render(){
    const{
      data,
      keys,
      margin,
      graph_height,
      label_format,
      colors,
      bttm_axis,
      left_axis,
      top_axis,
      isInteractive,
      indexBy,
      remove_bottom_axis,
      remove_left_axis,
      add_top_axis,
      enableLabel,
      is_money,
      legends,
      tick_value,
      text_formatter,
      theme,
      colorBy,
      motion_damping,
      motion_stiffness,
      tooltip,
      enableGridX,
      groupMode,
      enableGridY,
      padding,
      label,
      labelSkipWidth,
      markers,
      disable_table_view,
      table_name,
      table_first_column_name,
    } = this.props;
    
    const IE_fixed_legends = legends ? (
      _.map(legends,
        legend => _.chain(legend)
          .clone()
          .assign({symbolShape: fixed_symbol_shape})
          .value() )
      ) :
      undefined;

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
          isInteractive,
          labelSkipWidth,
          markers,
        }}
        legends = { IE_fixed_legends }
        layout = 'horizontal'
        keys = {_.union([''],keys)}
        labelFormat={_.isUndefined(label_format) ? null : label_format}
        tooltip={ (d) => tooltip( [d], get_formatter(is_money, text_formatter, false) ) }
        axisBottom={remove_bottom_axis ? null : bttm_axis}
        axisTop={add_top_axis ? top_axis : null}
        axisLeft={
          remove_left_axis ?
            null :
            {
              tickValues: tick_value || 6,
              format: (d) => get_formatter(is_money, text_formatter)(d),
              min: "auto",
              max: "auto",
              ...(left_axis || {}),
            }
        }
        padding={padding}
        borderColor="inherit:darker(1.6)"
        motionDamping={motion_damping}
        motionStiffness={motion_stiffness}
        labelTextColor={window.infobase_color_constants.textColor}
        labelSkipWidth={labelSkipWidth}
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
  isInteractive: true,
  max: "auto",
  min: "auto",
  padding: 0.3,
  motion_damping: 15,
  motion_stiffness: 95,
  labelSkipWidth: 10,
};