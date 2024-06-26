import classNames from "classnames";
import _ from "lodash";
import React from "react";

import "./AlertBanner.scss";

interface AlertBannerProps {
  children?: React.ReactNode;
  banner_class?: string;
  additional_class_names?: string;
  style?: React.CSSProperties;
}

export const banner_classes = ["info", "success", "warning", "danger"];

export const AlertBanner = ({
  children,
  banner_class = "info",
  additional_class_names,
  style,
}: AlertBannerProps) => {
  if (banner_class && !_.includes(banner_classes, banner_class)) {
    throw new Error(
      `AlertBanner received invalid banner_class prop of ${banner_class}`
    );
  }

  const banner_class_name = `alert-${banner_class}`;

  return (
    <div
      className={classNames(
        "ib-alert alert alert-no-symbol alert--is-bordered",
        banner_class_name,
        additional_class_names
      )}
      style={style}
    >
      {children}
    </div>
  );
};
