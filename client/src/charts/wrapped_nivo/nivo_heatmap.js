import { ResponsiveHeatMap } from "@nivo/heatmap";

import { general_default_props } from "./nivo_common.js";

export class NivoResponsiveHeatMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show_table: false,
    };
  }

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
      table_switch,
      label_col_header,
      graph_height,
    } = this.props;

    const { show_table } = this.state;

    const table_data = _.map(data, (row) => ({
      col_data: row,
      label: row[indexBy],
      sort_keys: row,
    }));

    return (
      <Fragment>
        {!show_table ? (
          <div style={{ height: graph_height || null }}>
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
          </div>
        ) : (
          <DisplayTable
            data={table_data}
            label_col_header={label_col_header}
            column_keys={keys}
            sort_keys={keys}
            table_data_headers={keys}
            table_name={"TODO"}
          />
        )}
        {table_switch && (
          <button
            style={{
              zIndex: 999,
              padding: "0px",
            }}
            className="btn-ib-zoom"
            onClick={() => {
              this.setState({
                show_table: !show_table,
              });
            }}
          >
            {this.state.show_table
              ? trivial_text_maker("switch_to_graph")
              : trivial_text_maker("switch_to_table")}
          </button>
        )}
      </Fragment>
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
