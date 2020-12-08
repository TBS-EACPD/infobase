import { select } from "d3-selection";
import _ from "lodash";
import React from "react";
import ReactDOM from "react-dom";

import { SpinnerWrapper, ContainerEscapeHatch } from "src/components/index.js";

import { ensure_loaded } from "src/core/ensure_loaded.js";
import { StandardRouteContainer } from "src/core/NavComponents.js";

import { text_maker } from "./partition_text_provider.js";
import { PartitionSubApp } from "./PartitionSubApp.js";
import {
  get_all_perspectives,
  all_data_types,
  remapped_data_types,
} from "./perspectives/index.js";

export default class PartitionRoute extends React.Component {
  constructor() {
    super();
    this.state = { loading: true };
    this.url_update_callback = (perspective, data_type) => {
      const new_path = `partition/${perspective}/${data_type}`;

      if (this.props.history.location.pathname !== "/" + new_path) {
        this.props.history.push("/" + new_path);

        const el_to_update = document.querySelector("#wb-lng a");
        const link = _.first(el_to_update.href.split("#"));
        if (link) {
          el_to_update.href = `${link}#${new_path}`;
        }
      }
    };
  }
  componentDidMount() {
    ensure_loaded({
      table_keys: [
        "programSpending",
        "orgVoteStatEstimates",
        "programFtes",
        "programSobjs",
      ],
    }).then(() => {
      this.all_perspectives = get_all_perspectives();
      this.setState({ loading: false });
    });
  }
  shouldComponentUpdate(nextProps) {
    if (!_.isUndefined(this.partition)) {
      // Once the Partition diagram has been initialized, need to ensure it stays in sync whenever the path updates
      const { perspective, data_type } = this.getValidatedRouteParams(
        nextProps
      );

      this.ensurePartitionStateMatchesRouteState(perspective, data_type);
    }

    // Should only need to update once, when the table dependencies finish loading and the spinner needs to be killed
    return !_.isUndefined(this.refs.spinner);
  }
  componentDidUpdate() {
    // Should only happen once, when the table dependencies finish loading and the spinner has been killed
    const { perspective, data_type } = this.getValidatedRouteParams(this.props);
    this.container = select(ReactDOM.findDOMNode(this.refs.container));
    this.partition = new PartitionSubApp(
      this.container,
      this.all_perspectives,
      all_data_types,
      perspective,
      data_type,
      this.url_update_callback
    );
  }
  render() {
    return (
      <StandardRouteContainer
        title={text_maker("partition_title")}
        description={text_maker("partition_desc_meta_attr")}
        breadcrumbs={[text_maker("partition_title")]}
        route_key="partition"
        non_a11y_route={true}
      >
        <h1 className="sr-only">{text_maker("partition_title")}</h1>
        <ContainerEscapeHatch>
          {this.state.loading && (
            <SpinnerWrapper ref="spinner" config_name={"route"} />
          )}
          <div className="partition-container" ref="container" />
        </ContainerEscapeHatch>
      </StandardRouteContainer>
    );
  }
  getValidatedRouteParams(props) {
    const route_perspective = props.match.params.perspective;
    const route_data_type =
      remapped_data_types[props.match.params.data_type] ||
      props.match.params.data_type;

    const route_data_type_and_perspective_combination_is_valid = !_.chain(
      this.all_perspectives
    )
      .filter(
        (perspective) =>
          perspective.data_type === route_data_type &&
          perspective.id === route_perspective
      )
      .isEmpty()
      .value();

    if (route_data_type_and_perspective_combination_is_valid) {
      return {
        perspective: route_perspective,
        data_type: route_data_type,
      };
    } else {
      return {
        perspective: "dept",
        data_type: "exp",
      };
    }
  }
  ensurePartitionStateMatchesRouteState(route_perspective, route_data_type) {
    const partition_perspective = this.partition.current_perspective_id;
    const partition_data_type = this.partition.current_data_type;

    if (
      route_perspective !== partition_perspective &&
      route_data_type === partition_data_type
    ) {
      this.partition.current_perspective_id = route_perspective;

      this.container
        .select(".select_perspective")
        .property("value", route_perspective)
        .dispatch("change");
    } else if (route_data_type !== partition_data_type) {
      this.partition.current_perspective_id = route_perspective;
      this.partition.current_data_type = route_data_type;

      this.container
        .select(".select_data_type")
        .property("value", route_data_type)
        .dispatch("change");
    }
  }
}
