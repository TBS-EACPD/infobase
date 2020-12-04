import React from "react";

import { tertiaryColor } from "src/core/color_defs.js";

import { LegendList } from "./LegendList.js";

import "./StandardLegend.scss";

export const StandardLegend = ({
  title,
  items, //required: [ {active, id, label, color} ]

  isHorizontal,

  onClick,
  LegendCheckBoxProps,

  Controls,
}) => (
  <div className="standard-legend-container">
    <div
      style={{ maxHeight: "400px", display: "flex", flexDirection: "column" }}
    >
      {title && (
        <p className="mrgn-bttm-0 mrgn-tp-0 nav-header centerer">{title}</p>
      )}
      <div style={{ overflowX: "hidden" }}>
        <LegendList
          {...{
            items,
            isHorizontal,

            onClick,
            LegendCheckBoxProps,
          }}
        />
      </div>
      {Controls && (
        <div
          style={{
            borderTop: `1px dashed ${tertiaryColor}`,
            padding: "10px 0px 10px 5px",
          }}
        >
          {Controls}
        </div>
      )}
    </div>
  </div>
);
