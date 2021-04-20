import _ from "lodash";
import React from "react";
import MediaQuery from "react-responsive";
import { withRouter } from "react-router";

import { CheckBox, DropdownMenu } from "src/components/index.js";

import { create_text_maker } from "src/models/text.js";

import { breakpoints } from "src/core/breakpoint_defs.js";
import { is_a11y_mode } from "src/core/injected_build_constants.js";

import { IconGear } from "src/icons/icons.js";

import { smart_href_template } from "src/link_utils.js";

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
import { SearchConfigTypeahead } from "./SearchConfigTypeahead.js";

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
            svg_style={{ verticalAlign: "14px" }}
            alternate_color="false"
          />
        </div>
        <MediaQuery minWidth={breakpoints.minMediumDevice}>
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
      const { placeholder, hide_utility_buttons } = this.props;

      const option_checkboxes = _.map(
        search_options_hierarchy,
        this.option_node_to_component
      );

      return (
        <div className="col-12 col-lg-12 p-0">
          <SearchConfigTypeahead
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
            on_select={this.onSelect}
            additional_a11y_description={text_maker(
              "everything_search_additional_a11y_description"
            )}
          />
        </div>
      );
    }
    option_node_is_parent = (option_node) =>
      !_.isEmpty(option_node.child_options);
    option_node_should_be_displayed = (option_node, option_key) => {
      if (this.option_node_is_parent(option_node)) {
        return _.chain(option_node.child_options)
          .map(this.option_node_should_be_displayed)
          .some()
          .value();
      } else {
        return _.chain(this.state).keys().includes(option_key).value();
      }
    };
    option_node_to_component = (option_node, option_key) => {
      if (this.option_node_should_be_displayed(option_node, option_key)) {
        if (this.option_node_is_parent(option_node)) {
          const has_checked_child_option = _.chain(option_node.child_options)
            .map((_child_node, child_key) => this.state[child_key])
            .some()
            .value();

          return (
            <div key={option_key} style={{ width: "100%" }}>
              {!is_a11y_mode && (
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
              <ul style={{ listStyle: "none" }}>
                {_.map(option_node.child_options, (option_node, option_key) => (
                  <li key={option_key}>
                    {this.option_node_to_component(option_node, option_key)}
                  </li>
                ))}
              </ul>
            </div>
          );
        } else {
          return (
            <CheckBox
              container_style={{ padding: 3 }}
              key={option_key}
              label={option_node.label}
              active={this.state[option_key]}
              onClick={() =>
                this.setState({
                  [option_key]: !this.state[option_key],
                })
              }
            />
          );
        }
      }
    };
  }
);
EverythingSearch.defaultProps = {
  placeholder: text_maker("everything_search_placeholder"),
  href_template: (item) => smart_href_template(item, "/"),
  hide_utility_buttons: false,

  reject_gov: false,
  reject_dead_orgs: true,

  // true and it's on by default, false and it's off but can still potentially be turned on in the options menu,
  // excluded from the initial_search_options object and it is off AND not available in the option menu
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
