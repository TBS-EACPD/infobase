import _ from "lodash";
import React from "react";
import { withRouter } from "react-router";

import { trivial_text_maker } from "../models/text.js";

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

const EverythingSearch = withRouter(
  class EverythingSearch extends React.Component {
    render() {
      // Maintenance alert: any new search config props on the EverythingSearch must be manually synced with the AdvancedSearch
      // complete_option_hierarchy representation
      const {
        href_template,
        onNewQuery,
        history,

        include_gov,
        include_orgs_normal_data,
        include_orgs_limited_data,
        reject_dead_orgs,

        include_crsos,
        include_programs,

        include_tags_goco,
        include_tags_hi,
        include_tags_hwh,
        include_tags_wwh,

        include_tables,
        include_glossary,

        filter_content,
        is_original_filter,
      } = this.props;

      let { onSelect } = this.props;

      if (!onSelect && href_template) {
        onSelect = (item) => {
          history.push(href_template(item));
        };
      }

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

      return (
        <Typeahead
          onNewQuery={onNewQuery}
          placeholder={
            this.props.placeholder ||
            trivial_text_maker("everything_search_placeholder")
          }
          search_configs={search_configs}
          onSelect={onSelect}
          large={!!this.props.large}
          filter_content={filter_content}
          is_original_filter={is_original_filter}
          pagination_size={30}
        />
      );
    }
  }
);

EverythingSearch.defaultProps = {
  include_gov: true,
  include_orgs_normal_data: true,
  include_orgs_limited_data: true,
  reject_dead_orgs: true,

  include_crsos: true,
  include_programs: true,

  include_tags_goco: true,
  include_tags_hi: true,
  include_tags_hwh: true,
  include_tags_wwh: true,

  include_tables: true,
  include_glossary: true,
};

export { EverythingSearch };
