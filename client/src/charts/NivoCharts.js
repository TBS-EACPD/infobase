import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from './nivo-bar.js';
import { ResponsivePie } from '@nivo/pie';
import { formats, dollar_formats } from "../core/format.js";
import { Fragment } from 'react';
import {
  IconZoomIn,
  IconZoomOut,
} from '../icons/icons.js';
import './NivoCharts.scss';


const get_formatter = (is_money, formatter, raw = true) => (
  _.isUndefined(formatter) ?
    ( 
      !is_money ? 
        (value) => formats.big_int_real(value, {raw}) :
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

const default_tooltip = (tooltip_items, formatter) => (
  <div style={{color: window.infobase_color_constants.textColor}}>
    <table style={{width: '100%', borderCollapse: 'collapse'}}>
      <tbody>
        { tooltip_items.map(
          tooltip_item => ( 
            <tr key = {tooltip_item.id}>
              <td style= {{padding: '3px 5px'}}>
                <div style={{height: '12px', width: '12px', backgroundColor: tooltip_item.color}} />
              </td>
              <td style={{padding: '3px 5px'}}> {tooltip_item.id} </td>
              <td style={{padding: '3px 5px'}} dangerouslySetInnerHTML={{__html: formatter(tooltip_item.value)}} />
            </tr>
          )
        )}
      </tbody>
    </table>
  </div>
);

const percent_value_tooltip = (tooltip_items, formatter, total) => (
  <div>
    <table>
      <tbody>{ tooltip_items.map( d =>(
        <tr key = {d.id}>
          <td style = {{padding: '3px 5px'}}>
            <div style = {{height: '12px', width: '12px', backgroundColor: d.color}}/>
          </td>
          <td style = {{padding: '3px 5px'}}>{d.id}</td>
          <td style = {{padding: '3px 5px'}} dangerouslySetInnerHTML = {{__html: formatter(d.value)}}/>
          <td style = {{padding: '3px 5px'}} dangerouslySetInnerHTML = {{__html: formats.percentage1(d.value/total)}}/>
        </tr>
      ))}
      </tbody>
    </table>
  </div>
);

const general_default_props = {
  tooltip: (d, tooltip_formatter) => default_tooltip(d, tooltip_formatter),
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
      include_percent,
      total,
      margin,
      text_formatter,
      colorBy,
      legends,
      startAngle,
      is_money,
    } = this.props;

    return (
      <ResponsivePie
        {...{data,
          margin,
          colors,
          theme,
          startAngle,
          enableSlicesLabels,
          enableRadialLabels,
          legends,
          colorBy,
        }}
        tooltip={ (d) => include_percent? 
          percent_value_tooltip( [d], get_formatter(is_money, text_formatter, false), total) :
          tooltip([d], get_formatter(is_money, text_formatter, false)) }
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
    } = this.props;

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
          legends,
          isInteractive,
          motion_damping,
          motion_stiffness,
          bttm_axis,
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
        padding={0.3}
        borderColor="inherit:darker(1.6)"
        labelTextColor="inherit:darker(1.6)"
      />
    );
  }
};
NivoResponsiveBar.defaultProps = {
  ...general_default_props,

  bttm_axis: {
    tickSize: 7,
    tickPadding: 10,
    tickRotation: 0,
  },
  isInteractive: true,
  motion_damping: 15,
  motion_stiffness: 95,
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
                  color={window.infobase_color_constants.tertiaryColor}
                  alternate_color={window.infobase_color_constants.primaryColor}
                /> : 
                <IconZoomIn 
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
