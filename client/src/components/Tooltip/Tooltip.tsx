import _ from "lodash";
import React from "react";
import ReactTooltip from "react-tooltip";

import { primaryColor } from "src/style_constants/index";

import "./Tooltip.scss";

type TooltipProps = {
  children: React.ReactNode;
  id: string;
  tooltip_position: "fixed" | "follow";
  tooltip_content: React.ReactNode;
  screen_reader_alt: React.ReactNode;
  disable: boolean;
};

export const Tooltip = ({
  children,
  id = _.uniqueId("tooltip"),
  tooltip_position = "fixed",
  tooltip_content,
  disable = false,
}: TooltipProps) => (
  /* eslint-disable jsx-a11y/no-noninteractive-tabindex */
  <React.Fragment>
    <span data-tip data-for={id} tabIndex={0}>
      {children}
      <span className="sr-only">{tooltip_content}</span>
    </span>
    <ReactTooltip
      id={id}
      className="react-tooltip-overrides"
      aria-hidden="true"
      backgroundColor={primaryColor}
      border={true}
      disable={disable}
      /* found effect: solid | float to be mostly confusing for what this does, so effectively renamed in wrapper API*/
      effect={tooltip_position === "fixed" ? "solid" : "float"}
      /* delays to give time for mouse to enter the tooltip, which will hold it open, in case it contains links etc */
      delayHide={250}
      delayUpdate={250}
    >
      {tooltip_content}
    </ReactTooltip>
  </React.Fragment>
);
