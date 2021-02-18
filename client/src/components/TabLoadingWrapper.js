import React from "react";

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
    const { args, load_data } = this.props;

    load_data(args).then((data) =>
      this.setState({
        data,
        loading: false,
      })
    );
  }
  render() {
    const { args, TabContent } = this.props;

    const { loading, data } = this.state;

    if (loading) {
      return <SpinnerWrapper config_name={"tabbed_content"} />;
    } else {
      return <TabContent args={args} data={data} />;
    }
  }
}

export { TabLoadingWrapper };
