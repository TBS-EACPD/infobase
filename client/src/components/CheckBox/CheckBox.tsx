import classNames from "classnames";
import _ from "lodash";
import React from "react";

import { backgroundColor, primaryColor } from "src/core/color_defs";
import { is_a11y_mode } from "src/core/injected_build_constants";

import { IconCheckmark } from "src/icons/icons";

import "./CheckBox.scss";

export type CheckBoxProps = typeof CheckBox.defaultProps & {
  disabled?: boolean;
  onClick?: (id: string) => void;
  id: string;
  label: string;
  active?: boolean;
  color?: string;
  isSolidBox?: boolean;
  container_style?: React.CSSProperties;
  checkbox_style?: React.CSSProperties;
  label_style?: React.CSSProperties;
  checkmark_vertical_align?: number;
};

const defaultProps = {
  isSolidBox: false,
  color: primaryColor,
  checkmark_vertical_align: 0.1,
};
export class CheckBox extends React.Component<CheckBoxProps> {
  static defaultProps = defaultProps;
  handleOnClick = () => {
    const { disabled, onClick, id } = this.props;
    if (!disabled && onClick) {
      onClick(id);
    }
  };
  render() {
    const {
      id,
      label,
      active,
      onClick,
      color,
      isSolidBox,
      container_style,
      checkbox_style,
      label_style,
      checkmark_vertical_align,
      disabled,
    } = this.props;
    if (!isSolidBox && (_.isUndefined(active) || !onClick)) {
      throw new Error("Non solid CheckBox requires 'active', 'onClick'");
    }

    if (is_a11y_mode) {
      return (
        <div className="checkbox">
          <label>
            <input
              type="checkbox"
              checked={active}
              onChange={this.handleOnClick}
              style={{ marginRight: 5 }}
            />
            {label}
          </label>
        </div>
      );
    } else {
      return (
        <div
          style={{
            display: "flex",
            pointerEvents: disabled ? "none" : undefined,
            opacity: disabled ? 0.4 : undefined,
            ...container_style,
          }}
        >
          <span
            aria-hidden={true}
            style={{
              border: `1px solid ${color}`,
              backgroundColor: !onClick || active ? color : "transparent",
              ...checkbox_style,
            }}
            className={classNames(
              "checkbox-span",
              onClick && "checkbox-span--interactive"
            )}
            onClick={this.handleOnClick}
          >
            {!isSolidBox && (
              <IconCheckmark
                color={backgroundColor}
                width={10}
                height={10}
                svg_style={{ verticalAlign: checkmark_vertical_align }}
              />
            )}
          </span>
          {onClick ? (
            <span
              style={label_style}
              role="checkbox"
              aria-checked={active}
              tabIndex={0}
              className="link-styled"
              onClick={this.handleOnClick}
              onKeyDown={(e) =>
                (e.keyCode === 13 || e.keyCode === 32) &&
                !disabled &&
                onClick(id)
              }
            >
              {label}
            </span>
          ) : (
            <span style={label_style}>{label}</span>
          )}
        </div>
      );
    }
  }
}
