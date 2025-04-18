import _ from "lodash";
import type { ReactNode } from "react";
import React, { Suspense } from "react";

import { primaryColor, secondaryColor } from "src/style_constants/index";

import { leaf_spinner } from "./leaf_spinner";
import "./LeafSpinner.scss";

interface spinner_config {
  outer_positioning_style: React.CSSProperties;
  spinner_container_style: React.CSSProperties;
}

type spinner_config_names =
  | "route"
  | "subroute"
  | "subroute"
  | "relative_small"
  | "inline_small";

export const spinner_configs: {
  [key in spinner_config_names]: spinner_config;
} = {
  route: {
    outer_positioning_style: {
      position: "initial",
    },
    spinner_container_style: {
      transform: `scale(2)`,
      position: "fixed",
    },
  },
  subroute: {
    outer_positioning_style: {
      position: "relative",
      height: "100%",
      minHeight: "80px",
    },
    spinner_container_style: {
      transform: "scale(1)",
      position: "absolute",
      top: "50%",
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
            ? leaf_spinner
                .replace(`stroke="${primaryColor}"`, 'stroke="#FFF"')
                .replace(`stroke="${secondaryColor}"`, 'stroke="#FFF"')
                .replace('fill="#FF0000"', 'fill="#FFF"')
            : leaf_spinner,
        }}
      />
    </div>
  );
};

export const SuspenseLeafSpinner = ({
  children,
  ...spinnerProps
}: LeafSpinnerProps & { children: ReactNode }) => (
  <Suspense fallback={<LeafSpinner {...spinnerProps} />}> {children}</Suspense>
);
