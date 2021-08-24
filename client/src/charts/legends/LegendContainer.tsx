import React from "react";

import { tertiaryColor } from "src/style_constants/index";

export interface LegendContainerProps {
  title: string;
  legend_footer: React.ReactNode;
  children: React.ReactNode;
}

export const LegendContainer = ({
  title,
  legend_footer,
  children,
}: LegendContainerProps) => (
  <div className="standard-legend-container">
    <div
      style={{ maxHeight: "400px", display: "flex", flexDirection: "column" }}
    >
      {title && (
        <p className="mrgn-bttm-0 mrgn-tp-0 standard-legend-container__title centerer">
          {title}
        </p>
      )}
      {/* have to hard code max height since overflow on IE is bugged */}
      <div
        style={{
          overflowX: "hidden",
          maxHeight: "351px",
          msOverflowStyle: "-ms-autohiding-scrollbar",
        }}
      >
        {children}
      </div>
      {legend_footer && (
        <div
          style={{
            borderTop: `1px dashed ${tertiaryColor}`,
            padding: "10px 0px 10px 5px",
          }}
        >
          {legend_footer}
        </div>
      )}
    </div>
  </div>
);
