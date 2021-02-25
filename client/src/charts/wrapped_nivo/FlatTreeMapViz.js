import { ResponsiveTreeMapHtml } from "@nivo/treemap";
import _ from "lodash";
import React from "react";

import "./FlatTreeMap.scss";

import { TreeMapHtmlNode } from "./TreeMapHtmlNode.js";
import { DefaultTooltip } from "./wrapped_nivo_common";

export class FlatTreeMapViz extends React.Component {
  render() {
    const {
      data,
      colorScale,
      value_string,
      formatter,
      label_id,
      text_func,
    } = this.props;

    const nivo_data = {
      name: "root",
      color: "white",
      children: _.map(data.children, (datum) => ({
        ...datum,
        [label_id]: text_func(datum, "-"),
      })),
    };

    return (
      <div style={{ height: 400, width: "100%" }}>
        <ResponsiveTreeMapHtml
          data={nivo_data}
          identity={label_id}
          value={value_string}
          leavesOnly={true}
          colors={(d) => colorScale(d.data)}
          nodeOpacity={1}
          borderColor={{ theme: "background" }}
          borderWidth={2}
          nodeComponent={TreeMapHtmlNode}
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
      </div>
    );
  }
}
