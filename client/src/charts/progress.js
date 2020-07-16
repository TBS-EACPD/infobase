import "./progress.scss";
import { successDarkColor, highlightDark } from "../core/color_defs";
import { Format } from "../components";

export default class Progress extends React.Component {
  render() {
    const { value, total_value, finished_color, remaining_color } = this.props;
    const percentage = value / total_value;

    const progress = (() => {
      const circles = [];
      for (let i = 0; i < total_value; i++) {
        if (i < value) {
          circles.push(
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
          circles.push(
            <div
              key={i}
              className="progress-circle"
              style={{
                backgroundColor: remaining_color || highlightDark,
              }}
            />
          );
        }
      }
      return circles;
    })();

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
