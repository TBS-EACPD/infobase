import { StandardRouteContainer } from '../core/NavComponents.js';
import { infobaseGraphColors } from '../core/color_schemes.js';
import { get_vs_top10_data } from './data.js';
import { SpinnerWrapper } from '../util_components.js';
import { FlatTreeMapViz } from './FlatTreeMapViz.js';
import { formats } from '../core/format.js';
import { Fragment } from 'react';


const pos_d3_color_scale = d3.scaleSequential(d3.interpolateRgbBasis(d3.schemeBlues[9].slice(0, 6)));
pos_d3_color_scale.clamp(true); // I'm not sure if this is the default
pos_d3_color_scale.domain([0, 20000000000]);
d3.schemeCategory10.push("#999999")
const cat_scale = d3.scaleOrdinal(d3.schemeCategory10);
const infobase_scale = d3.scaleOrdinal(infobaseGraphColors);

function get_color_scale(d) {
  return cat_scale(d);
}

export default class FlatTreeMapTest extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
    this.props.match.params = {
      year: "pa_last_year",
      perspective: undefined,
      org_id: undefined,
    }
  }
  componentDidMount() {
    this.set_data(this.props);
  }

  set_data(props) {
    const {
      match: {
        params: {
          perspective,
          org_id,
          year,
        },
      },
    } = props;
    get_vs_top10_data('stat').then(data => {
      this.setState({
        loading: false,
        data,
      });
    })
  }
  render() {
    const {
      history,
      location,
      match: {
        params: {
          perspective,
          color_var,
          year,
        },
      },
    } = this.props;
    const {
      loading,
      data,
    } = this.state;
    const colorScale = get_color_scale;

    return (
      <StandardRouteContainer
        route_key='start'
        title='tree map development'
      >
        {loading ?
          <SpinnerWrapper ref="spinner" config_name={"route"} /> :
          <FlatTreeMapViz
            data={data}
            colorScale={colorScale}
            tooltip_render={() => { }}
            node_render={std_node_render}
            width={500}
            height={500}
          />
        }
      </StandardRouteContainer>
    )
  }
}

/* TOOLTIPS */

function std_tooltip_render(tooltip_sel) {
  tooltip_sel.html(function (d) {
    let tooltip_html = `<div>
    <div>${d.data.name}</div>
    <hr class="BlueHLine">
    <div>${formats.compact1(d.data.amount)}
    ${generate_infograph_href(d, "financial")}
    </div>`
    return tooltip_html;
  })
}

function generate_infograph_href(d, data_area) {
  if (d.data.subject) {
    return `<div style="padding-top: 10px">
          <a class="TM_Tooltip__link" href="www.google.com"> ${"see_the_infographic"} </a>
        </div>`;
  } else { return '' }
}

function std_node_render(foreign_sel) {
  foreign_sel.html(function (node) {
    if (this.offsetHeight <= 30 || this.offsetWidth <= 50) { return }

    // const name_to_display = (node.data.subject && node.data.subject.fancy_acronym && this.offsetWidth < 150 ? node.data.subject.fancy_acronym : node.data.name);

    // let text_size = "";
    // if (this.offsetHeight > 150 && this.offsetWidth > 300) { text_size = "--large" }
    // if (this.offsetHeight > 50 && this.offsetWidth > 50 && this.offsetHeight <= 100) { text_size = "--small" }

    let show_amount = true;
    //if (this.offsetHeight <= 50) { show_amount = false }

    let ret = `
      <div class="FlatTreeMap__TextBox">
        <div class="FlatTreeMap__ContentTitle">
          ${node.data.name}
        </div>
    `
    if (show_amount) {
      ret = ret + `
        <div class="FlatTreeMap__ContentText">
          ${formats.compact1(node.data.value)}
        </div>
      </div>
      `
    }
    return ret;
  });
}