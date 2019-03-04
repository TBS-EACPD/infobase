import { ResponsiveLine } from '@nivo/line';
import { formats } from "../panels/shared.js"; 
// export class TBS_responsive_bar extends React.Component{
//   constructor(props){
//     super(props)
//   }
//   render(){
//     const {
//       temp,
//     } = this.props;
//     return ("replace later")
//   }
// }
export class TBS_responsive_line extends React.Component {
  constructor(props){
    super(props)
  }
  render(){
    const { 
      data,
      is_money,
      data_formatter,
      centered,
      margin,
    } = this.props;

    return (
      <ResponsiveLine
        data={[
          {
            "data": data_formatter == null ? data : data_formatter(data)}]}
        margin={{
          "top": 20,
          "right": 30,
          "bottom": 20,
          "left": 70,
        }}
        xScale={{
          "type": "point",
        }}
        yScale={{
          "type": "linear",
          "stacked": true,
          "max": centered?_.max(data)*1.05:"auto",
          "min": centered?_.min(data)*0.95:"auto",
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={null}
        axisLeft={{
          "orient": "left",
          "tickSize": 5,
          "tickPadding": 5,
          "tickValues": 6,
          "format": d => is_money? formats.compact1(d,{raw: true}) : formats.big_int_real(d,{raw: true}),
        }}
        dotSize={10}
        enableGridX={false}
        enableGridY={false}
        enableDotLabel={false}
        animate={true}
        motionStiffness={90}
        motionDamping={15}
        tooltipFormat={d => {formats.compact1(d,{raw: true})}}
        colors="#000"
        theme={{
          axis: {
            ticks: {
              text: { 
                fontSize: 12.5,
                fill: '#000',
              },
            },
          },
        }}
      />
      // <ResponsiveLine
      //   data={[
      //     {
      //       "data": _.isEmpty(data_formatter)? data : data_formatter(data)}]}
      //   margin={_.isEmpty(margin)?{
      //     "top": 50,
      //     "right": 40,
      //     "bottom": 50,
      //     "left": 65,
      //   }:margin}
      //   xScale={{
      //     "type": "point",
      //   }}
      //   yScale={{
      //     "type": "linear",
      //     "stacked": true,
      //     "max": centered?_.max(data)*1.05:"auto",
      //     "min": centered?_.min(data)*0.95:"auto",
      //   }}
      //   axisTop={null}
      //   axisRight={null}
      //   axisBottom={null}
      //   axisLeft={{
      //     "orient": "left",
      //     "tickSize": 5,
      //     "tickPadding": 5,
      //     "tickValues": 6,
      //     "format": d => is_money? formats.compact1(d,{raw: true}) : formats.big_int_real(d,{raw: true}),
      //   }}
      //   dotSize={10}
      //   enableGridX={false}
      //   enableGridY={false}
      //   enableDotLabel={false}
      //   animate={true}
      //   motionStiffness={90}
      //   motionDamping={15}
      //   tooltipFormat={d => <tspan>{is_money? formats.compact1(d,{raw: true}) : formats.big_int_real(d,{raw: true})}</tspan>}
      //   colors="#000"
      //   theme={{
      //     axis: {
      //       ticks: {
      //         text: { 
      //           fontSize: 12.5,
      //           fill: '#000',
      //         },
      //       },
      //     },
      //   }}
      // />
    )
  }
}
  
  

  