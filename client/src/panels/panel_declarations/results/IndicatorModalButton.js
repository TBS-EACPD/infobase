import gql from "graphql-tag";

import { get_client } from "../../../graphql_utils/graphql_utils.js";
import { log_standard_event } from "../../../core/analytics.js";

import {
  Panel,
  SpinnerWrapper,
  StatelessModal,
  WriteToClipboard,
} from "../../../components/index.js";

import { Indicator } from "../../../models/results.js";

import { IndicatorDisplay } from "./result_components.js";
import { text_maker } from "./result_text_provider.js";
import { Fragment } from "react";
import { withRouter } from "react-router";
import { IconCopyLink } from "../../../icons/icons.js";

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

class IndicatorModalButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true, show_modal: false };

    const {
      location: { search },
      id,
    } = this.props;

    const query = new URLSearchParams(search).get("ind");

    this.buttonRef = query === id ? React.createRef() : null;
  }

  componentDidMount() {
    if (this.buttonRef) {
      this.buttonRef.current.click();
    }
  }

  componentDidUpdate() {
    const { id } = this.props;
    const { loading, show_modal } = this.state;

    if (loading && show_modal) {
      query_api(id).then(() => this.setState({ loading: false }));
    }
  }

  render() {
    const {
      id,
      match: {
        params: { subject_id },
      },
    } = this.props;

    const { loading } = this.state;

    const indicator = Indicator.lookup(id);

    const modal_link = _.replace(
      window.location.href,
      window.location.hash,
      `#orgs/dept/${subject_id}/infograph/results?ind=${id}`
    );

    return (
      <Fragment>
        <button
          ref={this.buttonRef}
          className="btn-link"
          onClick={() => this.setState({ show_modal: true })}
          aria-label={`Discover more about ${indicator.name}`}
        >
          {indicator.name}
        </button>
        <StatelessModal
          show={this.state.show_modal}
          title={text_maker("indicator_display_title")}
          body={
            loading ? (
              <SpinnerWrapper ref="spinner" config_name={"sub_route"} />
            ) : (
              <Panel
                title={indicator.name}
                otherHeaderContent={
                  <div style={{ marginLeft: "auto" }}>
                    <WriteToClipboard
                      text_to_copy={modal_link}
                      button_class_name={"panel-heading-utils"}
                      button_description={"test"}
                      IconComponent={IconCopyLink}
                    />
                  </div>
                }
              >
                <IndicatorDisplay indicator={indicator} show_doc={true} />
              </Panel>
            )
          }
          on_close_callback={() => this.setState({ show_modal: false })}
          additional_dialog_class={"modal-responsive"}
        />
      </Fragment>
    );
  }
}

export default withRouter(IndicatorModalButton);
