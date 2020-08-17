import "./SliderRange.scss";

export class SliderRange extends React.Component {
  componentDidMount() {
    const rangeBullet = document.getElementsByClassName("slider-label")[0];
    const slider = document.getElementsByClassName("slider")[0];
    const range_width = slider.getBoundingClientRect().width - 15;
    const percent = slider.value / (this.props.slider_data.length - 1);

    // the position of the output
    const newPosition = range_width * percent;
    rangeBullet.style.left = `${newPosition}px`;
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
          {value_formatter(selected_data_index)}
        </span>
        <input
          className="slider"
          type="range"
          min={0}
          max={slider_data.length - 1}
          defaultValue={slider_default_value || slider_data.length - 1}
          step={1}
          onChange={(e) => {
            const rangeBullet = document.getElementsByClassName(
              "slider-label"
            )[0];
            const range_width =
              e.currentTarget.getBoundingClientRect().width - 15;
            const percent = e.target.value / (slider_data.length - 1);

            // the position of the output
            const newPosition = range_width * percent;
            rangeBullet.style.left = `${newPosition}px`;

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
