import _ from "lodash";
import React from "react";

import { primaryColor, secondaryColor } from "src/style_constants/index";

import leaf_loading_spinner from "./LeafSpinner.svg";
import "./LeafSpinner.scss";

interface spinner_config {
  outer_positioning_style: React.CSSProperties;
  spinner_container_style: React.CSSProperties;
}

const default_spinner_config_form = (scale: number): spinner_config => ({
  outer_positioning_style: {
    position: "initial",
  },
  spinner_container_style: {
    transform: `scale(${scale})`,
    position: "fixed",
  },
});

type spinner_config_names =
  | "initial"
  | "route"
  | "sub_route"
  | "tabbed_content"
  | "relative_panel"
  | "relative_small"
  | "inline_small";

export const spinner_configs: {
  [key in spinner_config_names]: spinner_config;
} = {
  initial: default_spinner_config_form(2),
  route: default_spinner_config_form(2),
  sub_route: default_spinner_config_form(2),
  tabbed_content: {
    outer_positioning_style: {
      position: "initial",
    },
    spinner_container_style: {
      transform: `scale(1)`,
      position: "absolute",
      top: "50%",
    },
  },
  relative_panel: {
    outer_positioning_style: {
      position: "relative",
    },
    spinner_container_style: {
      transform: "scale(0.35)",
      position: "absolute",
      top: "8px",
    },
  },
  relative_small: {
    outer_positioning_style: {
      position: "relative",
    },
    spinner_container_style: {
      transform: "scale(0.25)",
      position: "absolute",
      top: "9px",
      left: "-50%",
    },
  },
  inline_small: {
    outer_positioning_style: {
      position: "relative",
      display: "inline-block",
      height: "1rem",
      width: "35px",
    },
    spinner_container_style: {
      transform: "scale(0.35)",
      position: "absolute",
    },
  },
};

interface LeafSpinnerProps {
  config_name: spinner_config_names;
  use_light_colors?: boolean;
}
export const LeafSpinner = ({
  config_name,
  use_light_colors = false,
}: LeafSpinnerProps) => {
  const default_config_name = _.chain(spinner_configs).keys().first().value();

  const { outer_positioning_style, spinner_container_style } =
    spinner_configs[config_name || default_config_name];

  return (
    <div style={outer_positioning_style}>
      <div
        className="leaf-spinner-container"
        style={spinner_container_style}
        dangerouslySetInnerHTML={{
          __html: use_light_colors
            ? leaf_loading_spinner
                .replace(`stroke="${primaryColor}"`, 'stroke="#FFF"')
                .replace(`stroke="${secondaryColor}"`, 'stroke="#FFF"')
                .replace('fill="#FF0000"', 'fill="#FFF"')
            : leaf_loading_spinner,
        }}
      />
    </div>
  );
};
