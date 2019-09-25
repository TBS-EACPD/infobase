import './CountdownCircle.scss';

import { Countdown } from "./Countdown.js";


const get_animation_steps = (step_count, backgroundColor, color) => {
  const step_size = 100/step_count;
  const degrees_per_step = 360/step_count;

  return _.chain()
    .range(step_count-1)
    .map(step_minus_1 => step_minus_1+1)
    .reduce(
      (animation_stages, step) => animation_stages +
        `\n ${step*step_size}% { background: conic-gradient(from 0deg at 50% 50%, ${backgroundColor} 0deg ${step*degrees_per_step}deg, ${color} ${step*degrees_per_step}deg 360deg); }`,
      `0% { background: conic-gradient(from 0deg at 50% 50%, ${backgroundColor} 0deg 0deg, ${color} 0deg 360deg); }`
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
      backgroundColor,
      show_numbers,
      on_end_callback,
    } = this.props;

    const { countdown_circle_instance_id } = this.state;

    const time_in_seconds = time/1000;

    return (
      <div 
        className="countdown-circle"
        style={{
          width: size,
          height: size,
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes ${countdown_circle_instance_id} {${get_animation_steps(60*time_in_seconds, backgroundColor, color)}}
        `}}
        />
        <div 
          id={countdown_circle_instance_id}
          className="countdown-circle__sweep"
          style={{animation: `${countdown_circle_instance_id} ${time}ms linear 1 forwards`}}
          onAnimationEnd={on_end_callback}
        >
          <div 
            className="countdown-circle__hole"
            style={{backgroundColor}}
          />
          { show_numbers &&
            <div 
              className="countdown-circle__number"
              style={{lineHeight: size, color}}
            >
              <Countdown time={time_in_seconds} />
            </div>
          }
        </div>
      </div>
    );
  }
}
CountdownCircle.defaultProps = {
  size: "3em",
  color: window.infobase_color_constants.buttonPrimaryColor,
  backgroundColor: window.infobase_color_constants.backgroundColor,
  show_numbers: false,
};