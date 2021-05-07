import classNames from "classnames";
import _ from "lodash";
import React from "react";

import "./AlertBanner.scss";

const banner_classes = ["info", "success", "warning", "danger"];
export const AlertBanner = ({
  children,
  banner_class,
  additional_class_names,
  style,
}) => {
  if (banner_class && !_.includes(banner_classes, banner_class)) {
    throw new Error(
      `AlertBanner received invalid banner_class prop of ${banner_class}`
    );
  }

  const banner_class_name = `alert-${banner_class || "info"}`;

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
