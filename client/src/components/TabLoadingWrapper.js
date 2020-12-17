import { SpinnerWrapper } from "./SpinnerWrapper.js";

class TabLoadingWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: null,
    };
  }
  componentDidMount() {
    const { panel_args, load_data } = this.props;

    load_data(panel_args).then((data) =>
      this.setState({
        data,
        loading: false,
      })
    );
  }
  render() {
    const { panel_args, TabContent } = this.props;

    const { loading, data } = this.state;

    if (loading) {
      return (
        <div
          style={{
            position: "relative",
            height: "80px",
            marginBottom: "-10px",
          }}
        >
          <SpinnerWrapper config_name={"tabbed_content"} />
        </div>
      );
    } else {
      return <TabContent panel_args={panel_args} data={data} />;
    }
  }
}

export { TabLoadingWrapper };
