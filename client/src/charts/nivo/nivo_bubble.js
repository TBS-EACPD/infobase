import './NivoCharts.scss';
import { ResponsiveBubble } from '@nivo/circle-packing';
import classNames from 'classnames';
import { Fragment } from 'react';
import {
  graph_text_maker,
  general_default_props,
} from './nivo_shared.js';
import { newIBCategoryColors } from '../../core/color_schemes.js';



const BubbleNode = ({ node, style, handlers, theme }) => {
  if (style.r <= 0) return null;

  const min_node_radius = 2;

  const real_r = node.data.isOuter ?
    style.r :
    style.r*node.data.ratio > min_node_radius ?
      style.r*node.data.ratio :
      min_node_radius;
  
  return (
    <g transform={`translate(${style.x},${style.y})`}>
      <circle
        r={real_r}
        {...handlers}
        fill={style.fill ? style.fill : style.color}
        stroke={style.borderColor}
        strokeWidth={style.borderWidth}
      />
    </g>
  );
};

// const circle_proportion_tooltip = (tooltip_data, is_money) => (
//   <div style={{color: window.infobase_color_constants.textColor}}>
//     <table style={{width: '100%', borderCollapse: 'collapse'}}>
//       <tbody>
//         <tr key = {tooltip_data.parent.id}>
//           <td className="nivo-tooltip__content">
//             <div style={{display: "flex"}}>
//               <div style={{height: '12px', width: '12px', backgroundColor: tooltip_data.all_other.color, flex: "0 0 auto"}} />
//               <div style={{paddingBottom: '12px', padding: '5px', flex: "0 0 auto"}}>{graph_text_maker("and")}</div>
//               <div style={{height: '12px', width: '12px', backgroundColor: tooltip_data.child.color, flex: "0 0 auto"}} />
//             </div>
//           </td>
//           <MediaQuery minDeviceWidth={breakpoints.minSmallDevice}>
//             {percent_tooltip_content(tooltip_data.parent, get_formatter(is_money), get_percent_formatter(tooltip_data.parent.value), tooltip_data.parent.value)}
//           </MediaQuery>
//           <MediaQuery maxDeviceWidth={breakpoints.maxSmallDevice}>
//             {smalldevice_percent_tooltip_content(tooltip_data.parent, get_formatter(is_money), get_percent_formatter(tooltip_data.parent.value), tooltip_data.parent.value)}
//           </MediaQuery>
//         </tr>
//         <tr key = {tooltip_data.child.id}>
//           <td className="nivo-tooltip__content">
//             <div style={{height: '12px', width: '12px', backgroundColor: tooltip_data.child.color}} />
//           </td>
//           <MediaQuery minDeviceWidth={breakpoints.minSmallDevice}>
//             {percent_tooltip_content(tooltip_data.child, get_formatter(is_money), get_percent_formatter(tooltip_data.child.value), tooltip_data.parent.value)}
//           </MediaQuery>
//           <MediaQuery maxDeviceWidth={breakpoints.maxSmallDevice}>
//             {smalldevice_percent_tooltip_content(tooltip_data.child, get_formatter(is_money), get_percent_formatter(tooltip_data.child.value), tooltip_data.parent.value)}
//           </MediaQuery>
//         </tr>
//         <tr key = {tooltip_data.all_other.id}>
//           <td className="nivo-tooltip__content">
//             <div style={{height: '12px', width: '12px', backgroundColor: tooltip_data.all_other.color}} />
//           </td>
//           <MediaQuery minDeviceWidth={breakpoints.minSmallDevice}>
//             {percent_tooltip_content(tooltip_data.all_other, get_formatter(is_money), get_percent_formatter(tooltip_data.all_other.value), tooltip_data.parent.value)}
//           </MediaQuery>
//           <MediaQuery maxDeviceWidth={breakpoints.maxSmallDevice}>
//             {smalldevice_percent_tooltip_content(tooltip_data.all_other, get_formatter(is_money), get_percent_formatter(tooltip_data.all_other.value), tooltip_data.parent.value)}
//           </MediaQuery>
//         </tr>
//       </tbody>
//     </table>
//   </div>
// )

export class CircleProportionChart extends React.Component{
  render(){
    const{
      margin,
      is_money,
      text_formatter,
      labelSkipWidth,
      height,
      child_value,
      child_name,
      parent_value,
      parent_name,
    } = this.props;

    const color_scale = d3.scaleOrdinal().range(newIBCategoryColors);

    const graph_data = {
      id: parent_name,
      name: parent_name,
      value: parent_value-child_value,
      color: color_scale(parent_name),
      isOuter: true,
      children: [
        {
          id: child_name,
          name: child_name,
          value: child_value,
          ratio: child_value/parent_value,
          color: color_scale(child_name),
        },
      ],
    };

    const tooltip_data = {
      all_other: {
        id: graph_text_maker("bubble_all_other"),
        value: parent_value-child_value,
        color: color_scale(parent_name),
      },
      child: {
        id: child_name,
        value: child_value,
        color: color_scale(child_name),
      },
      parent: {
        id: parent_name,
        value: parent_value,
      },
    };
    

    const title = <div>{graph_text_maker("bubble_title",{outer: parent_name, inner: child_name})}</div>;

    return (
      <Fragment>
        <div style={{height: height}}>
          <ResponsiveBubble
            root={ graph_data }
            identity="name"
            value="value"
            colorBy={d=>color_scale(d.name)}
            borderColor="inherit:darker(1.6)"
            borderWidth={0}
            enableLabel={false}
            labelTextColor={window.infobase_color_constants.textColor}
            labelSkipWidth={labelSkipWidth}
            animate={true}
            motionStiffness={90}
            motionDamping={12}  
            leavesOnly={false}
            padding={0}
            nodeComponent={BubbleNode}
            margin={ margin }
          />
        </div>
        <div style={{textAlign: "center"}}>
          {title}
        </div>
      </Fragment>
    );
  }
};
CircleProportionChart.defaultProps = {
  ...general_default_props,
  isInteractive: false,
  margin: { top: 15, right: 0, bottom: 15, left: 0 },
};