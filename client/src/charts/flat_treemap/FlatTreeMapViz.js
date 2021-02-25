import { ResponsiveTreeMapHtml } from "@nivo/treemap";
import React from "react";

import "./FlatTreeMap.scss";

import { TreeMapHtmlNode } from "./TreeMapHtmlNode.js";

export class FlatTreeMapViz extends React.Component {
  render() {
    const { data, colorScale, value_string, formatter } = this.props;

    const nivo_data = {
      name: "root",
      color: "white",
      children: data.children,
    };

    return (
      <div style={{ height: 400, width: "100%" }}>
        <ResponsiveTreeMapHtml
          data={nivo_data}
          identity="desc"
          value={value_string}
          valueFormat=" >-.1f"
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
        />
      </div>
    );
  }
}
