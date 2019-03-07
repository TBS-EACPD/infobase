import { StandardRouteContainer } from '../core/NavComponents.js';
import { infobaseGraphColors } from '../core/color_schemes.js';
import { get_vs_top10_data } from './data.js';
import { SpinnerWrapper } from '../util_components.js';
import { FlatTreeMapViz } from './FlatTreeMapViz.js';
import { formats } from '../core/format.js';
import { Fragment } from 'react';


export default class FlatTreeMapTest extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }
  componentDidMount() {
    this.set_data(this.props);
  }

  set_data(props) {
    get_vs_top10_data('stat').then(data => {
      this.setState({
        loading: false,
        data,
      });
    })
  }
  render() {
    const {
      loading,
      data,
    } = this.state;

    return (
      <StandardRouteContainer
        route_key='start'
        title='tree map development'
      >
        {loading ?
          <SpinnerWrapper ref="spinner" config_name={"route"} /> :
          <FlatTreeMapViz
            data={data}
            colorScale={
              d3.scaleOrdinal(_.chain(d3.schemeCategory10)
                .concat("#bbbbbb")
                .map(
                  c => {
                    const d = d3.color(c);
                    d.opacity = 0.7;
                    return d
                  })
                .value())
            }
            width={500}
            height={500}
          />
        }
      </StandardRouteContainer>
    )
  }
}
