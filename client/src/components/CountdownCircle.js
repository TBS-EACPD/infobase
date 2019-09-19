import './CountdownCircle.scss';

const split_value_and_units = (size) => {
  const unit = /[a-z]+$/.exec(size);
  const value = size.replace(unit, "");
  return [value, unit];
};

export class CountdownCircle extends React.Component {
  constructor(){
    super();
    this.state = { countdown_circle_instance_id: _.uniqueId("countdown-circle-instance-") };
  }
  render(){
    const {
      time,
      size,
      color,
    } = this.props;

    const { countdown_circle_instance_id } = this.state;

    const time_in_seconds = time/1000;

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
        <div 
          className="countdown-circle__number"
          style={{lineHeight: size, color}}
        >
        </div>
        <svg className="countdown-circle__display">
          <style 
            dangerouslySetInnerHTML={{__html: `
              #${countdown_circle_instance_id} {
                stroke-dasharray: ${circle_circumference};
                stroke: ${color};
                animation: ${countdown_circle_instance_id} ${time_in_seconds}s linear infinite forwards;
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
          <circle
            id={countdown_circle_instance_id}
            r={circle_radius}
            cx={circle_position}
            cy={circle_position}
          />
        </svg>
      </div>
    );
  }
}