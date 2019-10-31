
import { ensure_loaded } from '../../core/lazy_loader.js';
import { StandardRouteContainer } from '../../core/NavComponents.js';

import { TM, text_maker } from './result_text_provider.js';

import {
  Panel,
  SpinnerWrapper,
  LabeledTombstone,
} from '../../components';

export class IndicatorDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true };
  }

  componentDidMount(){
    const {
      match: {
        params: { indicator_id },
      },
    } = this.props;
    ensure_loaded({
      subject: {id: indicator_id, level: "indicator"},
      results: true,
    })
      .then(
        this.setState({loading: false})
      );
  }

  render(){
    const { 
      loading,
    } = this.state;

    return (
      <StandardRouteContainer
        title={text_maker("indicator_display_title")}
        breadcrumbs={[text_maker("indicator_display_title")]}
        description={text_maker("indicator_display_desc")}
        route_key="_inddisp"
      >
        <TM k="indicator_display_title" el="h1" />
        {loading ? <SpinnerWrapper ref="spinner" config_name={"sub_route"} /> :
          <Panel title={"TODO"}>
            <LabeledTombstone 
              labels_and_items={[["one","omg"],["two","wtf"]]}
            />
          </Panel>
        }
      </StandardRouteContainer>

    );
  }
}