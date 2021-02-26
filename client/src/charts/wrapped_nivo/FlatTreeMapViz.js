import { TreeMapHtml } from "@nivo/treemap";
import React, { Fragment } from "react";
import MediaQuery from "react-responsive";

import { breakpoints } from "src/core/breakpoint_defs.js";

import "./FlatTreeMap.scss";

import { TreeMapHtmlNode } from "./TreeMapHtmlNode.js";
import { DefaultTooltip } from "./wrapped_nivo_common.js";

class _FlatTreeMapViz extends React.Component {
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
        nodeComponent={TreeMapHtmlNode}
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

export class FlatTreeMapViz extends React.Component {
  render() {
    return (
      <Fragment>
        <MediaQuery maxWidth={breakpoints.maxExtraSmallDevice}>
          <_FlatTreeMapViz {...this.props} height={200} width={200} />
        </MediaQuery>
        <MediaQuery minWidth={breakpoints.minExtraSmallDevice}>
          <_FlatTreeMapViz {...this.props} height={400} width={400} />
        </MediaQuery>
      </Fragment>
    );
  }
}
