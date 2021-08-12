import React from "react";

import style_variables from "src/common_style_variables/_common-variables.scss";

import { LegendList, LegendListProps } from "./LegendList";

import "./StandardLegend.scss";

interface StandardLegendProps {
  title: string;
  Controls: React.ReactNode;
  legendListProps: LegendListProps;
}

export const StandardLegend = ({
  title,
  Controls,
  legendListProps: { items, isHorizontal, onClick, checkBoxProps },
}: StandardLegendProps) => (
  <div className="standard-legend-container">
    <div
      style={{ maxHeight: "400px", display: "flex", flexDirection: "column" }}
    >
      {title && (
        <p className="mrgn-bttm-0 mrgn-tp-0 nav-header centerer">{title}</p>
      )}
      {/* have to hard code max height since overflow on IE is bugged */}
      <div
        style={{
          overflowX: "hidden",
          maxHeight: "351px",
          msOverflowStyle: "-ms-autohiding-scrollbar",
        }}
      >
        <LegendList
          {...{
            items,
            isHorizontal,
            onClick,
            checkBoxProps,
          }}
        />
      </div>
      {Controls && (
        <div
          style={{
            borderTop: `1px dashed ${style_variables.tertiaryColor}`,
            padding: "10px 0px 10px 5px",
          }}
        >
          {Controls}
        </div>
      )}
    </div>
  </div>
);
