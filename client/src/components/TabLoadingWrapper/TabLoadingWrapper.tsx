import React from "react";

import { LeafSpinner } from "src/components/LeafSpinner/LeafSpinner";

import { TabContent } from "./TabContent";

const TabLoadingSpinner = () => (
  <div
    style={{
      position: "relative",
      height: "80px",
      marginBottom: "-10px",
    }}
  >
    <LeafSpinner config_name={"tabbed_content"} />
  </div>
);

type TabLoadingWrapperProps = {
  args: React.ReactNode;
  load_data: (args: React.ReactNode) => Promise<React.ReactNode>;
  TabContent: typeof TabContent;
};

type TabLoadingWrapperState = {
  loading: boolean;
  data: React.ReactNode;
};

class TabLoadingWrapper extends React.Component<
  TabLoadingWrapperProps,
  TabLoadingWrapperState
> {
  constructor(props: TabLoadingWrapperProps) {
    super(props);
    this.state = {
      loading: true,
      data: null,
    };
  }
  componentDidMount() {
    const { args, load_data } = this.props;

    load_data(args).then((data: React.ReactNode) =>
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
      return <TabLoadingSpinner />;
    } else {
      return <TabContent args={args} data={data} />;
    }
  }
}

export { TabLoadingWrapper, TabLoadingSpinner };
