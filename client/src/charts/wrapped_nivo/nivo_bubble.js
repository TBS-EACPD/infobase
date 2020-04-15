import text from './nivo_bubble.yaml';

import { ResponsiveBubble } from '@nivo/circle-packing';
import { Fragment } from 'react';

import {
  InteractiveGraph,
  create_text_maker_with_nivo_common,
  general_default_props,
  get_formatter,
} from './nivo_common.js';

import { formats } from "../../core/format.js";
import { newIBCategoryColors } from '../../core/color_schemes.js';
import { DisplayTable } from '../../components/index.js';
  
const text_maker = create_text_maker_with_nivo_common(text);


const MIN_NODE_RADIUS = 2;
const BubbleNode = ({ node, style, handlers, theme }) => {
  if (style.r <= 0){
    return null;
  }

  const {
    r, x, y,

    fill,
    color,
    borderColor,
    borderWidth,
  } = style;

  const {
    isOuter,
    ratio,
  } = node.data;

  const real_r = isOuter ? r : _.max([r*ratio, MIN_NODE_RADIUS]);
  
  return (
    <g transform={`translate(${x},${y})`}>
      <circle
        r={real_r}
        {...handlers}
        fill={fill ? fill : color}
        stroke={borderColor}
        strokeWidth={borderWidth}
      />
    </g>
  );
};


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
      disable_table_view,
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


    const ordered_column_keys = ["name", "value", "percent"];
    const column_names = {
      name: text_maker("label"),
      value: text_maker("value"),
      percent: text_maker("percentage"),
    };

    const table_data = [
      {
        display_values: {
          name: parent_name,
          value: get_formatter(is_money, text_formatter, true, true)(parent_value),
          percent: formats.percentage1_raw(1.0),
        },
        sort_values: {
          name: parent_name,
          value: parent_value,
          percent: 1.0,
        },
        search_values: {
          name: parent_name,
        },
      },
      {
        display_values: {
          name: child_name,
          value: get_formatter(is_money, text_formatter, true, true)(child_value),
          percent: formats.percentage1_raw(child_value/parent_value),
        },
        sort_values: {
          name: child_name,
          value: child_value,
          percent: child_value/parent_value,
        },
        search_values: {
          name: child_name,
        },
      },
    ];
    


    const title = <div
      dangerouslySetInnerHTML={{
        __html: text_maker("bubble_title", {outer: parent_name, inner: child_name}),
      }}
    />;  

    const table = !disable_table_view && (
      <DisplayTable
        rows={table_data}
        column_names={column_names}
        ordered_column_keys={ordered_column_keys}
        name={text_maker("bubble_title")}
      />
    );

    const graph = (
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

    return <InteractiveGraph graph={graph} table={table} />;
  }
};
CircleProportionChart.defaultProps = {
  ...general_default_props,
  isInteractive: false,
  margin: { top: 15, right: 0, bottom: 15, left: 0 },
};
