import _ from "lodash";
import React, { Fragment } from "react";

import { buttonPrimaryColor } from "src/core/color_defs.js";

import { is_IE } from "src/core/feature_detection.js";

import { Countdown } from "./Countdown";
import "./CountdownCircle.scss";

const split_value_and_units = (size) => {
  const unit = /[a-z]+$/.exec(size);
  const value = size.replace(unit, "");
  return [value, unit];
};

export class CountdownCircle extends React.Component {
  constructor() {
    super();
    this.state = {
      countdown_circle_instance_id: _.uniqueId("countdown-circle-instance-"),
    };
  }
  render() {
    const {
      time, // in ms
      size,
      color,
      stroke_width,
      show_numbers,
      on_end_callback,
    } = this.props;

    const { countdown_circle_instance_id } = this.state;

    const time_in_seconds = time / 1000;

    const [stroke_value, stroke_unit] = split_value_and_units(stroke_width);

    const [size_value, size_unit] = split_value_and_units(size);
    const circle_position = `${size_value / 2}${size_unit}`;
    const circle_radius_value = size_value / 2.33;
    const circle_radius = `${circle_radius_value}${size_unit}`;
    const circle_circumference = `${
      2 * Math.PI * circle_radius_value
    }${size_unit}`;

    return (
      <div
        className="countdown-circle"
        style={{
          width: size,
          height: size,
        }}
      >
        {show_numbers && (
          <div
            className="countdown-circle__number"
            style={{ lineHeight: size, color }}
          >
            <Countdown time={time_in_seconds} />
          </div>
        )}
        <svg
          className={"countdown-circle__display"}
          onAnimationEnd={on_end_callback}
          style={{
            ...(show_numbers ? { top: `-${size}` } : {}),
            strokeDasharray: circle_circumference,
            stroke: color,
            strokeWidth: stroke_width,
            animation: `${
              !is_IE()
                ? countdown_circle_instance_id
                : "countdown-circle-animation-ie-fallback"
            } ${time}ms linear 1 forwards`,
          }}
        >
          {!is_IE() && (
            <Fragment>
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                  @keyframes ${countdown_circle_instance_id} {
                    from {
                      stroke-dashoffset: 0px;
                    }
                    to {
                      stroke-dashoffset: ${circle_circumference};
                    }
                  }
                `,
                }}
              />
              <circle
                r={circle_radius}
                cx={circle_position}
                cy={circle_position}
              />
            </Fragment>
          )}
          {is_IE() && (
            <circle
              r={stroke_width}
              cx={circle_position}
              cy={`${2 * stroke_value}${stroke_unit}`}
              fill={color}
            />
          )}
        </svg>
      </div>
    );
  }
}
CountdownCircle.defaultProps = {
  size: "3em",
  color: buttonPrimaryColor,
  stroke_width: "2px",
  show_numbers: false,
};
