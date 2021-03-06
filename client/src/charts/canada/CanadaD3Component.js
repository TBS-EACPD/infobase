// base map obtained from [here](http://commons.wikimedia.org/wiki/File:Canada_blank_map.svg)
//
// data in the following format:
//  ```javascript
//  [ {"on" : 1000, "qc": 2000, etc..}]
//  [ {"on" : 1000, "qc": 2000, etc..}]
//  [ {"on" : 1000, "qc": 2000, etc..}]
//  [ {"on" : 1000, "qc": 2000, etc..}]
//  ```
//  with the array ordered by fiscal year
//

import { dispatch } from "d3-dispatch";
import { select } from "d3-selection";

import "d3-selection-multi";
import _ from "lodash";

import { businessConstants } from "src/models/businessConstants";

import { separatorColor } from "src/core/color_defs";
import { lang } from "src/core/injected_build_constants";

import { canada_svg } from "./canada_svg.yaml";

const { provinces, provinces_short } = businessConstants;
const canada_svg_text = canada_svg.text;

const ordering = _.chain([
  "abroad",
  "na",
  "yt",
  "nt",
  "nu",
  "bc",
  "ab",
  "sk",
  "mb",
  "on",
  "onlessncr",
  "qc",
  "qclessncr",
  "nl",
  "ncr",
  "nb",
  "ns",
  "pe",
])
  .map((prov_key, index) => [prov_key, index])
  .fromPairs()
  .value();

const get_province_display_name = (prov_key, scale) => {
  if (provinces[prov_key] && scale > 0.5) {
    // If the graph is large enough and the full name is defined, use full name
    return provinces[prov_key].text;
  } else if (provinces_short[prov_key] && scale < 0.5) {
    // If the graph is too small and the short name is defined, use short name. Basically bilingual prov codes
    return provinces_short[prov_key].text;
  } else {
    return prov_key;
  }
};

const get_province_element_id = (prov_key) => `#ca-${prov_key}`;

export class CanadaD3Component {
  constructor(container, options) {
    this.window_width_last_updated_at = window.innerWidth;
    const select_container = select(container);
    select_container.append("div").classed("__svg__", true);
    select_container.select(".__svg__").html(canada_svg_text);

    this.svg = select_container.select("svg");
    this.outside_width = select_container.node()?.getBoundingClientRect().width;
    this.outside_height = 400;
    this.html = select_container;
    this.options = options;

    const base_dispatch_events = ["dataMouseEnter", "dataMouseLeave"];
    this.dispatch = options.dispatch = dispatch.apply(
      this,
      base_dispatch_events
    );
    window.addEventListener(
      "resize",
      _.debounce(() => {
        if (this.should_graphs_update()) {
          this.update_graphs();
        }
      }, 250)
    );
  }

  should_graphs_update() {
    return window.innerWidth !== this.window_width_last_updated_at;
  }
  update_graphs() {
    this.window_width_last_updated_at = window.innerWidth;

    if (this.html) {
      const html_container = this.html.node();
      if (html_container) {
        this.outside_width = html_container.getBoundingClientRect().width;
        this.outside_height = 400;

        _.map(html_container.childNodes, _.identity).forEach((child) => {
          // Remove all labels associated with the graph (that is, all siblings of the svg's container).
          if (!_.isUndefined(child) && !child.className.includes("__svg__")) {
            html_container.removeChild(child);
          }
        });
      }
      // forEach directly on a nodeList has spoty support even with polyfils,
      // mapping it through to an array first works consistently though
      this.render(this.options);
    }
  }

  render(options) {
    this.options = _.extend(this.options, options);

    const x_scale_factor = 1396;
    const y_scale_factor = 1346;

    const max_height = 700;
    const x_scale = this.outside_width / x_scale_factor;
    const y_scale = max_height / y_scale_factor;
    const scale = Math.min(x_scale, y_scale);
    const height = scale * y_scale_factor;
    const padding = (this.outside_width - scale * x_scale_factor) / 2;
    const main_color = this.options.main_color;
    const secondary_color = this.options.secondary_color;
    const color_scale = this.options.color_scale;
    const formatter = this.options.formatter;

    const data = this.options.data;
    const selected_year_data = data[this.options.selected_year_index];

    const html = this.html;
    const svg = this.svg;
    const graph_dispatcher = this.dispatch;

    const data_has_ncr_broken_out = _.some(data, (row) =>
      _.chain(row)
        .keys()
        .some((key) => /^ncr$|^.*lessncr$/.test(key))
        .value()
    );
    if (data_has_ncr_broken_out) {
      _.each(["on", "qc"], (prov_key) =>
        svg
          .select(get_province_element_id(prov_key))
          .attr(
            "id",
            get_province_element_id(`${prov_key}lessncr`).replace("#", "")
          )
      );
    }

    // Set dimensions and scaling of svg
    svg.attrs({
      height: height + "px",
      width: this.outside_width + "px",
    });
    svg
      .select(".container")
      .attr("transform", `translate(${padding},0), scale(${scale})`);

    // Unhide map components specific to current language
    svg.selectAll(`.${lang}-only`).styles({
      opacity: "1",
    });

    // Graph event dispatchers
    let previous_event_target_prov_key = false;
    const dispatch_mouseLeave = function () {
      if (previous_event_target_prov_key) {
        svg
          .select(get_province_element_id(previous_event_target_prov_key))
          .styles({
            "stroke-width": "2px",
            stroke: main_color,
          });
      }
      previous_event_target_prov_key = false;
      graph_dispatcher.call("dataMouseLeave");
    };
    const dispatch_mouseEnter = function (prov_key) {
      if (previous_event_target_prov_key) {
        svg
          .select(get_province_element_id(previous_event_target_prov_key))
          .styles({
            "stroke-width": "2px",
            stroke: main_color,
          });
      }
      if (!_.isUndefined(selected_year_data[prov_key])) {
        previous_event_target_prov_key = prov_key;
        svg.select(get_province_element_id(prov_key)).styles({
          "stroke-width":
            prov_key === "abroad" || prov_key === "na" ? "8px" : "15px",
          stroke: main_color,
        });

        graph_dispatcher.call("dataMouseEnter", "", prov_key);
      }
    };

    // Set province colours, attach event dispatchers
    const province_is_active = (prov_key) =>
      _.some(data, (year) => year[prov_key]);
    const get_color = (prov_key) =>
      province_is_active(prov_key) ? main_color : secondary_color;
    const get_opacity = (prov_key) =>
      province_is_active(prov_key)
        ? color_scale(selected_year_data[prov_key] || 0)
        : 0.5;

    svg
      .selectAll(".province")
      .each(function (d) {
        var that = select(this);
        var prov_key = that.attr("id").split("-")[1];
        select(this).datum(prov_key);
      })
      .styles({
        fill: get_color,
        "fill-opacity": get_opacity,
        "stroke-width": "2px",
        stroke: get_color,
        "stroke-opacity": get_opacity,
      })
      .on("mouseenter", dispatch_mouseEnter)
      .on("focus", dispatch_mouseEnter)
      .on("mouseleave", dispatch_mouseLeave)
      .on("blur", dispatch_mouseLeave);

    // Add labels to provinces with data, attach event dispatchers
    const provinces_to_label = _.chain(ordering)
      .keys()
      .pullAll(
        data_has_ncr_broken_out
          ? ["on", "qc"]
          : ["onlessncr", "qclessncr", "ncr"]
      )
      .filter((prov_key) =>
        _.some(data, (yearly_data) => yearly_data[prov_key])
      )
      .value();

    html
      .selectAll("div.label")
      .data(provinces_to_label)
      .enter()
      .append("div")
      .order()
      .attr("class", "label")
      .attr("tabindex", 0)
      .on("mouseenter", dispatch_mouseEnter)
      .on("focus", dispatch_mouseEnter)
      .on("mouseleave", dispatch_mouseLeave)
      .on("blur", dispatch_mouseLeave)
      .each(function (prov_key, i) {
        const label = svg.selectAll("g.label").filter(function () {
          return select(this).attr("id") === `ca-${prov_key}--label`;
        });

        const coords = label
          .attr("transform")
          .replace(/(translate\(|\)|)/g, "")
          .replace(",", " ")
          .split(" ");

        select(this).styles({
          left: `${padding + scale * coords[0]}px`,
          top: `${scale * coords[1]}px`,
          padding: "5px",
          position: "absolute",
          "border-radius": "5px",
          "text-align": "center",
          "font-size": `${scale * 22}px`,
          "background-color": separatorColor,
        });

        const prov_name = get_province_display_name(prov_key, scale);

        select(this).append("p").style("margin-bottom", "0px").html(prov_name);

        select(this)
          .append("p")
          .attr("class", "label-value")
          .style("margin-bottom", "0px");
      });
    html.selectAll("p.label-value").each(function (prov_key, i) {
      select(this).html(formatter(selected_year_data[prov_key] || 0));
    });

    // Hide optional map components based on data availability
    const hide_map_components = (selector) =>
      svg.selectAll(selector).styles({
        visibility: "hidden",
      });
    const hide_optional_components = (prov_keys, selector_template) =>
      _.each(prov_keys, (prov_key) => {
        const corresponding_province_has_data = _.some(
          data,
          (yearly_data) => yearly_data[prov_key]
        );
        if (!corresponding_province_has_data) {
          hide_map_components(selector_template(prov_key));
        }
      });

    const optional_provinces = ["abroad", "na", "ncr"];
    hide_optional_components(
      optional_provinces,
      (prov_key) => `.province${get_province_element_id(prov_key)}`
    );

    const provinces_with_optional_markers = ["pe", "ns", "nb", "ncr"];
    hide_optional_components(
      provinces_with_optional_markers,
      (prov_key) => `path${get_province_element_id(prov_key)}--marker`
    );
  }
}
