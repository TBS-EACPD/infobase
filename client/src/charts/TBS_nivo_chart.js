import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '../nivo-bar.js';
import { ResponsivePie } from '@nivo/pie'
import { formats } from "../panels/shared.js";


export class TBS_responsive_pie extends React.Component{
  constructor (props){
    super(props)
  }

  render (){
    const {
      data,
      colors,
      theme,
      enable_radial_labels = false,
      enable_slice_labels = false,
      tooltip_format,
      margin,
      legend,
      start_angle = -120,
      is_money = true,
    } = this.props
    return(
      <ResponsivePie
        data={data}
        margin={_.isUndefined(margin)?{
          "top": 30,
          "right": 80,
          "bottom": 60,
          "left": 50,
        } : margin}
        innerRadius={0.5}
        colors={colors}
        borderWidth={1}
        borderColor="inherit:darker(0.2)"
        radialLabelsSkipAngle={0}
        startAngle={start_angle}
        enableSlicesLabels = {enable_slice_labels}
        enableRadialLabels={enable_radial_labels}
        animate={true}
        motionStiffness={30}
        motionDamping={15}
        tooltipFormat={d => _.isUndefined(tooltip_format)?is_money?formats.compact1(d,{raw: true}):formats.big_int_real(d,{raw: true}): tooltip_format}
        legends={legend}
        theme= {theme}
      />
    )

  }
}
export class TBS_responsive_bar extends React.Component{
  constructor(props){
    super(props)
  }

  render(){
    const{
      data,
      keys,
      margin,
      label_format,
      colors,
      bttm_axis,
      left_axis,
      is_interactive = true,
      tooltip_format,
      index_by,
      remove_bottom_axis = false,
      remove_left_axis = false,
      enable_label = false,
      is_money = true,
      legend,
      tick_value,
      theme,
      tooltip,
      enableGridX = true,
      enableGridY = true,
    } = this.props;

    return (
      <ResponsiveBar
        data={data}
        keys={keys}
        indexBy={index_by}
        margin={_.isUndefined(margin)?{
          "top": 50,
          "right": 40,
          "bottom": 50,
          "left": 65,
        }:margin}
        labelFormat={_.isUndefined(label_format)? null : label_format}
        padding={0.3}
        colors = {colors}
        borderColor="inherit:darker(1.6)"
        axisBottom={remove_bottom_axis? null:_.isUndefined(bttm_axis)?({
          "tickSize": 3,
          "tickPadding": 10,
        }):bttm_axis}
        axisLeft={remove_left_axis? null:_.isUndefined(left_axis)?({
          "tickValues": _.isUndefined(tick_value)? 6 : tick_value,
          "min": "auto",
          "format": d => is_money? formats.compact1(d,{raw: true}) : formats.big_int_real(d,{raw: true}),
          "max": "auto", 
        }):left_axis}
        labelTextColor="inherit:darker(1.6)"
        motionStiffness={90}
        tooltip = {tooltip}
        tooltipFormat={d => _.isUndefined(tooltip_format)?is_money?formats.compact1(d,{raw: true}):formats.big_int_real(d,{raw: true}): tooltip_format}
        enableLabel = {enable_label}
        enableGridX = {enableGridX}
        enableGridY = {enableGridY}
        motionDamping={50}    
        isInteractive={is_interactive}
        legends={legend}
        theme={_.isUndefined(theme)?{
          axis: {
            ticks: {
              text: { 
                fontSize: 12.5,
                fill: '#000',
              },
            },
          },
        }:theme}
      />
    )
  }
};
export class TBS_responsive_line extends React.Component {
  constructor(props){
    super(props)
  }
  render(){
    const { 
      data,
      is_money = false,
      margin,
      tick_amount,
      colors,
      colorBy = undefined,
      max = "auto",
      min = "auto",
      enableArea = false,
      enableGridX = true,
      enableGridY = true,
      yScale,
      enable_dot_label = false,
      remove_bottom_axis = false,
      bttm_axis,
      stacked = false,
      theme,
      tooltip_format,
      tooltip,
    } = this.props;

    return (
      <ResponsiveLine
        data = {data}
        margin={_.isUndefined(margin)?{
          "top": 50,
          "right": 40,
          "bottom": 50,
          "left": 65,
        }:margin}
        xScale={{
          "type": "point",
        }}
        yScale={_.isUndefined(yScale)?{
          "type": "linear",
          "stacked": stacked,
          "max": max,
          "min": min,
        }: yScale}
        axisTop={null}
        axisRight={null}
        axisBottom={remove_bottom_axis?null:(_.isUndefined(bttm_axis)?{
          "tickSize": 5,
          "tickPadding": 5,
        }:bttm_axis)}
        axisLeft={{
          "orient": "left",
          "tickSize": 5,
          "tickPadding": 5,
          "tickValues": _.isUndefined(tick_amount)? 6 : tick_amount,
          "format": d => is_money? formats.compact1(d,{raw: true}) : formats.big_int_real(d,{raw: true}),
        }}
        dotSize={10}
        enableGridX={enableGridX}
        enableGridY={enableGridY}
        enableDotLabel={enable_dot_label}
        enableArea = {enableArea}
        colorBy ={colorBy}
        animate={true}
        motionStiffness={90}
        motionDamping={15}
        tooltip = {tooltip}
        tooltipFormat={d => _.isUndefined(tooltip_format)?is_money?formats.compact1(d,{raw: true}):formats.big_int_real(d,{raw: true}): tooltip_format}
        colors = {_.isUndefined(colors)? '#000000' : colors}
        theme={_.isUndefined(theme)?{
          axis: {
            ticks: {
              text: { 
                fontSize: 12.5,
                fill: '#000',
              },
            },
          },
        }: theme}
      />
    )
  }
}
  
  

  