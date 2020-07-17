import "./progressGauge.scss";
import { successDarkColor, highlightDark } from "../core/color_defs";
import { Format } from "../components";

export default class ProgressGauge extends React.Component {
  render() {
    const { value, total_value, finished_color, remaining_color } = this.props;
    const percentage = value / total_value;
    console.log(value, total_value);

    const progress = _.times(total_value, (i) => {
      if (i < value) {
        return (
          <div
            key={i}
            className="progress-circle"
            style={{
              backgroundColor: finished_color || successDarkColor,
            }}
          >
            <p />
          </div>
        );
      } else {
        return (
          <div
            key={i}
            className="progress-circle"
            style={{
              backgroundColor: remaining_color || highlightDark,
            }}
          />
        );
      }
    });

    return (
      <div>
        <h4 style={{ textAlign: "center" }}>
          {value} / {total_value}
        </h4>
        <div>{progress}</div>
        <h2 style={{ textAlign: "center", margin: "0" }}>
          <Format type={"percentage"} content={percentage} />
        </h2>
      </div>
    );
  }
}
