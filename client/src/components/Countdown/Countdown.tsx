import React from "react";

interface CountdownProps {
  time: number;
}

interface CountdownState {
  remaining_time: number;
}

export class Countdown extends React.Component<CountdownProps, CountdownState> {
  countdown_timeouts: ReturnType<typeof setTimeout>[];

  constructor(props: CountdownProps) {
    super(props);
    this.countdown_timeouts = [];
    this.state = { remaining_time: props.time };
  }
  componentDidMount() {
    this.reduceTime();
  }
  componentDidUpdate() {
    this.reduceTime();
  }
  componentWillUnmount() {
    this.countdown_timeouts.forEach((countdown_timeout) =>
      clearTimeout(countdown_timeout)
    );
  }

  reduceTime() {
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

  render() {
    return this.state.remaining_time;
  }
}
