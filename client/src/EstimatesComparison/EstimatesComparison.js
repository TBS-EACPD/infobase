import React from "react";

import { SpinnerWrapper } from "../components/index.js";
import { ensure_loaded } from "../core/lazy_loader.js";
import { StandardRouteContainer } from "../core/NavComponents";

import { EstimatesExplorer } from "./scheme.js";
import { text_maker, TM } from "./utils.js";

import "./EstimatesComparison.scss";

export default class EstimatesComparison extends React.Component {
  constructor(props) {
    super(props);

    const {
      match: {
        params: { h7y_layout },
      },
    } = props;

    this.explorer_instance = new EstimatesExplorer(h7y_layout);
    this.state = { loading: true };
  }
  componentDidMount() {
    ensure_loaded({
      table_keys: ["orgVoteStatEstimates"],
      footnotes_for: "estimates",
    }).then(() => {
      this.setState({ loading: false });
    });
  }
  componentDidUpdate(prevProps) {
    const old_h7y_layout = prevProps.match.params.h7y_layout;
    const h7y_layout = this.props.match.params.h7y_layout;
    if (old_h7y_layout !== h7y_layout) {
      this.explorer_instance.set_h7y_layout(h7y_layout);
    }
  }
  render() {
    const { history } = this.props;

    const title = text_maker("diff_view_title");

    let content;
    if (this.state.loading) {
      content = <SpinnerWrapper config_name={"sub_route"} />;
    } else {
      content = this.explorer_instance.to_react_element({ history });
    }

    return (
      <StandardRouteContainer
        title={title}
        breadcrumbs={[title]}
        description={text_maker("estimates_comparison_desc_meta_attr")}
        route_key="_dev"
      >
        <h1>
          <TM k="diff_view_title" />
        </h1>
        {content}
      </StandardRouteContainer>
    );
  }
}
