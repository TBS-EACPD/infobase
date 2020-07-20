import "./progressGauge.scss";
import { successDarkColor } from "../core/color_defs";
import { Format } from "../components";

export default class ProgressGauge extends React.Component {
  render() {
    const { value, total_value, circle_color } = this.props;
    const percentage = value / total_value;

    const progress_gauge = _.times(total_value, (i) => {
      const filled_circle_style = {
        background: circle_color || successDarkColor,
      };
      const empty_circle_style = {
        border: "2px solid",
      };
      return (
        <span
          key={i}
          className="progress-circle"
          style={i < value ? filled_circle_style : empty_circle_style}
        />
      );
    });

    return (
      <div>
        <h4 style={{ textAlign: "center" }}>
          {value} / {total_value}
        </h4>
        <div>{progress_gauge}</div>
        <h2 style={{ textAlign: "center", margin: "0" }}>
          <Format type={"percentage"} content={percentage} />
        </h2>
      </div>
    );
  }
}
