import _ from "lodash";
import React from "react";

import { primaryColor, secondaryColor } from "src/core/color_defs.js";

import leaf_loading_spinner from "src/svg/leaf-loading-spinner.svg";
import "./LeafSpinner.scss";

export const LeafSpinner = ({ config_name }) => {
  const default_spinner_config_form = (scale) => ({
    outer_positioning: "default",
    spinner_container_style: {
      transform: `scale(${scale})`,
      position: "fixed",
    },
    svg_modifier: _.identity,
  });

  const leaf_spinner_configs = {
    initial: default_spinner_config_form(2),
    route: default_spinner_config_form(2),
    sub_route: default_spinner_config_form(2),
    tabbed_content: {
      outer_positioning: "default",
      spinner_container_style: {
        transform: `scale(1)`,
        position: "absolute",
        top: "50%",
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
          .replace('fill="#FF0000"', 'fill="#FFF"')
          .replace("faded-background--true", "faded-background--false"),
    },
  };

  const default_config_name = _.chain(leaf_spinner_configs)
    .keys()
    .first()
    .value();

  const {
    outer_positioning,
    spinner_container_style,
    svg_modifier,
  } = leaf_spinner_configs[config_name || default_config_name];

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
