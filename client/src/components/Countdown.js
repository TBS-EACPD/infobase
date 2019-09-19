export class Countdown extends React.Component {
  constructor(props){
    super(props);
    this.state = { remaining_time: props.time };
  }
  componentDidUpdate(){
    const { remaining_time } = this.state;
    const next_remaining_time = Math.ceil(remaining_time-1);

    if (remaining_time !== 0){
      this.countdown_timer = setTimeout(
        () => this.setState({ remaining_time: next_remaining_time }),
        1000
      );
    }
  }
  componentWillUnmount(){
    this.countdown_timer && clearTimeout(this.countdown_timer);
  }
  render(){
    return this.state.remaining_time;
  }
}