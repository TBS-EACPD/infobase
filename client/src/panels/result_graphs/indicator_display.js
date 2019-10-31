
import { ensure_loaded } from '../../core/lazy_loader.js';
import { StandardRouteContainer } from '../../core/NavComponents.js';

import { TM, text_maker } from './result_text_provider.js';

import {
  Panel,
  SpinnerWrapper,
} from '../../components';

import { Indicator } from '../../models/results.js';
import { SingleIndicatorDisplay } from './result_components.js';

export default class IndicatorDisplay extends React.Component {
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
    ensure_loaded({
      subject: {id: id, level: "indicator"},
      results: true,
    })
      .then( () => this.setState({loading: false}) );
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
            <SingleIndicatorDisplay indicator={indicator} />
          </Panel>
        }
      </StandardRouteContainer>

    );
  }
}