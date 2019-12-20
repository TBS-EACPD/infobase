import { ResponsiveHeatMap } from "@nivo/heatmap";

import { general_default_props } from "./nivo_common.js";

export class NivoResponsiveHeatMap extends React.Component {
  render() {
    const {
      data,
      tooltip,
      keys,
      indexBy,
      forceSquare,
      padding,
      margin,
      colors,
      cellOpacity,
      cellBorderWidth,
      cellBorderColor,
      enableLabels,
      labelTextColor,
      nanColor,
      top_axis,
      bttm_axis,
      left_axis,
      right_axis,
      remove_bottom_axis,
      remove_left_axis,
      motion_stiffness,
      motion_damping,
    } = this.props;

    return (
      <ResponsiveHeatMap
        {...{
          data,
          keys,
          indexBy,
          forceSquare,
          padding,
          margin,
          colors,
          cellOpacity,
          cellBorderWidth,
          cellBorderColor,
          enableLabels,
          labelTextColor,
          nanColor,
        }}
        tooltip={tooltip}
        axisBottom={remove_bottom_axis ? null : bttm_axis}
        axisLeft={remove_left_axis ? null : left_axis}
        axisTop={top_axis}
        axisRight={right_axis}
        animate={true}
        motionStiffness={motion_stiffness}
        motionDamping={motion_damping}
      />
    );
  }
}
NivoResponsiveHeatMap.defaultProps = {
  ...general_default_props,
  forceSquare: true,
  cellOpacity: 1,
  nanColor: window.infobase_color_constants.tertiaryColor,
  motion_stiffness: 300,
  motion_damping: 25,
};
