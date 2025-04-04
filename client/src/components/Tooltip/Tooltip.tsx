import _ from "lodash";
import React from "react";
import ReactTooltip from "react-tooltip";

import { primaryColor } from "src/style_constants/index";

import "./Tooltip.scss";

type TooltipProps = {
  children: React.ReactNode;
  tooltip_content: React.ReactNode;
  tooltip_id?: string;
  tooltip_position?: "fixed" | "follow";
};

export const Tooltip = ({
  children,
  tooltip_id = _.uniqueId("tooltip"),
  tooltip_position = "fixed",
  tooltip_content,
}: TooltipProps) => (
  /* eslint-disable jsx-a11y/no-noninteractive-tabindex */
  <React.Fragment>
    <span data-tip data-for={tooltip_id} tabIndex={0}>
      {children}
      <span className="sr-only">{tooltip_content}</span>
    </span>
    <ReactTooltip
      id={tooltip_id}
      className="react-tooltip-overrides"
      aria-hidden="true"
      backgroundColor={primaryColor}
      border={true}
      /* found `effect: "solid" | "float"` to be confusing naming for the positioning behaviour, just renaming it effectively*/
      effect={tooltip_position === "fixed" ? "solid" : "float"}
      /* delays to give time for mouse to enter the tooltip, which will hold it open, in case it contains links etc */
      delayHide={250}
      delayUpdate={250}
    >
      {tooltip_content}
    </ReactTooltip>
  </React.Fragment>
);
