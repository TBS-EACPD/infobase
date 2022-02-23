import { gql } from "@apollo/client";

import React from "react";

import {
  Panel,
  LeafSpinner,
  WriteToClipboard,
  create_text_maker_component,
} from "src/components/index";

import { Indicator } from "src/models/results";

import { log_standard_event } from "src/core/analytics";
import { lang } from "src/core/injected_build_constants";

import { get_client } from "src/graphql_utils/graphql_utils";

import { IconCopyLink } from "src/icons/icons";
import { infographic_href_template } from "src/infographic/infographic_href_template";

import { IndicatorDisplay } from "./result_components";

import text from "./IndicatorDisplayPanel.yaml";

const { text_maker } = create_text_maker_component(text);

const get_indicator_query = gql`
  query ($lang: String!, $id: String) {
    root(lang: $lang) {
      indicator(id: $id) {
        id
        stable_id
        result_id
        name
        doc

        target_year
        target_month

        target_type
        target_min
        target_max
        target_narrative
        measure
        seeking_to

        previous_year_target_type
        previous_year_target_min
        previous_year_target_max
        previous_year_target_narrative
        previous_year_measure
        previous_year_seeking_to

        target_explanation
        result_explanation

        actual_result

        status_key

        methodology
      }
    }
  }
`;

const query_api = (id) => {
  const time_at_request = Date.now();
  const client = get_client();
  const query = get_indicator_query;
  return client
    .query({
      query,
      variables: {
        lang: lang,
        id,
        _query_name: "single_indicator_query",
      },
    })
    .then((response) => {
      Indicator.create_and_register(response.data.root.indicator);
      return Promise.resolve();
    })
    .catch(function (error) {
      const resp_time = Date.now() - time_at_request;
      log_standard_event({
        SUBAPP: window.location.hash.replace("#", ""),
        MISC1: "API_QUERY_FAILURE",
        MISC2: `Single indicator, took  ${resp_time} ms - ${error.toString()}`,
      });
      throw error;
    });
};

export default class IndicatorDisplayPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true };
  }
  componentDidMount() {
    query_api(this.props.id).then(() => this.setState({ loading: false }));
  }

  componentDidUpdate() {
    const { id } = this.props;
    const { loading } = this.state;

    if (loading) {
      query_api(id).then(() => this.setState({ loading: false }));
    }
  }

  render() {
    if (this.state.loading) {
      return <LeafSpinner config_name={"subroute"} />;
    }

    const { id, subject } = this.props;

    const indicator = Indicator.lookup(id);

    const panel_link = window.location.href.replace(
      window.location.hash,
      infographic_href_template(subject, "results", {
        indicator: id,
      })
    );

    return (
      <Panel
        title={indicator.name}
        otherHeaderContent={
          <div style={{ marginLeft: "auto" }}>
            <WriteToClipboard
              text_to_copy={panel_link}
              button_class_name={"panel-heading-utils"}
              button_description={text_maker("copy_indicator_link")}
              IconComponent={IconCopyLink}
            />
          </div>
        }
      >
        <IndicatorDisplay indicator={indicator} show_doc={true} />
      </Panel>
    );
  }
}
