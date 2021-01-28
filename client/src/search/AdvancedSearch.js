import _ from "lodash";
import React from "react";
import { withRouter } from "react-router";

import { is_a11y_mode } from "src/core/injected_build_constants.js";

import { CheckBox } from "../components/CheckBox";

import { smart_href_template } from "../link_utils.js";
import { create_text_maker } from "../models/text.js";

import {
  make_orgs_search_config,
  crsos as crso_search_config,
  programs as program_search_config,
  gocos,
  horizontal_initiative,
  how_we_help,
  who_we_help,
  datasets as table_search_config,
  glossary_lite as glossary_lite_search_config,
} from "./search_configs.js";
import { Typeahead } from "./Typeahead/Typeahead.js";

import text from "./AdvancedSearch.yaml";
import "./AdvancedSearch.scss";
const text_maker = create_text_maker(text);

const get_tag_search_configs = (
  include_tags_goco,
  include_tags_hi,
  include_tags_hwh,
  include_tags_wwh
) =>
  _.compact([
    include_tags_goco && gocos,
    include_tags_hi && horizontal_initiative,
    include_tags_hwh && how_we_help,
    include_tags_wwh && who_we_help,
  ]);

const complete_option_hierarchy = {
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

const AdvancedSearch = withRouter(
  class AdvancedSearch extends React.Component {
    constructor(props) {
      super(props);

      this.state = { ...props.initial_configs };
    }
    render() {
      const optional_configs = this.state;

      const {
        disable_filter,
        initial_configs,
        reject_dead_orgs,
        href_template,
        onNewQuery,
        include_gov,
        placeholder,
        history,
      } = this.props;

      let { onSelect } = this.props;

      if (!onSelect && href_template) {
        onSelect = (item) => {
          history.push(href_template(item));
        };
      }

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
      } = initial_configs;

      const orgs_to_include =
        include_orgs_normal_data && include_orgs_limited_data
          ? "all"
          : include_orgs_limited_data
          ? "without_data"
          : include_orgs_normal_data
          ? "with_data"
          : false;

      const search_configs = _.compact([
        orgs_to_include &&
          make_orgs_search_config({
            include_gov,
            orgs_to_include,
            reject_dead_orgs,
          }),

        include_crsos ? crso_search_config : null,
        include_programs ? program_search_config : null,

        ...get_tag_search_configs(
          include_tags_goco,
          include_tags_hi,
          include_tags_hwh,
          include_tags_wwh
        ),

        include_tables ? table_search_config : null,
        include_glossary ? glossary_lite_search_config : null,
      ]);

      const option_node_to_component = (option_node, option_key) => {
        if (!_.isEmpty(option_node.child_options)) {
          const has_checked_child_option = _.chain(option_node.child_options)
            .map((child_node, child_key) => optional_configs[child_key])
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
                        .map((child_node, child_key) => [
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
          const should_be_displayed = _.chain(optional_configs)
            .keys()
            .includes(option_key)
            .value();

          if (should_be_displayed) {
            return (
              <CheckBox
                container_style={{ padding: 3 }}
                key={option_key}
                label={option_node.label}
                active={optional_configs[option_key]}
                onClick={() =>
                  this.setState({
                    [option_key]: !optional_configs[option_key],
                  })
                }
              />
            );
          }
        }
      };

      return (
        <div>
          <div className="col-md-12">
            <Typeahead
              onNewQuery={onNewQuery}
              placeholder={
                placeholder || text_maker("everything_search_placeholder")
              }
              search_configs={search_configs}
              onSelect={onSelect}
              filter_content={
                !disable_filter && (
                  <fieldset>
                    <legend>
                      {text_maker("advanced_search_description")}:
                    </legend>
                    <div className="advanced-search-options">
                      {_.map(
                        complete_option_hierarchy,
                        option_node_to_component
                      )}
                    </div>
                  </fieldset>
                )
              }
              is_filter_modified={_.isEqual(initial_configs, this.state)}
              pagination_size={30}
            />
          </div>
        </div>
      );
    }
  }
);
AdvancedSearch.defaultProps = {
  href_template: (item) => smart_href_template(item, "/"),
  include_gov: true,
  reject_dead_orgs: true,
  disable_filter: false,

  initial_configs: {
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
export { AdvancedSearch };
