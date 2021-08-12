import type { Property } from "csstype";
import _ from "lodash";
import React from "react";

import style_variables from "src/common_style_variables/common-variables.module.scss";

import leaf_loading_spinner from "./LeafSpinner.svg";
import "./LeafSpinner.scss";

const { primaryColor, secondaryColor } = style_variables;

interface spinner_config {
  outer_positioning: Property.Position;
  spinner_container_style: React.CSSProperties;
  svg_modifier: (svg_string: string) => string;
}

const default_spinner_config_form = (scale: number): spinner_config => ({
  outer_positioning: "initial",
  spinner_container_style: {
    transform: `scale(${scale})`,
    position: "fixed",
  },
  svg_modifier: _.identity,
});

type spinner_config_names =
  | "initial"
  | "route"
  | "sub_route"
  | "tabbed_content"
  | "inline_panel"
  | "small_inline";

export const spinner_configs: {
  [key in spinner_config_names]: spinner_config;
} = {
  initial: default_spinner_config_form(2),
  route: default_spinner_config_form(2),
  sub_route: default_spinner_config_form(2),
  tabbed_content: {
    outer_positioning: "initial",
    spinner_container_style: {
      transform: `scale(1)`,
      position: "absolute",
      top: "50%",
    },
    svg_modifier: _.identity,
  },
  inline_panel: {
    outer_positioning: "relative",
    spinner_container_style: {
      transform: "scale(0.35)",
      position: "absolute",
      top: "8px",
    },
    svg_modifier: _.identity,
  },
  small_inline: {
    outer_positioning: "relative",
    spinner_container_style: {
      transform: "scale(0.25)",
      position: "absolute",
      top: "9px",
      left: "-50%",
    },
    svg_modifier: (svg) =>
      svg
        .replace(`stroke="${primaryColor}"`, 'stroke="#FFF"')
        .replace(`stroke="${secondaryColor}"`, 'stroke="#FFF"')
        .replace('fill="#FF0000"', 'fill="#FFF"'),
  },
};

interface LeafSpinnerProps {
  config_name: spinner_config_names;
}
export const LeafSpinner = ({ config_name }: LeafSpinnerProps) => {
  const default_config_name = _.chain(spinner_configs).keys().first().value();

  const { outer_positioning, spinner_container_style, svg_modifier } =
    spinner_configs[config_name || default_config_name];

  return (
    <div style={{ position: outer_positioning }}>
      <div
        className="leaf-spinner-container"
        style={spinner_container_style}
        dangerouslySetInnerHTML={{ __html: svg_modifier(leaf_loading_spinner) }}
      />
    </div>
  );
};
