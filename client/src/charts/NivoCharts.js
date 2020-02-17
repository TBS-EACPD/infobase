import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { formats, dollar_formats } from "../core/format.js";
import { Fragment } from 'react';
import { IconZoomIn, IconZoomOut } from '../icons/icons.js';
import { trivial_text_maker } from '../models/text.js';
import { breakpoints } from '../core/breakpoint_defs.js';
import MediaQuery from 'react-responsive';
import { DisplayTable } from '../components/DisplayTable.js';
import './NivoCharts.scss';


const get_formatter = (is_money, formatter, raw = true) => (
  _.isUndefined(formatter) ?
    ( 
      !is_money ? 
        (value) => formats.big_int(value, {raw}) :
        (
          raw ? 
            (value) => dollar_formats.compact2_raw(value) : 
            (value) => formats.compact2(value)
        )
    ) :
    ((value) => raw ? formatter(value, {raw: true}) : formatter(value))
);


const get_scale_bounds = (stacked, raw_data, zoomed) => {
  const min = _.min(raw_data);
  const max = _.max(raw_data);
  const scaled_min = min < 0 ? min * 1.05 : min * 0.95;
  const scaled_max = max < 0 ? max * 0.95 : max * 1.05;
  if(stacked){
    return {
      min: min < 0 ? scaled_min : 0,
      max: 'auto',
    };
  }
  return {
    min: zoomed || min < 0 ? scaled_min : 0,
    max: !zoomed && max < 0 ? 0 : scaled_max,
  };
};


const smalldevice_tooltip_content = (tooltip_item, formatter) => (
  <td>
    <div className="nivo-tooltip__content"> {tooltip_item.name || tooltip_item.id} </div>
    <div className="nivo-tooltip__content" dangerouslySetInnerHTML={{__html: formatter(tooltip_item.value)}} />
  </td>
);

const tooltip_content = (tooltip_item, formatter) => (
  <Fragment>
    <td className="nivo-tooltip__content"> {tooltip_item.name || tooltip_item.id} </td>
    <td className="nivo-tooltip__content" dangerouslySetInnerHTML={{__html: formatter(tooltip_item.value)}} />
  </Fragment>
);

const smalldevice_percent_tooltip_content = (tooltip_item, formatter, total) => (
  <td>
    <div className="nivo-tooltip__content">{tooltip_item.name || tooltip_item.id}</div>
    <div className="nivo-tooltip__content" dangerouslySetInnerHTML = {{__html: formatter(tooltip_item.value)}}/>
    <div className="nivo-tooltip__content" dangerouslySetInnerHTML = {{__html: formats.percentage1(Math.abs(tooltip_item.value)/total)}}/>
  </td>
);

const percent_tooltip_content = (tooltip_item, formatter, total) => (
  <Fragment>
    <td className="nivo-tooltip__content">{tooltip_item.name || tooltip_item.id}</td>
    <td className="nivo-tooltip__content" dangerouslySetInnerHTML = {{__html: formatter(tooltip_item.value)}}/>
    <td className="nivo-tooltip__content" dangerouslySetInnerHTML = {{__html: formats.percentage1(Math.abs(tooltip_item.value)/total)}}/>
  </Fragment>
);

const default_tooltip = (tooltip_items, formatter, total) => ( // total indicates percent value tooltip being used
  <div style={{color: window.infobase_color_constants.textColor}}>
    <table className="nivo-tooltip">
      <tbody>
        { tooltip_items.map(
          tooltip_item => ( 
            <tr key = {tooltip_item.id}>
              <td className="nivo-tooltip__content">
                <div style={{height: '12px', width: '12px', backgroundColor: tooltip_item.color}} />
              </td>
              <MediaQuery minDeviceWidth={breakpoints.minSmallDevice}>
                {total ? percent_tooltip_content(tooltip_item, formatter, total) : tooltip_content(tooltip_item, formatter) }
              </MediaQuery>
              <MediaQuery maxDeviceWidth={breakpoints.maxSmallDevice}>
                {total ? smalldevice_percent_tooltip_content(tooltip_item, formatter, total) : smalldevice_tooltip_content(tooltip_item, formatter)}
              </MediaQuery>
            </tr>
          )
        )}
      </tbody>
    </table>
  </div>
);

const fixedSymbolShape = ({
  x, y, size, fill, borderWidth, borderColor,
}) => (
  <rect
    x={x}
    y={y}
    transform={window.feature_detection.is_IE() ? `translate(0 -4)` : ''}
    fill={fill}
    strokeWidth={borderWidth}
    stroke={borderColor}
    width={size}
    height={size}
    style={{ pointerEvents: 'none' }}
  />
);

class TableSwitchableGraph extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      show_table: false,
    };
  }

  render(){      
    const {
      show_table,
    } = this.state;

    const {
      graph,
      table,
    } = this.props;

    return (
      <Fragment>
        { show_table ? table : graph }
        <button
          style={{
            zIndex: 999,
          }}
          className="btn-table-view btn-group-lg btn-ib-primary"
          onClick={ () => this.setState({ show_table: !show_table }) }
        >
          { show_table ? trivial_text_maker("switch_to_graph") : trivial_text_maker("switch_to_table") }
        </button>
      </Fragment>
    );
  }
}


const general_default_props = {
  tooltip: (d, tooltip_formatter) => default_tooltip(d, tooltip_formatter),
  percent_value_tooltip: (d, tooltip_formatter, total) => default_tooltip(d, tooltip_formatter, total),
  is_money: true,
  remove_bottom_axis: false,
  remove_left_axis: false,
  add_top_axis: false,
  enableLabel: false,
  enableGridX: true,
  enableGridY: true,
  margin: {
    top: 50,
    right: 40,
    bottom: 50,
    left: 70,
  },
  theme: {
    axis: {
      ticks: {
        text: { 
          fontSize: 12,
          fill: window.infobase_color_constants.textColor,
        },
      },
    },
    legends: {
      text: {
        fontSize: 12,
      },
    },
  },
};


export class NivoResponsivePie extends React.Component{
  render(){
    const {
      data,
      colors,
      theme,
      enableRadialLabels,
      enableSlicesLabels,
      tooltip,
      percent_value_tooltip,
      include_percent,
      total,
      margin,
      text_formatter,
      colorBy,
      legends,
      startAngle,
      is_money,
    } = this.props;
    legends && (legends[0].symbolShape = fixedSymbolShape);
    
    const data_with_absolute_values = _.map(
      data,
      (data) => ({
        ...data,
        value: Math.abs(data.value),
        original_value: data.value,
      })
    );
    
    return (
      <ResponsivePie
        {...{
          data: data_with_absolute_values,
          margin,
          colors,
          theme,
          startAngle,
          enableSlicesLabels,
          enableRadialLabels,
          legends,
          colorBy,
        }}
        tooltip={ (data) => {
          const data_with_original_values = {
            ...data,
            value: data.original_value,
          };

          if (include_percent){
            return percent_value_tooltip(
              [data_with_original_values],
              get_formatter(is_money, text_formatter, false), 
              total
            );
          } else {
            return tooltip(
              [data_with_original_values],
              get_formatter(is_money, text_formatter, false)
            );
          } 
        }}
        innerRadius={0.5}
        borderWidth={1}
        borderColor="inherit:darker(0.2)"
        radialLabelsSkipAngle={0}
        animate={true}
        motionStiffness={30}
        motionDamping={15}
      />
    );
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
  enableRadialLabels: false,
  enableSlicesLabels: false,
};

export class NivoResponsiveBar extends React.Component{
  render(){
    const{
      data,
      keys,
      margin,
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
      label_col_header,
    } = this.props;

    legends && (legends[0].symbolShape = fixedSymbolShape);

    const table_data = _.map(data, row => ({col_data: row, label: row[indexBy], sort_keys: row}));
    const table_header_keys = _.concat([indexBy],keys);
    
    const table = <DisplayTable data={table_data} column_keys={table_header_keys} sort_keys={table_header_keys} table_data_headers={table_header_keys} table_name={"TODO"}/>;
    
    // have to have an empty string in key to make sure that negative bars will be displayed
    
    const graph = <ResponsiveBar
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
        legends,
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
      keys = {_.union([''],keys)}
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
    />;
    
    return <TableSwitchableGraph graph={graph} table={table} />;
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
    } = this.props;
    legends && (legends[0].symbolShape = fixedSymbolShape);

    return (
      //have to have an empty string in key to make sure
      //that negative bars will be displayed
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
          legends,
          isInteractive,
          labelSkipWidth,
          markers,
        }}
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
    );
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

export class NivoResponsiveLine extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      y_scale_zoomed: false,
    };
  }
  render(){
    const {
      data,
      is_money,
      raw_data,
      margin,
      tick_amount,
      colors,
      colorBy,
      max,
      min,
      enableArea,
      enableGridX,
      enableGridY,
      left_axis,
      show_yaxis_zoom,
      yScale,
      motion_damping,
      motion_stiffness,
      enableDotLabel,
      remove_bottom_axis,
      remove_left_axis,
      bttm_axis,
      text_formatter,
      stacked,
      theme,
      tooltip,
      markers,
      legends,
      magnify_glass_translateX,
      magnify_glass_translateY,
      layers,
    } = this.props;

    const {
      y_scale_zoomed,
    } = this.state;

    legends && (legends[0].symbolShape = fixedSymbolShape);
    return (
      <Fragment>
        {show_yaxis_zoom && !enableArea &&
          <button
            style={{
              position: "absolute",
              left: magnify_glass_translateX || margin.left,
              top: magnify_glass_translateY || margin.top,
              marginLeft: "-7px",
              marginTop: "-30px",
              zIndex: 999,
              padding: "0px",
            }}
            className="btn-ib-zoom"
            onClick={ 
              () => {
                this.setState({
                  y_scale_zoomed: !y_scale_zoomed,
                });
              }
            }
          >
            { this.state.y_scale_zoomed ? 
                <IconZoomOut
                  title={trivial_text_maker("zoom_out")}
                  color={window.infobase_color_constants.tertiaryColor}
                  alternate_color={window.infobase_color_constants.primaryColor}
                /> : 
                <IconZoomIn 
                  title={trivial_text_maker("zoom_in")}
                  color={window.infobase_color_constants.tertiaryColor}
                  alternate_color={window.infobase_color_constants.primaryColor}
                />
            }
          </button>
        }
        <ResponsiveLine
          {...{
            data,
            margin,
            enableGridX,
            enableGridY,
            enableArea,
            colorBy,
            colors,
            theme,
            enableDotLabel,
            markers,
            legends,
            layers,
          }}
          tooltip={ (d) => tooltip( d, get_formatter(is_money, text_formatter, false) ) }
          yScale={{
            stacked: !!stacked,
            type: "linear",
            min: min || get_scale_bounds(stacked, raw_data, y_scale_zoomed).min,
            max: max || get_scale_bounds(stacked, raw_data, y_scale_zoomed).max,
            ...(yScale || {}),
          }}
          axisBottom={remove_bottom_axis ? null : bttm_axis}
          axisLeft={remove_left_axis ? null :
          {
            orient: "left",
            tickSize: 5,
            tickPadding: 5,
            tickValues: tick_amount || 6,
            format: d => get_formatter(is_money, text_formatter)(d),
            ...(left_axis || {}),
          }}
          axisTop={null}
          axisRight={null}
          xScale={{ type: "point" }}
          animate={true}
          motionStiffness={motion_stiffness}
          motionDamping={motion_damping}
          dotSize={stacked ? 0 : 10}
          areaOpacity={stacked ? 1 : 0}
        />
      </Fragment>
    );
  }
}


NivoResponsiveLine.defaultProps = {
  ...general_default_props,
  tooltip: (slice, tooltip_formatter) => default_tooltip(
    slice.data.map( 
      (d) => ({
        id: d.serie.id,
        color: d.serie.color,
        value: d.data.y,
      })
    ), 
    tooltip_formatter,
  ),
  colors: window.infobase_color_constants.textColor,
  bttm_axis: {
    tickSize: 7,
    tickPadding: 12,
  },
  enableDotLabel: false,
  enableArea: false,
  stacked: false,
  show_yaxis_zoom: true,
  yScale: {
    type: "linear",
    zoomed: false,
    toggle: false,
  },
  motion_damping: 19,
  motion_stiffness: 100,
};

export {
  get_formatter,
};