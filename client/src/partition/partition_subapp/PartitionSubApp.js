import _ from "lodash";
import React from "react";
import ReactDOM from "react-dom";

import d3 from "src/app_bootstrap/d3-bundle.js";

import {
  primaryColor,
  separatorColor,
  backgroundColor,
} from "../../core/color_defs.js";
import { newIBDarkCategoryColors } from "../../core/color_schemes.js";
import { reactAdapter } from "../../core/reactAdapter";
import { get_static_url } from "../../request_utils.js";
import { PartitionDiagram } from "../partition_diagram/PartitionDiagram.js";

import { text_maker } from "./partition_text_provider.js";
import { PartitionNotes } from "./PartitionNotes.js";
import "./PartitionSubApp.scss";

export class PartitionSubApp {
  constructor(
    container,
    all_perspectives,
    all_data_types,
    initial_perspective_id,
    initial_data_type_id,
    url_update_callback
  ) {
    this.search_required_chars = 1;
    this.search_debounce_time = 500;

    this.container = container;
    this.all_perspectives = all_perspectives;
    this.all_data_types = all_data_types;
    this.url_update_callback = url_update_callback;

    this.current_perspective_id = initial_perspective_id;
    this.current_data_type = initial_data_type_id;

    // Be aware, constructor of PartitionDiagram has side-effects on this.container, DOM stuff being what it is
    this.diagram = new PartitionDiagram(this.container, { height: 700 });

    const current_perspective_options = _.chain(this.all_perspectives)
      .filter((perspective) => perspective.data_type === initial_data_type_id)
      .sortBy((perspective) =>
        perspective.id === initial_perspective_id ? -Infinity : Infinity
      )
      .map((perspective) => {
        return {
          id: perspective.id,
          name: perspective.name,
        };
      })
      .value();

    const sorted_data_types_options = _.sortBy(
      this.all_data_types,
      (data_type) =>
        data_type.id === initial_data_type_id ? -Infinity : Infinity
    );

    this.container
      .select(".partition-diagram-outer-area")
      .insert("div", ":first-child")
      .classed("partition-controls", true)
      .html(
        text_maker("partition_controls", {
          perspective_options: current_perspective_options,
          data_type_options: sorted_data_types_options,
          info_icon_src: get_static_url("svg/info.svg"),
          search: true,
        })
      );

    this.container
      .insert("div", ":first-child")
      .classed("partition-notes container", true);

    this.container
      .insert("div", ":first-child")
      .classed("partition-bg-fill", true);

    this.container.select("input.search").on("keydown", () => {
      // Prevent enter key from submitting input form
      // (listening on the submit event seems less consistent than this approach)
      if (d3.event.which == 13) {
        d3.event.stopPropagation();
        d3.event.preventDefault();
      }
    });
    this.container.select("input.search").on("keyup", this.search_handler);

    this.container
      .select(".select_data_type")
      .on("change", this.change_data_type);
    this.container
      .select(".select_perspective")
      .on("change", this.change_perspective);
    this.container
      .select(".partition-controls--control > .partition-info-icon")
      .on("click", this.add_intro_popup);
    this.container
      .select(".partition-controls--control > .partition-info-icon")
      .on("keydown", () => {
        if (d3.event.which == 13) {
          this.add_intro_popup();
        }
      });

    this.update();
  }
  change_data_type = () => {
    this.current_data_type = d3.event.target.value;

    const current_perspective_options = _.chain(this.all_perspectives)
      .filter((perspective) => perspective.data_type === this.current_data_type)
      .sortBy((perspective) =>
        perspective.id === this.current_perspective_id ? -Infinity : Infinity
      )
      .map((perspective) => {
        return {
          id: perspective.id,
          text: perspective.name,
        };
      })
      .value();

    this.current_perspective_id = current_perspective_options[0].id;

    // Update presentation_schemes dropdown options
    const presentation_scheme_dropdown = this.container.select(
      ".select_perspective"
    );
    presentation_scheme_dropdown.selectAll("option").remove();
    presentation_scheme_dropdown
      .selectAll("option")
      .data(current_perspective_options)
      .enter()
      .append("option")
      .attr("value", (d) => d.id)
      .html((d) => d.text);

    // Blink background colour of .select-root form to indicate that the options have updated
    presentation_scheme_dropdown
      .transition()
      .duration(200)
      .ease(d3.easeLinear)
      .style("background-color", separatorColor)
      .transition()
      .duration(100)
      .ease(d3.easeLinear)
      .style("background-color", backgroundColor);

    this.update();
  };
  change_perspective = () => {
    this.current_perspective_id = d3.event.target.value;
    this.update();
  };
  update() {
    this.url_update_callback(
      this.current_perspective_id,
      this.current_data_type
    );

    this.current_perspective = _.chain(this.all_perspectives)
      .filter((perspective) => {
        return (
          perspective.id === this.current_perspective_id &&
          perspective.data_type === this.current_data_type
        );
      })
      .head()
      .value();

    this.update_diagram_notes(this.current_perspective.diagram_note_content);

    if (this.current_perspective.disable_search_bar) {
      this.disable_search_bar();
    } else {
      this.enable_search_bar();
    }

    // If search active then reapply to new hierarchy, else normal render
    const search_node = this.container.select("input.search").node();
    const query = search_node.value.toLowerCase();

    if (!search_node.disabled && query.length >= this.search_required_chars) {
      this.search_actual(query);
    } else {
      const hierarchy = this.current_perspective.hierarchy_factory();
      this.render_diagram(hierarchy);
    }
  }
  render_diagram(hierarchy, alternate_data_wrapper_node_rules) {
    const data_wrapper_node_rules = alternate_data_wrapper_node_rules
      ? alternate_data_wrapper_node_rules
      : this.current_perspective.data_wrapper_node_rules;

    this.diagram.configure_then_render({
      data: hierarchy,
      data_wrapper_node_rules: data_wrapper_node_rules,
      dont_fade: this.dont_fade,
      formatter: this.current_perspective.formatter,
      level_headers: this.current_perspective.level_headers,
      root_text_func: this.current_perspective.root_text_func,
      popup_template: this.current_perspective.popup_template,
      colors: newIBDarkCategoryColors,
      background_color: primaryColor,
    });
  }
  enable_search_bar() {
    const partition_control_search_block = this.container
      .selectAll(".partition-controls--control")
      .filter(function () {
        return this.querySelectorAll(".form-control.search").length;
      });
    const partition_control_search_input = partition_control_search_block.select(
      ".form-control.search"
    );
    if (partition_control_search_input.property("disabled")) {
      partition_control_search_input.property("disabled", false);

      partition_control_search_block
        .transition()
        .duration(300)
        .ease(d3.easeLinear)
        .style("opacity", "1")
        .style(
          "height",
          partition_control_search_block.node().previousElementSibling
            .offsetHeight + "px"
        );
    }
  }
  disable_search_bar() {
    const partition_control_search_block = this.container
      .selectAll(".partition-controls--control")
      .filter(function () {
        return this.querySelectorAll(".form-control.search").length;
      });
    const partition_control_search_input = partition_control_search_block.select(
      ".form-control.search"
    );
    if (!partition_control_search_input.property("disabled")) {
      this.dont_fade = [];

      partition_control_search_input.property("disabled", true);

      partition_control_search_block
        .transition()
        .duration(300)
        .ease(d3.easeLinear)
        .style("opacity", "0")
        .style("height", "0px");
    }
  }
  // Where the actual search happens
  search_actual(query) {
    const search_tree = this.current_perspective.hierarchy_factory();
    const deburred_query = _.chain(query).trim().deburr().lowerCase().value();

    const search_matching = [];
    let nonunique_dont_fade_arrays = [];
    search_tree.each((node) => {
      if (!_.isNull(node.parent)) {
        if (node.data.search_string.indexOf(deburred_query) !== -1) {
          search_matching.push(node);

          nonunique_dont_fade_arrays = [
            nonunique_dont_fade_arrays,
            node,
            node.descendants(),
            node.ancestors(),
          ];
        }
      }
    });

    this.search_matching = search_matching;
    this.dont_fade = _.chain(nonunique_dont_fade_arrays)
      .flattenDeep()
      .uniq()
      .value();

    const to_open = this.dont_fade;
    const how_many_to_be_shown = (node) => {
      const partition = _.partition(node.children, (child) =>
        _.includes(to_open, child)
      );
      return partition;
    };

    const search_data_wrapper_node_rules = (node) => {
      (node.value = node[this.current_data_type]),
        (node.__value__ = node.value);
      node.open = true;
      node.how_many_to_show = how_many_to_be_shown;
    };

    this.render_diagram(search_tree, search_data_wrapper_node_rules);
  }
  // Deals with event details and debouncing
  search_handler = () => {
    d3.event.stopImmediatePropagation();
    d3.event.preventDefault();
    const query = d3.event.target.value.toLowerCase();
    this.search_matching = [] || this.search_matching;

    this.debounced_search =
      this.debounced_search ||
      _.debounce(this.search_actual, this.search_debounce_time);

    this.debounced_refresh =
      this.debounced_refresh ||
      _.debounce(function () {
        this.dont_fade = [];
        this.search_matching = [];
        this.update();
      }, this.search_debounce_time / 2);

    if (
      d3.event.keyCode === 9 ||
      d3.event.keyCode === 13 ||
      d3.event.keyCode === 37 ||
      d3.event.keyCode === 38 ||
      d3.event.keyCode === 39 ||
      d3.event.keyCode === 40
    ) {
      // Bail on enter, tab, and arrow keys. Note: this DOESN'T bail already debounced searches
      return;
    }
    if (query.length < this.search_required_chars) {
      this.debounced_search.cancel();
      if (query.length === 0) {
        this.debounced_refresh.call(this);
      }
    } else {
      this.debounced_refresh.cancel();
      this.debounced_search.call(this, query);
    }
  };
  add_intro_popup = () => {
    const partition_control_info = this.container.select(
      "#partition-control-info-button"
    );

    if (!partition_control_info.select(".partition-intro").node()) {
      const intro_popup = partition_control_info
        .append("div")
        .classed("partition-popup", true)
        .classed("partition-intro", true)
        .html(text_maker("partition_intro_popup"));

      const tab_catch_before = intro_popup
        .append("a")
        .attr("id", "tab-catch-before")
        .attr("tabindex", 0);

      const tab_catch_after = partition_control_info
        .insert("a", ".partition-info-icon")
        .attr("id", "tab-catch-after")
        .attr("tabindex", 0);

      const intro_popup_fader = this.container
        .select(".partition-diagram")
        .insert("div", ".partition-controls")
        .classed("partition-fader", true);

      const intro_popup_cleanup = function () {
        intro_popup.remove();
        intro_popup_fader.remove();
        tab_catch_after.remove();
      };

      intro_popup_fader.on("click", intro_popup_cleanup);
      tab_catch_before.on("focusout", intro_popup_cleanup);
      tab_catch_after.on("focusout", intro_popup_cleanup);
    } else {
      partition_control_info
        .select("div.partition-popup.partition-intro")
        .remove();
      this.container.select("div.partition-fader").remove();
      partition_control_info.select("a.tab-catch-after").remove();
    }
  };
  update_diagram_notes(note_content) {
    const diagram_note_div = this.container.select(".partition-notes");
    if (!note_content) {
      // smoothly transition the height and opacity 0
      diagram_note_div
        .style("height", this.offsetHeight + "px")
        .transition()
        .ease(d3.easePoly)
        .duration(600)
        .style("height", "0px")
        .style("opacity", 0);
      // NOTE: the react isn't unmounted here, timing that to happen after the transition would be
      // more hacky than it is worth. Unmounting is done at the start of the next content-containing update
    } else {
      // unmount any existing (including currently hidden) notes
      ReactDOM.unmountComponentAtNode(diagram_note_div.node());

      // reset diagram-note div height and opacity
      diagram_note_div.style("height", "100%").style("opacity", 1);

      reactAdapter.render(
        <PartitionNotes note_content={note_content} />,
        diagram_note_div.node()
      );
    }
  }
  componentWillUnmount() {
    !_.isUndefined(this.debounced_search) && this.debounced_search.cancel();
    !_.isUndefined(this.debounced_refresh) && this.debounced_refresh.cancel();
  }
}
