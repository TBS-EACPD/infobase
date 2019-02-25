//https://gist.github.com/guglielmo/16d880a6615da7f502116220cb551498

import { StandardRouteContainer } from '../core/NavComponents.js';
import {
  Format,
  TM,
  SpinnerWrapper
} from '../util_components.js';
import {
  get_data,
  load_data
} from './data.js';
import { formats } from '../core/format.js';
import './TreeMap.scss';
import { TreeMap } from './TreeMapViz.js';
import { TreeMapControls } from './TreeMapControls.js';
import { TreeMapSidebar } from './TreeMapSidebar.js';
import { TreeMapTopbar } from './TreeMapTopBar.js';
import { IndicatorDisplay } from '../panels/result_graphs/components.js'
import { infograph_href_template } from '../infographic/routes.js';
import {
  trivial_text_maker,
  run_template
} from '../models/text.js';
import { Fragment } from 'react';
import { createBrowserHistory } from 'history';



/* NODE RENDERING FUNCTIONS */

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

/* COLOUR SCALES */

// need this slightly tricky formulation because we only want to use part of the scale
// (darkest colours are too dark for good contrast with the text)
const d3_blue = d3.scaleSequential(d3.interpolateRgbBasis(d3.schemeBlues[9].slice(2, 7)));
d3_blue.clamp(true);
const d3_red = d3.scaleSequential(d3.interpolateRgbBasis(d3.schemeReds[9].slice(2, 7)));
d3_red.clamp(true);
const d3_green = d3.scaleSequential(d3.interpolateRgbBasis(d3.schemeGreens[9].slice(2, 7)));
d3_green.clamp(true);
const d3_purple = d3.scaleSequential(d3.interpolateRgbBasis(["#e7d4e8","#c2a5cf","#9970ab","#994d97"]));
d3_purple.clamp(true);

// spending % of parent
function standard_color_scale(node) {
  let color_val;
  let scale = d3_blue;
  node.data.parent_amount ? color_val = node.data.amount / node.data.parent_amount * 3 : color_val = 0;
  if (node.data.amount < 0) {
    color_val = -color_val
    scale = d3_red;
  }
  scale.domain([0, 1]);
  return scale(color_val);
}

// FTE % of parent
function fte_color_scale(node) {
  let color_val = 0;
  if (node.data.parent_ftes) { color_val = node.data.ftes / node.data.parent_ftes * 3 }
  return d3_green(color_val);
}

// divergent scales (absolute val)
function spending_change_color_scale(node) {
  let colour_val = node.data.amount;
  let scale = d3_blue;
  if (colour_val < 0) {
    colour_val = -colour_val;
    scale = d3_red;
  }
  scale.domain([0, 1000000000]);
  return scale(colour_val);
}
function fte_change_color_scale(node) {
  let colour_val = node.data.ftes;
  let scale = d3_green;
  if (colour_val < 0) {
    colour_val = -colour_val;
    scale = d3_purple;
  }
  scale.domain([0, 10000]);
  return scale(colour_val);
}

function get_color_scale(color_var, get_changes) {
  if (get_changes) {
    if (color_var && color_var === "ftes") {
      return fte_change_color_scale;
    } else {
      return spending_change_color_scale;
    }
  } else if (color_var && color_var === "ftes") {
    return fte_color_scale;
  } else {
    return standard_color_scale;
  }
}

/* TOOLTIPS */

function std_tooltip_render(tooltip_sel, year) {
  let get_changes = false;
  if ( year.includes(":") ){ get_changes = true }
  tooltip_sel.html(function (d) {
    let tooltip_html = `<div>
    <div>${d.data.name}</div>
    <hr class="BlueHLine">`;
    if (!get_changes && d.data.parent_amount) {
      tooltip_html = tooltip_html + `
      <div>${formats.compact1(d.data.amount)}
      (${formats.percentage1(d.data.amount / d.data.parent_amount)} of ${d.data.parent_name})</div>`;
    } else {
      tooltip_html = tooltip_html + `
      <div>${formats.compact1(d.data.amount)}</div>`
    }
    if (d.data.ftes) {
      if (!get_changes && d.data.parent_ftes) {
        tooltip_html = tooltip_html + `
        <div>${Math.round(d.data.ftes)} ${trivial_text_maker("fte")}
        (${formats.percentage1(d.data.ftes / d.data.parent_ftes)} of ${d.data.parent_name})</div>`

      } else {
        tooltip_html = tooltip_html + `
        <div>${Math.round(d.data.ftes)} ${trivial_text_maker("fte")}</div>`
      }
    }
    tooltip_html = tooltip_html + `
    ${generate_infograph_href(d)}
    </div>`;
    return tooltip_html;
  })
}

function mobile_tooltip_render(tooltip_sel, year) {
  let get_changes = false;
  if ( year.includes(":") ){ get_changes = true }
  tooltip_sel.html(function (d) {
    let tooltip_html = `<div>
    <div>${d.data.name}</div>
    <hr class="BlueHLine">
    <div>${formats.compact1(d.data.amount)}</div>`;
    if (!get_changes && d.data.parent_amount) {
      tooltip_html = tooltip_html + `
      <div>${formats.percentage1(d.data.amount / d.data.parent_amount)} of ${d.data.parent_name}</div>`;
    }
    tooltip_html = tooltip_html + `
    ${generate_infograph_href(d)}`
    if (d3.select(this.parentNode).classed("TreeMapNode__ContentBoxContainer--has-children")) {
      tooltip_html = tooltip_html + `
      <button class="btn-primary">Zoom in</button>`
    }
    tooltip_html = tooltip_html + `
    </div>`;
    return tooltip_html;
  })
    .select("button")
    .on("click", function (d) {
      d3.select(d).transition();
    })
}

function generate_infograph_href(d, data_area) {
  if (d.data.subject) {
    return `<div style="padding-top: 10px">
      <a class="TM_Tooltip__link" href=${infograph_href_template(d.data.subject, data_area)}> ${trivial_text_maker("see_the_infographic")} </a>
    </div>`;
  } else { return '' }
}


export default class TreeMapper extends React.Component {
  constructor(props) {
    super(props);
    this.setRoute = this.setRoute.bind(this);

    this.state = {
      loading: true,
      data: false,
      route_params: props.match.params,
      org_route: [],
    };

    load_data(this.props)
      .then(() => this.setState({ loading: false }));
  }
  static getDerivedStateFromProps(props, state) {
    return {
      route_params: props.match.params,
      data: _.isEqual(props.match.params, state.route_params) ? state.data : false,
    }
  }
  componentDidUpdate() {
    const {
      loading,
      data,
    } = this.state;
    if (loading) {
      load_data(this.props)
        .then(() => this.setState({ loading: false }));
    } else if (!data) {
      this.set_data(this.props);
    }
  }
  set_data(props) {
    const {
      match: {
        params: {
          perspective,
          org_id,
          year,
          filter_var,
          get_changes,
        },
      },
    } = props;
    const data = get_data(perspective, org_id, year, filter_var, get_changes);
    this.setState({
      data: data,
      org_route: [],
    });
  }
  setRoute(new_route, reset = false) {
    let next_route = this.state.org_route;
    reset ? next_route = new_route : next_route = this.state.org_route.concat([new_route])
    this.setState({
      org_route: next_route,
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
          filter_var,
          year,
          get_changes,
        },
      },
    } = this.props;
    const {
      loading,
      data,
      org_route,
    } = this.state;
    let colorScale = get_color_scale(color_var, get_changes);

    let app_height = 800;
    if (window.feature_detection.is_mobile()) {
      app_height = Math.ceil(0.8 * screen.height);
    }
    const topbar_height = 55;


    const display_year = run_template("{{" + year + "}}");
    return (
      <StandardRouteContainer
        route_key='start'
        title='tree map development'
      >
        {loading || !data ?
          <SpinnerWrapper ref="spinner" config_name={"route"} /> :
          <div>
            <div className="TreeMap__Wrapper">
              <div className="row">
                <div className="col-md-10">
                  <div className="row">
                    <div className="TreeMap__TopBar" style={{ "min-height": `${topbar_height}px` }}>
                      <TreeMapTopbar
                        history={history}
                        org_route={this.state.org_route}
                        setRouteCallback={this.setRoute}
                      />
                    </div>
                    <TreeMap
                      data = { data }
                      colorScale = { colorScale }
                      year = { year }
                      org_route = { this.state.org_route }
                      setRouteCallback = { this.setRoute }
                      perspective = { perspective }
                      tooltip_render={
                        window.feature_detection.is_mobile() ? mobile_tooltip_render : std_tooltip_render
                      }
                      node_render={std_node_render}
                      viz_height={app_height - topbar_height}
                    />
                  </div>
                </div>
                <div className="col-md-2 TreeMap__SideBar" style={{ padding: "0px", "min-height": `${app_height + 9}px` }}>
                  <TreeMapSidebar
                    side_bar_title={display_year}
                    perspective={perspective}
                    color_var={color_var}
                    filter_var={filter_var}
                    year={year}
                    get_changes={get_changes}
                    history={history}
                    location={location}
                  />
                </div>
              </div>
            </div>
            <div style={{ marginBottom: "200px" }} />
          </div>
        }
      </StandardRouteContainer>
    );
  }
}