import { get_client } from '../../../graphql_utils.js';
import gql from 'graphql-tag';
import { log_standard_event } from '../../../core/analytics.js';
import { StandardRouteContainer } from '../../../core/NavComponents.js';

import { TM, text_maker } from './result_text_provider.js';

import {
  Panel,
  SpinnerWrapper,
} from '../../../components';

import { Indicator } from '../../../models/results.js';
import { SingleIndicatorDisplay } from './result_components.js';


const indicators_fields_fragment = `  id
  stable_id
  result_id
  name
  doc

  target_year
  target_month

  is_reporting_discontinued

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

  actual_datatype
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
  indicator.target_year = _.isNull(indicator.target_year) ? null : parseInt(indicator.target_year);
  indicator.target_month = _.isNull(indicator.target_month) ? null : parseInt(indicator.target_month);
  return indicator;
};

const query_api = (id) => {
  const time_at_request = Date.now();
  const client = get_client();
  const query = get_indicator_query;
  return client.query({
    query,
    variables: {
      lang: window.lang, 
      id,
      _query_name: 'results_bundle',
    },
  })
    .then( (response) => {
      Indicator.create_and_register(process_indicator(response.data.root.indicator));
      return Promise.resolve();
    })
    .catch(function(error){
      const resp_time = Date.now() - time_at_request;     
      log_standard_event({
        SUBAPP: window.location.hash.replace('#',''),
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

  componentDidMount(){
    const {
      match: {
        params: { id },
      },
    } = this.props;
    query_api(id).then( () => this.setState({loading: false}) );
  }

  render(){
    const {
      match: {
        params: { id },
      },
    } = this.props;

    const { 
      loading,
    } = this.state;

    const indicator = Indicator.lookup(id);
    
    return (
      <StandardRouteContainer
        title={text_maker("indicator_display_title")}
        breadcrumbs={[text_maker("indicator_display_title")]}
        description={text_maker("indicator_display_desc")}
        route_key="_inddisp"
      >
        <TM k="indicator_display_title" el="h1" />
        {loading ? <SpinnerWrapper ref="spinner" config_name={"sub_route"} /> :
          <Panel title={indicator.name}>
            <SingleIndicatorDisplay indicator={indicator} show_doc={true}/>
          </Panel>
        }
      </StandardRouteContainer>

    );
  }
}
