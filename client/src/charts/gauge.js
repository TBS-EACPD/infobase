import "./gauge.scss";
import { Format } from "../components";

export default class Gauge extends React.Component {
  render() {
    const { total_value, value, color } = this.props;
    const gauge_value = value || 0;
    const percentage = gauge_value / total_value;
    return (
      <div>
        <h4 style={{ textAlign: "center" }}>
          {gauge_value} / {total_value}
        </h4>
        <div
          style={{
            backgroundColor:
              color || window.infobase_color_constants.successDarkColor,
          }}
          className="gauge"
        >
          <div
            style={{ transform: `rotate(${percentage * 180}deg)` }}
            className="gauge_percentage"
          ></div>
          <div className="gauge_mask"></div>
          <h2 className="gauge_value">
            <Format type={"percentage"} content={percentage} />
          </h2>
        </div>
      </div>
    );
  }
}
