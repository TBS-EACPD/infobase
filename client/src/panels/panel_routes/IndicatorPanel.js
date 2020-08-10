import gql from "graphql-tag";

import { get_client } from "../../graphql_utils/graphql_utils.js";
import { log_standard_event } from "../../core/analytics.js";
import { StandardRouteContainer } from "../../core/NavComponents.js";

import { Panel, SpinnerWrapper } from "../../components/index.js";

import { Indicator } from "../../models/results.js";
import { Subject } from "../../models/subject";
import { infograph_href_template } from "../../link_utils.js";

import { IndicatorDisplay } from "../panel_declarations/results/result_components.js";
import {
  TM,
  text_maker,
} from "../panel_declarations/results/result_text_provider.js";

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
        SUBAPP: _.replace(window.location.hash, "#", ""),
        MISC1: "API_QUERY_FAILURE",
        MISC2: `Single indicator, took  ${resp_time} ms - ${error.toString()}`,
      });
      throw error;
    });
};

export default class IndicatorPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true };
  }

  componentDidMount() {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    query_api(id).then(() => this.setState({ loading: false }));
  }

  render() {
    const {
      match: {
        params: { org_id, id },
      },
    } = this.props;

    const { loading } = this.state;

    const subject = Subject.Dept.lookup(org_id);
    const indicator = Indicator.lookup(id);

    return (
      <StandardRouteContainer
        title={text_maker("indicator_display_title")}
        breadcrumbs={[
          <a href={infograph_href_template(subject, "results")}>
            {subject.name}
          </a>,
          text_maker("indicator_display_title"),
        ]}
        description={text_maker("indicator_display_desc")}
        route_key="_inddisp"
      >
        <TM k="indicator_display_title" el="h1" />
        {loading ? (
          <SpinnerWrapper ref="spinner" config_name={"sub_route"} />
        ) : (
          <Panel title={indicator.name}>
            <IndicatorDisplay indicator={indicator} show_doc={true} />
          </Panel>
        )}
      </StandardRouteContainer>
    );
  }
}
