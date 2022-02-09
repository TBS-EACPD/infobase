import _ from "lodash";
import React, { Fragment } from "react";

import { Countdown } from "src/components/Countdown/Countdown";

import { buttonPrimaryColor } from "src/style_constants/index";

import "./CountdownCircle.scss";

const split_value_and_units = (size: string) => {
  const unit = /[a-z]+$/.exec(size);
  if (unit) {
    const unitStr = unit[0];
    const value = size.replace(unitStr, "");
    return [value, unitStr];
  } else {
    return [];
  }
};

const CountdownCircleDefaultProps = {
  size: "3em",
  stroke_width: "2px",
  color: buttonPrimaryColor,
  show_numbers: false,
};

type CountdownCircleProps = typeof CountdownCircleDefaultProps & {
  time: number;
  on_end_callback: () => void;
};

interface CountdownCircleState {
  countdown_circle_instance_id: string;
}

export class CountdownCircle extends React.Component<
  CountdownCircleProps,
  CountdownCircleState
> {
  static defaultProps = CountdownCircleDefaultProps;

  constructor(props: CountdownCircleProps) {
    super(props);
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

    const [size_value, size_unit] = split_value_and_units(size);
    const circle_position = `${+size_value / 2}${size_unit}`;
    const circle_radius_value = +size_value / 2.33;
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
            animation: `${countdown_circle_instance_id} ${time}ms linear 1 forwards`,
          }}
        >
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
        </svg>
      </div>
    );
  }
}
