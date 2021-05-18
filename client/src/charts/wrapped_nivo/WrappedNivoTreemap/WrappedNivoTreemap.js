import { TreeMapHtml } from "@nivo/treemap";
import React, { Fragment } from "react";
import MediaQuery from "react-responsive";

import { breakpoints } from "src/core/breakpoint_defs";

import "./WrappedNivoTreemap.scss";

import { DefaultTooltip } from "src/charts/wrapped_nivo/wrapped_nivo_common";

class _WrappedNivoTreemap extends React.Component {
  render() {
    const {
      data,
      colorScale,
      value_string,
      formatter,
      label_id,
      height,
      width,
    } = this.props;

    return (
      <TreeMapHtml
        height={height}
        width={width}
        data={data}
        identity={label_id}
        value={value_string}
        leavesOnly={true}
        colors={(d) => colorScale(d.data)}
        nodeOpacity={1}
        borderColor={{ theme: "background" }}
        borderWidth={2}
        animate={false}
        label={function (e) {
          return (
            <div
              style={{
                width: "80%",
              }}
              className="FlatTreeMap__TextBox"
            >
              <div className="FlatTreeMap__ContentTitle">{e.id}</div>
              <div
                className="FlatTreeMap__ContentText"
                dangerouslySetInnerHTML={{
                  __html: formatter(e.formattedValue),
                }}
              ></div>
            </div>
          );
        }}
        labelSkipSize={50}
        tooltip={({ node }) => (
          <div style={{ maxWidth: "200px" }}>
            <DefaultTooltip tooltip_items={[node]} formatter={formatter} />
          </div>
        )}
      />
    );
  }
}

export class WrappedNivoTreemap extends React.Component {
  render() {
    return (
      <Fragment>
        <MediaQuery maxWidth={breakpoints.maxSmallDevice}>
          <_WrappedNivoTreemap {...this.props} height={200} width={200} />
        </MediaQuery>
        <MediaQuery minWidth={breakpoints.minSmallDevice}>
          <_WrappedNivoTreemap {...this.props} height={400} width={400} />
        </MediaQuery>
      </Fragment>
    );
  }
}
