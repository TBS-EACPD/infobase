import _ from "lodash";
import React from "react";
import MediaQuery from "react-responsive";
import { withRouter } from "react-router";

import { is_a11y_mode } from "src/core/injected_build_constants.js";

import { CheckBox, DropdownMenu } from "../components/index.js";
import { breakpoints } from "../core/breakpoint_defs.js";
import { IconGear } from "../icons/icons.js";

import { smart_href_template } from "../link_utils.js";
import { create_text_maker } from "../models/text.js";

import {
  make_orgs_search_config,
  crsos as crso_search_config,
  programs as program_search_config,
  gocos as gocos_search_config,
  horizontal_initiative as horizontal_initiative_search_config,
  how_we_help as how_we_help_search_config,
  who_we_help as who_we_help_search_config,
  datasets as table_search_config,
  glossary_lite as glossary_lite_search_config,
} from "./search_configs.js";
import { Typeahead } from "./Typeahead/Typeahead.js";

import text from "./EverythingSearch.yaml";
import "./EverythingSearch.scss";

const text_maker = create_text_maker(text);

const search_options_hierarchy = {
  org_options: {
    label: text_maker("orgs"),
    child_options: {
      include_orgs_normal_data: {
        label: text_maker("include_orgs_normal_data_label"),
      },
      include_orgs_limited_data: {
        label: text_maker("include_orgs_limited_data_label"),
      },
    },
  },
  crso_and_program_options: {
    label: text_maker("crso_and_prog_label"),
    child_options: {
      include_crsos: { label: text_maker("core_resps") },
      include_programs: { label: text_maker("programs") },
    },
  },
  tag_options: {
    label: text_maker("tag_categories"),
    child_options: {
      include_tags_goco: { label: text_maker("goco_tag") },
      include_tags_hi: { label: text_maker("hi_tag") },
      include_tags_hwh: { label: text_maker("hwh_tag") },
      include_tags_wwh: { label: text_maker("wwh_tag") },
    },
  },
  other_options: {
    label: text_maker("other_options_label"),
    child_options: {
      include_glossary: { label: text_maker("glossary") },
      include_tables: { label: text_maker("metadata") },
    },
  },
};

const SearchOptions = ({ option_checkboxes }) => (
  <DropdownMenu
    key="EverythingSearchDropdownMenu"
    dropdown_trigger_txt={
      <div
        style={{
          whiteSpace: "nowrap",
        }}
      >
        <div
          style={{
            display: "inline-block",
            marginRight: "21px",
          }}
        >
          <IconGear
            height="1px"
            width="1px"
            vertical_align="14px"
            alternate_color="false"
          />
        </div>
        <MediaQuery minWidth={breakpoints.minSmallDevice}>
          <span>{text_maker("options")}</span>
        </MediaQuery>
      </div>
    }
    dropdown_a11y_txt={text_maker("search_options")}
    opened_button_class_name={"btn-ib-light--reversed--with-icon"}
    closed_button_class_name={"btn-ib-light--with-icon"}
    dropdown_content_class_name="no-right"
    dropdown_content={
      <fieldset>
        <legend>{text_maker("everything_search_description")}:</legend>
        <div className="everything-search-options">{option_checkboxes}</div>
      </fieldset>
    }
  />
);

const EverythingSearch = withRouter(
  class EverythingSearch extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        ...props.initial_search_options,
      };
    }
    get_search_configs = () => {
      const { reject_gov, reject_dead_orgs } = this.props;

      const {
        include_orgs_normal_data,
        include_orgs_limited_data,

        include_crsos,
        include_programs,

        include_tags_goco,
        include_tags_hi,
        include_tags_hwh,
        include_tags_wwh,

        include_glossary,
        include_tables,
      } = this.state;

      const orgs_to_include =
        include_orgs_normal_data && include_orgs_limited_data
          ? "all"
          : include_orgs_limited_data
          ? "without_data"
          : include_orgs_normal_data
          ? "with_data"
          : false;

      return _.compact([
        orgs_to_include &&
          make_orgs_search_config({
            orgs_to_include,
            reject_dead_orgs,
            include_gov: !reject_gov,
          }),

        include_crsos && crso_search_config,
        include_programs && program_search_config,
        include_tags_goco && gocos_search_config,
        include_tags_hi && horizontal_initiative_search_config,
        include_tags_hwh && how_we_help_search_config,
        include_tags_wwh && who_we_help_search_config,
        include_tables && table_search_config,
        include_glossary && glossary_lite_search_config,
      ]);
    };
    onSelect = (item) => {
      const { onSelect, href_template, history } = this.props;

      if (_.isFunction(onSelect)) {
        onSelect(item);
      } else if (_.isFunction(href_template)) {
        history.push(href_template(item));
      }
    };
    render() {
      const {
        placeholder,
        hide_utility_buttons,
        page_size,
        on_query,
      } = this.props;

      const search_options = this.state;

      const option_node_to_component = (option_node, option_key) => {
        if (!_.isEmpty(option_node.child_options)) {
          const has_checked_child_option = _.chain(option_node.child_options)
            .map((_child_node, child_key) => search_options[child_key])
            .some()
            .value();

          const has_children_to_display = !(
            _.size(option_node.child_options) === 1 &&
            _.chain(option_node.child_options).map("label").first().value() ===
              option_node.label
          );

          return (
            <div key={option_key} style={{ width: "100%" }}>
              {(!is_a11y_mode ||
                (is_a11y_mode && !has_children_to_display)) && (
                <CheckBox
                  label={option_node.label}
                  active={has_checked_child_option}
                  container_style={{ padding: 3 }}
                  onClick={() =>
                    this.setState(
                      _.chain(option_node.child_options)
                        .map((_child_node, child_key) => [
                          child_key,
                          !has_checked_child_option,
                        ])
                        .fromPairs()
                        .value()
                    )
                  }
                />
              )}
              {has_children_to_display && (
                <ul style={{ listStyle: "none" }}>
                  {_.map(
                    option_node.child_options,
                    (option_node, option_key) => (
                      <li key={option_key}>
                        {option_node_to_component(option_node, option_key)}
                      </li>
                    )
                  )}
                </ul>
              )}
            </div>
          );
        } else {
          const should_be_displayed = _.chain(search_options)
            .keys()
            .includes(option_key)
            .value();

          if (should_be_displayed) {
            return (
              <CheckBox
                container_style={{ padding: 3 }}
                key={option_key}
                label={option_node.label}
                active={search_options[option_key]}
                onClick={() =>
                  this.setState({
                    [option_key]: !search_options[option_key],
                  })
                }
              />
            );
          }
        }
      };
      const option_checkboxes = _.map(
        search_options_hierarchy,
        option_node_to_component
      );

      return (
        <div>
          <div className="col-md-12">
            <Typeahead
              placeholder={placeholder}
              search_configs={this.get_search_configs()}
              utility_buttons={
                !hide_utility_buttons && [
                  <SearchOptions
                    key="SearchOptions"
                    option_checkboxes={option_checkboxes}
                  />,
                ]
              }
              page_size={page_size}
              on_query={on_query}
              on_select={this.onSelect}
            />
          </div>
        </div>
      );
    }
  }
);
EverythingSearch.defaultProps = {
  placeholder: text_maker("everything_search_placeholder"),
  href_template: (item) => smart_href_template(item, "/"),
  hide_utility_buttons: false,
  page_size: 30,

  reject_gov: false,
  reject_dead_orgs: true,

  initial_search_options: {
    include_orgs_normal_data: true,
    include_orgs_limited_data: true,

    include_crsos: true,
    include_programs: true,

    include_tags_goco: true,
    include_tags_hi: true,
    include_tags_hwh: true,
    include_tags_wwh: true,

    include_glossary: false,
    include_tables: false,
  },
};

export { EverythingSearch };
