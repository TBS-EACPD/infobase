import gql from "graphql-tag";

import { Fragment } from "react";

import { withRouter } from "react-router";

import {
  Panel,
  SpinnerWrapper,
  StatelessModal,
  WriteToClipboard,
  create_text_maker_component,
} from "../../../components/index.js";
import { log_standard_event } from "../../../core/analytics.js";
import { get_client } from "../../../graphql_utils/graphql_utils.js";

import { IconCopyLink } from "../../../icons/icons.js";
import { Indicator } from "../../../models/results.js";

import { IndicatorDisplay } from "./result_components.js";
import { text_maker as general_text_maker } from "./result_text_provider.js";

import text from "./IndicatorModalButton.yaml";

const { text_maker } = create_text_maker_component(text);

const indicators_fields_fragment = `  id
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
`;

const get_indicator_query = gql`
query($lang: String!, $id: String) {
  root(lang: $lang) {
    indicator(id: $id) {
      ${indicators_fields_fragment}
    }
  }
}
`;

const process_indicator = (indicator) => {
  indicator.target_year = _.isNull(indicator.target_year)
    ? null
    : parseInt(indicator.target_year);
  indicator.target_month = _.isNull(indicator.target_month)
    ? null
    : parseInt(indicator.target_month);
  return indicator;
};

const query_api = (id) => {
  const time_at_request = Date.now();
  const client = get_client();
  const query = get_indicator_query;
  return client
    .query({
      query,
      variables: {
        lang: window.lang,
        id,
        _query_name: "results_bundle",
      },
    })
    .then((response) => {
      Indicator.create_and_register(
        process_indicator(response.data.root.indicator)
      );
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

export default class IndicatorModalButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true, show_modal: false };
  }

  componentDidUpdate() {
    const { id } = this.props;
    const { loading, show_modal } = this.state;

    if (loading && show_modal) {
      query_api(id).then(() => this.setState({ loading: false }));
    }
  }

  toggle_modal = () =>
    this.setState((prev_state) => ({
      show_modal: !prev_state.show_modal,
    }));

  render() {
    const { id } = this.props;

    const { loading } = this.state;

    const indicator = Indicator.lookup(id);

    return (
      <Fragment>
        <button
          className="btn-link"
          onClick={this.toggle_modal}
          aria-label={`${text_maker("discover_indicator")} ${indicator.name}`}
        >
          {indicator.name}
        </button>
        <StatelessModal
          show={this.state.show_modal}
          title={general_text_maker("indicator_display_title")}
          body={
            loading ? (
              <SpinnerWrapper ref="spinner" config_name={"sub_route"} />
            ) : (
              <Panel
                title={indicator.name}
                /* the below content will be used once linking to indicators has been added back*/
                // otherHeaderContent={
                //   <div style={{ marginLeft: "auto" }}>
                //     <WriteToClipboard
                //       text_to_copy={modal_link}
                //       button_class_name={"panel-heading-utils"}
                //       button_description={text_maker("copy_indicator_link")}
                //       IconComponent={IconCopyLink}
                //     />
                //   </div>
                // }
              >
                <IndicatorDisplay indicator={indicator} show_doc={true} />
              </Panel>
            )
          }
          on_close_callback={this.toggle_modal}
          additional_dialog_class={"modal-responsive"}
        />
      </Fragment>
    );
  }
}
