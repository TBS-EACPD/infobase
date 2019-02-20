import { StandardRouteContainer } from '../core/NavComponents.js';
import { get_data } from './data.js';
import { SpinnerWrapper } from '../util_components.js';
import { FlatTreeMapViz } from './TreeMapViz.js';
import { infograph_href_template } from '../infographic/routes.js';
import { formats } from '../core/format.js';


const pos_d3_color_scale = d3.scaleSequential(d3.interpolateRgbBasis(d3.schemeBlues[9]));
pos_d3_color_scale.clamp(true); // I'm not sure if this is the default
const cat_scale = d3.scaleOrdinal(d3.schemeCategory10);

function get_color_scale(d) {
  return pos_d3_color_scale(d);
  //return cat_scale(d);
}

export default class FlatTreeMap extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
    this.props.match.params = {
      year: "pa_last_year",
      perspective: undefined,
      org_id: undefined,
      filter_var: undefined,
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
          filter_var,
        },
      },
    } = props;
    get_data(perspective, org_id, year, filter_var).then(data => {
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
          filter_var,
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
            colorScale = { colorScale }
            tooltip_render={ () => {} }
            node_render={ () => {} }
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

    const name_to_display = (node.data.subject && node.data.subject.fancy_acronym && this.offsetWidth < 150 ? node.data.subject.fancy_acronym : node.data.name);

    let text_size = "";
    if (this.offsetHeight > 150 && this.offsetWidth > 300) { text_size = "--large" }
    if (this.offsetHeight > 50 && this.offsetWidth > 50 && this.offsetHeight <= 100) { text_size = "--small" }

    let show_amount = true;
    if (this.offsetHeight <= 50) { show_amount = false }

    let ret = `
      <div class="TreeMapNode__ContentBox TreeMapNode__ContentBox--standard">
      <div class="TreeMapNode__ContentTitle TreeMapNode__ContentTitle${text_size}">
        ${name_to_display}
      </div>
    `
    if (show_amount) {
      ret = ret + `
      <div class="TreeMapNode__ContentText TreeMapNode__ContentText${text_size}">
        ${formats.compact1(node.data.amount)}
      </div>
      `
    }
    return ret + '</div>';
  });
}