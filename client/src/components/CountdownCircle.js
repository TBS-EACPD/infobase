import './CountdownCircle.scss';

import { Fragment } from 'react';
import { Countdown } from "./Countdown.js";

const split_value_and_units = (size) => {
  const unit = /[a-z]+$/.exec(size);
  const value = size.replace(unit, "");
  return [value, unit];
};

const get_gradient_id = (circle_id, frame) => `${circle_id}-frame-${frame}`;
const get_gradient_defs = (frame_count, circle_id, color) => {
  const frame_size = 100/frame_count;

  return _.chain()
    .range(frame_count+1)
    .map(
      (frame) => (
        <linearGradient
          key={get_gradient_id(circle_id, frame)}
          id={get_gradient_id(circle_id, frame)}

        >
          <stop offset="0%" style={{stopColor: color, stopOpacity: 0}} />
          <stop offset={`${(frame*frame_size)-1}%`} style={{stopColor: color, stopOpacity: 0}} />
          <stop offset={`${frame*frame_size}%`} style={{stopColor: color, stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: color, stopOpacity: 1}} />
        </linearGradient>
      )
    )
    .value();
};
const get_animation_frames = (frame_count, circle_id) => {
  const frame_size = 100/frame_count;

  return _.chain()
    .range(frame_count+1)
    .reduce(
      (animation_stages, frame) => animation_stages +
        `\n ${frame*frame_size}% { stroke: url(#${get_gradient_id(circle_id, frame)}); }`,
      ""
    )
    .value();
};


export class CountdownCircle extends React.Component {
  constructor(){
    super();
    this.state = { countdown_circle_instance_id: _.uniqueId("countdown-circle-instance-") };
  }
  render(){
    const {
      time, // in ms
      size,
      color,
      stroke_width,
      show_numbers,
      on_end_callback,
    } = this.props;

    const { countdown_circle_instance_id } = this.state;

    const time_in_seconds = time/1000;
    const frame_count = Math.ceil(15*time_in_seconds);

    const [size_value, size_unit] = split_value_and_units(size);
    const circle_position = `${size_value/2}${size_unit}`;
    const circle_radius_value = size_value/2.33;
    const circle_radius = `${circle_radius_value}${size_unit}`;
    const circle_circumference = `${2*Math.PI*circle_radius_value}${size_unit}`;

    return (
      <div 
        className="countdown-circle"
        style={{
          width: size,
          height: size,
        }}
      >
        { show_numbers &&
          <div 
            className="countdown-circle__number"
            style={{lineHeight: size, color}}
          >
            <Countdown time={time_in_seconds} />
          </div>
        }
        <svg 
          className="countdown-circle__display"
          style={show_numbers ? {top: `-${size}`} : {}}
          id={countdown_circle_instance_id}
          onAnimationEnd={on_end_callback}
        >
          { // IE can't animate stroke-dashoffset, this is its fallback
            window.feature_detection.is_IE() &&
            <Fragment>
              <defs>
                {get_gradient_defs(frame_count, countdown_circle_instance_id, color)}
              </defs>
              <style
                dangerouslySetInnerHTML={{__html: `
                  #${countdown_circle_instance_id} {
                    stroke-width: ${stroke_width};
                    animation: ${countdown_circle_instance_id} ${time}ms linear 1 forwards;
                  }
                  @keyframes ${countdown_circle_instance_id} {
                    ${get_animation_frames(frame_count, countdown_circle_instance_id, circle_circumference)}
                  }
                `}} 
              />
            </Fragment>
          }
          { !window.feature_detection.is_IE() &&
            <style 
              dangerouslySetInnerHTML={{__html: `
                #${countdown_circle_instance_id} {
                  stroke-dasharray: ${circle_circumference};
                  stroke: ${color};
                  stroke-width: ${stroke_width};
                  animation: ${countdown_circle_instance_id} ${time}ms linear 1 forwards;
                }
                @keyframes ${countdown_circle_instance_id} {
                  from {
                    stroke-dashoffset: 0px;
                  }
                  to {
                    stroke-dashoffset: ${circle_circumference};
                  }
                }
              `}} 
            />
          }
          <circle
            r={circle_radius}
            cx={circle_position}
            cy={circle_position}
          />
        </svg>
      </div>
    );
  }
}
CountdownCircle.defaultProps = {
  size: "3em",
  color: window.infobase_color_constants.buttonPrimaryColor,
  stroke_width: "2px",
  show_numbers: false,
};