import React from "react";

export class Countdown extends React.Component {
  constructor(props) {
    super(props);
    this.countdown_timeouts = [];
    this.state = { remaining_time: props.time };
  }
  componentDidUpdate() {
    const { remaining_time } = this.state;
    const next_remaining_time = Math.ceil(remaining_time - 1);

    if (remaining_time !== 0) {
      this.countdown_timeouts.push(
        setTimeout(
          () => this.setState({ remaining_time: next_remaining_time }),
          1000
        )
      );
    }
  }
  componentWillUnmount() {
    this.countdown_timeouts.forEach((countdown_timeout) =>
      clearTimeout(countdown_timeout)
    );
  }
  render() {
    return this.state.remaining_time;
  }
}
