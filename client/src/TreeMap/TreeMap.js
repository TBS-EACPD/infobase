//https://gist.github.com/guglielmo/16d880a6615da7f502116220cb551498

import { interpolateRgbBasis } from "d3-interpolate";
import { scaleSequential } from "d3-scale";
import { select } from "d3-selection";
import "d3-transition";
import _ from "lodash";
import React from "react";

import { is_mobile } from "src/core/feature_detection.js";

import {
  SpinnerWrapper,
  create_text_maker_component,
} from "../components/index.js";
import {
  sequentialBlues,
  sequentialReds,
  sequentialGreens,
  sequentialPurples,
} from "../core/color_schemes.js";
import { formats } from "../core/format.js";
import { StandardRouteContainer } from "../core/NavComponents.js";
import { infograph_href_template } from "../infographic/infographic_link.js";

import { run_template } from "../models/text.js";

import { actual_to_planned_gap_year } from "../models/years.js";

import { get_data, load_data } from "./data.js";

import { TreeMapInstructions } from "./TreeMapInstructions.js";
import { TreeMapLegend } from "./TreeMapLegend.js";
import { TreeMapSidebar } from "./TreeMapSidebar.js";
import { TreeMapTopbar } from "./TreeMapTopBar.js";
import { TreeMap } from "./TreeMapViz.js";

import treemap_text from "./TreeMap.yaml";

import "./TreeMap.scss";

const { TM, text_maker } = create_text_maker_component([treemap_text]);

const format_display_number = (value, is_fte = false, raw = false) =>
  raw
    ? is_fte
      ? `${formats.big_int_raw(Math.round(value))} ${text_maker("fte")}`
      : formats.compact1_raw(value)
    : is_fte
    ? `${formats.big_int(Math.round(value))} ${text_maker("fte")}`
    : formats.compact1(value);

function generate_infograph_href(d, data_area) {
  if (d.data.subject) {
    return `
    <div style="padding-top: 10px">
      <a class="TM_Tooltip__link" href=${infograph_href_template(
        d.data.subject,
        data_area
      )} >
        ${text_maker("see_the_infographic")}
      </a>
    </div>
    `;
  } else {
    return "";
  }
}

const GapYearWarning = () => (
  <div
    className="alert alert-info alert-no-symbol alert--is-bordered medium-panel-text"
    style={{ textAlign: "center" }}
  >
    <TM k="gap_year_warning" args={{ gap_year: actual_to_planned_gap_year }} />
  </div>
);

function node_html(node, display_name, text_size, display_number) {
  return `
  <div class="TreeMapNode__ContentBox TreeMapNode__ContentBox--standard">
    <div class="TreeMapNode__ContentTitle ${
      (text_size && `TreeMapNode__ContentTitle${text_size}`) || ""
    }">
      ${display_name}
    </div>
    ${
      (display_number &&
        `
    <div class="TreeMapNode__ContentText ${
      (text_size && `TreeMapNode__ContentText${text_size}`) || ""
    }">
      ${display_number}
    </div>`) ||
      ""
    }
  </div>
  `;
}

function node_name(node, width) {
  if (node.data.subject && node.data.subject.abbr && width < 150) {
    return node.data.subject.abbr;
  }
  return node.data.name;
}

function get_node_size(node) {
  if (node.offsetHeight <= 30 || node.offsetWidth <= 50) {
    return "tiny";
  } else if (node.offsetHeight < 100 || node.offsetWidth < 150) {
    return "small";
  } else if (node.offsetHeight > 150 && node.offsetWidth > 300) {
    return "large";
  } else {
    return "medium";
  }
}

function std_node_render(is_fte, foreign_sel) {
  foreign_sel.html(function (node) {
    const node_size = get_node_size(this);
    if (node_size === "tiny") {
      return;
    } //no contents on tiny nodes
    const text_size = node_size === "medium" ? "" : `--${node_size}`;
    const display_name = node_name(node, this.offsetWidth);
    const display_number =
      this.offsetHeight > 50
        ? is_fte
          ? format_display_number(node.data.ftes, true)
          : format_display_number(node.data.amount)
        : "";
    return node_html(node, display_name, text_size, display_number);
  });
}
const curried_node_render = _.curry(std_node_render);

/* COLOUR SCALES */

//what values should be the darkest colour?
const raw_spending_limit = 2000000000;
const perc_limit = 0.3;
const raw_fte_limit = 1000;

// need this slightly tricky formulation because we only want to use part of the scale
// (darkest colours are too dark for good contrast with the text)
const blue_scale = scaleSequential(
  interpolateRgbBasis(sequentialBlues.slice(0, 4))
).clamp(true);
const red_scale = scaleSequential(
  interpolateRgbBasis(sequentialReds.slice(0, 4))
).clamp(true);
const green_scale = scaleSequential(
  interpolateRgbBasis(sequentialGreens.slice(0, 4))
).clamp(true);
const purple_scale = scaleSequential(
  interpolateRgbBasis(sequentialPurples.slice(0, 3))
).clamp(true);

// spending % of parent -- 30% is enough for the colour to be maxed out
function standard_color_scale(node) {
  const color_val = node.data.parent_amount
    ? node.data.amount / node.data.parent_amount
    : 0; // smaller_items nodes don't have parents, set them to 0
  const scale = node.data.amount < 0 ? red_scale : blue_scale;
  scale.domain([0, perc_limit]);
  if (node.amount < 0) {
    return scale(-color_val);
  } else {
    return scale(color_val);
  }
}

// FTE % of parent
function fte_color_scale(node) {
  const color_val = node.data.parent_ftes
    ? node.data.ftes / node.data.parent_ftes
    : 0; // smaller_items nodes don't have parents, set them to 0
  const scale = green_scale.domain([0, perc_limit]);
  return scale(color_val);
}

// divergent scales (absolute val)
function spending_change_color_scale(node) {
  const color_val = node.data.amount < 0 ? -node.data.amount : node.data.amount;
  const scale = node.data.amount < 0 ? red_scale : blue_scale;
  scale.domain([0, raw_spending_limit]);
  return scale(color_val);
}
function fte_change_color_scale(node) {
  const color_val = node.data.ftes < 0 ? -node.data.ftes : node.data.ftes;
  const scale = node.data.ftes < 0 ? purple_scale : green_scale;
  scale.domain([0, raw_fte_limit]);
  return scale(color_val);
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

const n_legend_vals = 4;

// this is super complicated and hacky but it's because it's hard to get diverging color
// scales to look like how you want.
function get_legend_cols(color_var, get_changes, colorScale) {
  const increase = get_changes
    ? color_var === "ftes"
      ? 2 * (raw_fte_limit / n_legend_vals)
      : 2 * (raw_spending_limit / n_legend_vals)
    : perc_limit / n_legend_vals;
  let raw_vals = get_changes
    ? color_var === "ftes"
      ? _.concat(
          -raw_fte_limit - increase,
          _.range(-raw_fte_limit, raw_fte_limit + increase, increase)
        )
      : _.concat(
          -raw_spending_limit - increase,
          _.range(-raw_spending_limit, raw_spending_limit + increase, increase)
        )
    : _.range(0, perc_limit + increase, increase);
  const processed_vals = _.map(raw_vals, (v) => {
    return v < 0 ? v + increase - increase / 2 : v;
  });
  const nodes = _.map(processed_vals, (v) => ({
    data: { ftes: v, parent_ftes: 1, amount: v, parent_amount: 1 },
  }));
  const color_vals = _.map(nodes, (n) => colorScale(n));
  const output = _.map(_.zip(raw_vals, color_vals), (pair) => ({
    val: get_changes
      ? format_display_number(pair[0], color_var === "ftes", true)
      : formats.percentage_raw(Math.round(pair[0] * 100) / 100),
    col: pair[1],
  }));
  if (get_changes) {
    output[0].val = undefined;
  }
  return output;
}

function get_legend_measure_text(color_var, get_changes) {
  return get_changes
    ? color_var === "ftes"
      ? text_maker("fte")
      : `${text_maker("expenditures")} ($)`
    : color_var === "ftes"
    ? `${text_maker("fte")}
    (${text_maker("percent_of_parent")})`
    : `${text_maker("expenditures")}
  (${text_maker("percent_of_parent")})`;
}

/* TOOLTIPS */

function std_tooltip_render(tooltip_sel) {
  tooltip_sel.html(function (d) {
    let tooltip_html = `<div>
    <div>${d.data.name}</div>
    <hr class="BlueHLine">`;
    if (d.data.parent_amount) {
      tooltip_html =
        tooltip_html +
        `
      <div>${format_display_number(d.data.amount)}
      (${formats.percentage1(
        d.data.amount / d.data.parent_amount
      )} ${text_maker("of")} ${d.data.parent_name})</div>`;
    } else {
      tooltip_html =
        tooltip_html +
        `
      <div>${format_display_number(d.data.amount)}</div>`;
    }
    if (d.data.ftes) {
      if (d.data.parent_ftes) {
        tooltip_html =
          tooltip_html +
          `
        <div>${format_display_number(d.data.ftes, true)}
        (${formats.percentage1(d.data.ftes / d.data.parent_ftes)} ${text_maker(
            "of"
          )} ${d.data.parent_name})</div>`;
      } else {
        tooltip_html =
          tooltip_html +
          `
        <div>${format_display_number(d.data.ftes, true)}</div>`;
      }
    }
    tooltip_html =
      tooltip_html +
      `
    ${generate_infograph_href(d)}
    </div>`;
    return tooltip_html;
  });
}

function std_tooltip_render_changes(tooltip_sel) {
  tooltip_sel.html(function (d) {
    let tooltip_html = `<div>
    <div>${d.data.name}</div>
    <hr class="BlueHLine">
    <div>${format_display_number(d.data.amount)}</div>`;
    if (d.data.ftes) {
      tooltip_html =
        tooltip_html +
        `
      <div>${Math.round(d.data.ftes)} ${text_maker("fte")}</div>`;
    }
    tooltip_html =
      tooltip_html +
      `
    ${generate_infograph_href(d)}
    </div>`;
    return tooltip_html;
  });
}

function mobile_tooltip_render(tooltip_sel) {
  tooltip_sel
    .html(function (d) {
      let tooltip_html = `<div>
    <div>${d.data.name}</div>
    <hr class="BlueHLine">
    <div>${format_display_number(d.data.amount)}</div>`;
      if (d.data.parent_amount) {
        tooltip_html =
          tooltip_html +
          `
      <div>${formats.percentage1(
        d.data.amount / d.data.parent_amount
      )} ${text_maker("of")} ${d.data.parent_name}</div>`;
      }
      if (d.data.ftes) {
        if (d.data.parent_ftes) {
          tooltip_html =
            tooltip_html +
            `
        <div>${format_display_number(d.data.ftes, true)}
        (${formats.percentage1(d.data.ftes / d.data.parent_ftes)} ${text_maker(
              "of"
            )} ${d.data.parent_name})</div>`;
        } else {
          tooltip_html =
            tooltip_html +
            `
        <div>${format_display_number(d.data.ftes, true)}</div>`;
        }
      }
      tooltip_html =
        tooltip_html +
        `
    ${generate_infograph_href(d)}`;
      if (
        select(this.parentNode).classed(
          "TreeMapNode__ContentBoxContainer--has-children"
        )
      ) {
        tooltip_html =
          tooltip_html +
          `
      <button class="btn-primary">Zoom in</button>`;
      }
      tooltip_html =
        tooltip_html +
        `
    </div>`;
      return tooltip_html;
    })
    .select("button")
    .on("click", function (d) {
      select(d).transition();
    });
}

function mobile_tooltip_render_changes(tooltip_sel) {
  tooltip_sel
    .html(function (d) {
      let tooltip_html = `<div>
    <div>${d.data.name}</div>
    <hr class="BlueHLine">
    <div>${format_display_number(d.data.amount)}</div>`;
      if (d.data.ftes) {
        tooltip_html =
          tooltip_html +
          `
      <div>${format_display_number(d.data.ftes, true)}</div>`;
      }
      tooltip_html =
        tooltip_html +
        `
    ${generate_infograph_href(d)}`;
      if (
        select(this.parentNode).classed(
          "TreeMapNode__ContentBoxContainer--has-children"
        )
      ) {
        tooltip_html =
          tooltip_html +
          `
      <button class="btn-primary">Zoom in</button>`;
      }
      tooltip_html =
        tooltip_html +
        `
    </div>`;
      return tooltip_html;
    })
    .select("button")
    .on("click", function (d) {
      select(d).transition();
    });
}

function check_props(props) {
  props.match.params.perspective = props.match.params.perspective || "drf";
  props.match.params.year = props.match.params.year || "pa_last_year";
  props.match.params.color_var = props.match.params.color_var || "spending";
  props.match.params.filter_var = props.match.params.filter_var || "All";
  props.match.params.get_changes = props.match.params.get_changes || "";

  return props;
}

function skip() {
  document.querySelector("#TreeMap__Main").focus();
}

export default class TreeMapper extends React.Component {
  constructor(props) {
    super(props);
    this.props = check_props(props);

    this.state = {
      loading: true,
      data: false,
      route_params: props.match.params,
      org_route: [],
    };

    load_data(this.props).then(() => this.setState({ loading: false }));
  }
  static getDerivedStateFromProps(props, state) {
    return {
      route_params: props.match.params,
      data: _.isEqual(props.match.params, state.route_params)
        ? state.data
        : false,
    };
  }
  componentDidUpdate() {
    const { loading, data } = this.state;
    if (loading) {
      load_data(this.props).then(() => this.setState({ loading: false }));
    } else if (!data) {
      this.set_data(this.props);
    }
  }
  set_data(props) {
    const {
      match: {
        params: { perspective, year, filter_var, get_changes },
      },
    } = props;
    const data = get_data(perspective, year, filter_var, get_changes);
    this.setState({
      data: data,
      org_route: [],
    });
  }
  setRoute = (new_route, reset = false) => {
    let next_route = this.state.org_route;
    reset
      ? (next_route = new_route)
      : (next_route = this.state.org_route.concat([new_route]));
    this.setState({
      org_route: next_route,
    });
  };
  render() {
    const {
      history,
      location,
      match: {
        params: { perspective, color_var, filter_var, year, get_changes },
      },
    } = this.props;
    const { loading, data } = this.state;
    const colorScale = get_color_scale(color_var, get_changes);

    let app_height = 800;
    if (is_mobile()) {
      app_height = Math.ceil(0.8 * screen.height);
    }
    const topbar_height = 55;

    const display_year = run_template("{{" + year + "}}");
    return (
      <StandardRouteContainer
        title={text_maker("treemap_title")}
        breadcrumbs={[text_maker("treemap_breadcrumbs")]}
        description={text_maker("treemap_meta_desc")}
        non_a11y_route={true}
        route_key={"treemap"}
      >
        {loading || !data ? (
          <SpinnerWrapper ref="spinner" config_name={"route"} />
        ) : (
          <div>
            <div className="TreeMap__Wrapper">
              <h1>{text_maker("treemap_title")}</h1>
              <button
                className="TreeMap__SkipLink button-unstyled a11y-version-link"
                tabIndex="0"
                onClick={skip}
              >
                {text_maker("skip_to_main_content")}
              </button>
              <TreeMapInstructions />
              {actual_to_planned_gap_year && <GapYearWarning />}
              <div className="frow">
                <div className="fcol-md-10">
                  <div className="frow">
                    <div
                      className="TreeMap__TopBar"
                      style={{ minHeight: `${topbar_height}px` }}
                    >
                      <TreeMapTopbar
                        history={history}
                        org_route={this.state.org_route}
                        setRouteCallback={this.setRoute}
                      />
                    </div>
                    <TreeMap
                      data={data}
                      colorScale={colorScale}
                      year={year}
                      org_route={this.state.org_route}
                      setRouteCallback={this.setRoute}
                      perspective={perspective}
                      tooltip_render={
                        get_changes
                          ? is_mobile()
                            ? mobile_tooltip_render_changes
                            : std_tooltip_render_changes
                          : is_mobile()
                          ? mobile_tooltip_render
                          : std_tooltip_render
                      }
                      node_render={
                        perspective === "drf_ftes"
                          ? curried_node_render(true)
                          : curried_node_render(false)
                      }
                      viz_height={app_height - topbar_height}
                    />
                  </div>
                  <div className="frow">
                    <TreeMapLegend
                      perspective={perspective}
                      legend_cols={get_legend_cols(
                        color_var,
                        get_changes,
                        colorScale
                      )}
                      legend_measure_text={get_legend_measure_text(
                        color_var,
                        get_changes
                      )}
                      n_legend_vals={n_legend_vals}
                    />
                  </div>
                  <div className="explore_description">
                    <a href="#rpb">{text_maker("rbp_link_text")}</a>
                  </div>
                </div>
                <div
                  className="fcol-md-2 TreeMap__SideBar"
                  style={{ padding: "0px", minHeight: `${app_height + 9}px` }}
                >
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
          </div>
        )}
      </StandardRouteContainer>
    );
  }
}
