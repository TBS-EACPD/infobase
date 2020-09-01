import "./SliderRange.scss";
import { IconArrowDown } from "../icons/icons.js";

export class SliderRange extends React.Component {
  constructor(props) {
    super(props);
    this.calculatePosition = this.calculatePosition.bind(this);
  }
  calculatePosition(slider, slider_label) {
    const range_width = slider.getBoundingClientRect().width - 15;
    const percent = slider.value / (this.props.slider_data.length - 1);
    slider_label.style.left = `${range_width * percent}px`;
  }
  componentDidMount() {
    const slider_label = document.getElementsByClassName("slider-label")[0];
    const slider = document.getElementsByClassName("slider")[0];

    this.calculatePosition(slider, slider_label);
  }
  render() {
    const {
      slider_data,
      slider_default_value,
      value_formatter,
      slider_callback,
      selected_data_index,
    } = this.props;

    return (
      <div className="slider-container">
        <span className="slider-label">
          <span
            style={{
              display: "inline-block",
              width: "100%",
              paddingLeft: "30px",
            }}
          >
            {value_formatter(selected_data_index)}
          </span>
          <IconArrowDown
            color={window.infobase_color_constants.secondaryColor}
            alternate_color={false}
            width={2}
            height={2}
            vertical_align={8}
          />
        </span>
        <input
          className="slider"
          type="range"
          min={0}
          max={slider_data.length - 1}
          defaultValue={slider_default_value || slider_data.length - 1}
          step={1}
          onChange={(e) => {
            const slider_label = document.getElementsByClassName(
              "slider-label"
            )[0];
            this.calculatePosition(e.target, slider_label);

            slider_callback(e.target.value);
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "10px",
          }}
        >
          <span>{value_formatter(0)}</span>
          <span>{value_formatter(slider_data.length - 1)}</span>
        </div>
      </div>
    );
  }
}
