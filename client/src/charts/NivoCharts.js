import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from './nivo-bar.js';
import { ResponsivePie } from '@nivo/pie'
import { formats, dollar_formats } from "../core/format.js";

const get_formatter = (is_money, formatter, raw = true) => (
  _.isUndefined(formatter)?
    (!is_money ? 
      (value) => formats.big_int_real(value, {raw}) :
      raw ? 
        (value) => dollar_formats.compact2_raw(value) : 
        (value) => formats.compact2(value)) :
    ((value) => raw ? formatter(value, {raw: true}) : formatter(value))
);

const default_tooltip = (tooltip_items, formatter) => (
  <div style={{color: '#000'}}>
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

const general_default_props = {
  tooltip: (d, tooltip_formatter) => default_tooltip(d, tooltip_formatter),
  is_money: true,
  margin: {
    top: 50,
    right: 40,
    bottom: 50,
    left: 70,
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
      margin,
      text_formatter,
      colorBy,
      legends,
      startAngle,
      is_money,
    } = this.props

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
        tooltip={ (d) => tooltip( [d], get_formatter(is_money, text_formatter, false) ) }
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
      motion_damping,
      motion_stiffness,
      tooltip,
      enableGridX,
      groupMode,
      enableGridY,
    } = this.props;

    return (
      <ResponsiveBar
        {...{data,
          keys,
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
        }}
        labelFormat={_.isUndefined(label_format) ? null : label_format}
        tooltip={ (d) => tooltip( [d], get_formatter(is_money, text_formatter, false) ) }
        axisBottom={remove_bottom_axis ? null : bttm_axis}
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
        padding={0.3}
        borderColor="inherit:darker(1.6)"
        labelTextColor="inherit:darker(1.6)"
        motionDamping={motion_damping || 15}
        motionStiffness={motion_stiffness || 95}
      />
    );
  }
};
NivoResponsiveBar.defaultProps = {
  ...general_default_props,

  bttm_axis: {
    tickSize: 3,
    tickPadding: 10,
  },
  theme: {
    axis: {
      ticks: {
        text: { 
          fontSize: 12,
          fill: '#000',
        },
      },
    },
  },
  isInteractive: true,
  remove_bottom_axis: false,
  remove_left_axis: false,
  enableLabel: false,
  enableGridX: true,
  enableGridY: true,
};

export class NivoResponsiveLine extends React.Component {
  constructor(props){
    super(props)
  }
  render(){
    const { 
      data,
      is_money,
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
      yScale,
      motion_damping,
      motion_stiffness,
      enableDotLabel,
      remove_bottom_axis,
      bttm_axis,
      text_formatter,
      stacked,
      theme,
      tooltip,
    } = this.props;

    return (
      <ResponsiveLine
        {...{data,
          margin,
          enableGridX,
          enableGridY,
          enableArea,
          colorBy,
          colors,
          theme,
          enableDotLabel,
        }}
        tooltip={ (d) => tooltip( d, get_formatter(is_money, text_formatter, false) ) }
        yScale={ 
          {
            type: "linear",
            stacked: stacked,
            max: max,
            min: enableArea? 0: min,
            ...(yScale || {}),
          }
        }
        axisBottom={remove_bottom_axis ? null : bttm_axis}
        axisLeft={{
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
        motionStiffness={motion_stiffness || 100}
        motionDamping={motion_damping || 19}
        dotSize={10}
      />
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

  colors: '#000000',
  bttm_axis: {
    tickSize: 5,
    tickPadding: 5,
  },
  theme: {
    axis: {
      ticks: {
        text: { 
          fontSize: 12,
          fill: '#000',
        },
      },
    },
  },
  remove_bottom_axis: false,
  enableDotLabel: false,
  stacked: false,
  enable_label: false,
  enableGridX: true,
  enableGridY: true,
  enableArea: false,
  max: "auto",
  min: "auto",
};