import { gql } from "@apollo/client";

import React from "react";

import { IndicatorDisplay } from "src/panels/panel_declarations/results/result_components";

import {
  Panel,
  LeafSpinner,
  WriteToClipboard,
  create_text_maker_component,
} from "src/components/index";

import { Indicator } from "src/models/results";

import { indicator_query_fragment } from "src/models/results/populate_results";

import { log_standard_event } from "src/core/analytics";
import { lang } from "src/core/injected_build_constants";

import { get_client } from "src/graphql_utils/graphql_utils";

import { IconCopyLink } from "src/icons/icons";
import { infographic_href_template } from "src/infographic/infographic_href_template";

import text from "./IndicatorDisplayPanel.yaml";

const { text_maker } = create_text_maker_component(text);

const single_indicator_query = (id) => {
  const time_at_request = Date.now();
  const client = get_client();
  return client
    .query({
      query: gql`
        query ($lang: String!, $id: String) {
          root(lang: $lang) {
            indicator(id: $id) {
              ${indicator_query_fragment}
            }
          }
        }
      `,
      variables: {
        lang: lang,
        id,
        _query_name: "single_indicator_query",
      },
    })
    .then((response) =>
      Indicator.create_and_register(response.data.root.indicator)
    )
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
    const { id } = this.props;
    if (Indicator.lookup(id)) {
      this.setState({ loading: false });
    } else {
      single_indicator_query(id).then(() => this.setState({ loading: false }));
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
