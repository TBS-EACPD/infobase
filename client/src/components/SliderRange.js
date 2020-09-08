import "./SliderRange.scss";
import { IconArrowDown } from "../icons/icons.js";

export class SliderRange extends React.Component {
  constructor(props) {
    super(props);
    this.calculatePosition = this.calculatePosition.bind(this);
    this.slider = React.createRef();
    this.slider_label = React.createRef();
  }
  calculatePosition() {
    const range_width = this.slider.current.getBoundingClientRect().width - 15;
    const percent =
      this.slider.current.value / (this.props.slider_data.length - 1);
    this.slider_label.current.style.left = `${range_width * percent}px`;
  }
  sliderInputOnChange(slider_callback) {
    this.calculatePosition();
    slider_callback(this.slider.current.value);
  }
  componentDidMount() {
    this.calculatePosition();
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
        <span className="slider-label" ref={this.slider_label}>
          <span
            style={{
              display: "inline-block",
              width: "100%",
              paddingLeft: "30px",
            }}
          >
            {value_formatter(selected_data_index)}
          </span>
        </span>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingLeft: "20px",
            paddingRight: "20px",
          }}
        >
          {_.map(slider_data, (d, idx) => (
            <span
              style={{
                color: window.infobase_color_constants.backgroundColor,
                opacity: 0.9,
              }}
            >
              {value_formatter(idx)}
            </span>
          ))}
        </div>
        <input
          className="slider"
          type="range"
          min={0}
          max={slider_data.length - 1}
          defaultValue={slider_default_value || slider_data.length - 1}
          step={1}
          ref={this.slider}
          onChange={() => this.sliderInputOnChange(slider_callback)}
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
