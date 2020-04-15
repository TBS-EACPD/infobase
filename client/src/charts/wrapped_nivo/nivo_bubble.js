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

// Hacky abuse of ResponsiveBubble... very fragile against nivo changes. Bonus comments left in this file to balance against this
// Would be trivial to make this graph ourselves, only reason for doing it like this is
// to get nivo native tooltips (and even then they're extra funky ones) and our common nivo graph utilities.
// ... that's something worth reconsidering down the line  

const MIN_NODE_RADIUS = 2;
const ProportionalNode = ({ node, style, handlers }) => {
  if (style.r <= 0){
    return null;
  }

  const {
    // note these aren't values for the specific node, but for the whole graph, e.g. r is always the outer circle radius,
    // and (x, y) is the center of the graph. Node specific values are calculated below
    r, x, y,

    fill,
    color,
    borderColor,
    borderWidth,
  } = style;

  const propotional_radius = (() => {
    if ( _.isNull(node.parent) ){
      return r;
    } else {

      // need to be clear here, node.value !== graph_data.value as seen below. The config data from graph_data is stored in
      // node.data. The value in node.value is node.data.value PLUS the sum of child values
      // ... kind of makes sense for the standard use of this graph, but still a bit of annoying hidden logic. Makes what
      // we're doing here extra hacky
      const proportion_ratio = node.value/node.parent.value;

      return _.max([
        r*Math.sqrt(proportion_ratio), // want the actual area to be proportional? Do the math
        MIN_NODE_RADIUS,
      ]);
    }
  })();
  
  return (
    <g transform={`translate(${x},${y})`}>
      <circle
        r={propotional_radius}
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
      // ... nivo bubble will roll child values back up and add them to the parent value for use (both in the graph and tooltip)
      // so we need to remove the inner portion from the total here
      value: parent_value - child_value,
      color: color_scale(parent_name),
      children: [
        {
          id: child_name,
          name: child_name,
          value: child_value,
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
            root={graph_data}
            identity="name"
            value="value"
            colorBy={d => color_scale(d.name)}
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
            nodeComponent={ProportionalNode}
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
