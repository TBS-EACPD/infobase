import _ from "lodash";
import React, { Fragment } from "react";

import { GlossaryEntry } from "src/models/glossary.js";
import { Subject } from "src/models/subject.js";
import { trivial_text_maker } from "src/models/text.js";

import { textColor } from "src/core/color_defs.js";
import { Table } from "src/core/TableClass.js";

import {
  query_to_reg_exps,
  highlight_search_match,
  InfoBaseHighlighter,
} from "./search_utils.js";

const { Dept, Gov, Program, Tag, CRSO } = Subject;

const get_re_matcher = (accessors, reg_exps) => (obj) =>
  _(accessors)
    .map((accessor) => (_.isString(accessor) ? obj[accessor] : accessor(obj)))
    .some((str) => {
      if (!_.isString(str)) {
        return false;
      } else {
        str = _.deburr(str);
        return _.every(reg_exps, (re) => str.match(re));
      }
    });

function create_re_matcher(query, accessors, config_name) {
  const reg_exps = query_to_reg_exps(query);

  const re_matcher = get_re_matcher(accessors, reg_exps);

  const nonce = _.random(0.1, 1.1);
  let nonce_use_count = 0;

  return _.memoize(re_matcher, (obj) =>
    !_.isUndefined(obj.id) ? obj.id : nonce + nonce_use_count++
  );
}
const memoized_re_matchers = _.memoize(
  create_re_matcher,
  (query, accessors, config_name) => query + config_name
);

const org_attributes_to_match = [
  "legal_title",
  "applied_title",
  "old_name",
  "abbr",
  "other_lang_abbr",
  "other_lang_applied_title",
  "other_lang_legal_title",
  "pas_code",
];
const LimitedDataDisplay = (search, name) => (
  <span className="typeahead__grayed-out">
    <InfoBaseHighlighter
      search={search}
      content={`${name} (${trivial_text_maker("limited_data")})`}
    />
  </span>
);
const org_templates = {
  header_function: () => Dept.plural,
  name_function: (org) => org.name,
  menu_content_function: function (org, search) {
    if (org.level === "gov") {
      return (
        <InfoBaseHighlighter
          search={search}
          content={this.name_function(org)}
        />
      );
    }

    const result_name = (() => {
      const reg_exps = query_to_reg_exps(search);

      const name_like_attribute_matched = _.find(
        ["name", "legal_title", "old_name"],
        (attribute) => get_re_matcher([attribute], reg_exps)(org)
      );

      switch (name_like_attribute_matched) {
        case "legal_title":
          return `${org.name} (${trivial_text_maker("legal_title")}: ${
            org.legal_title
          })`;
        case "old_name":
          return `${org.name} (${trivial_text_maker("previously_named")}: ${
            org.old_name
          })`;
        default:
          return org.name;
      }
    })();

    if (_.isEmpty(org.tables)) {
      return LimitedDataDisplay(search, result_name);
    } else {
      return <InfoBaseHighlighter search={search} content={result_name} />;
    }
  },
};

const org_search_config_option_defaults = {
  orgs_to_include: "all",
  include_gov: true,
  reject_dead_orgs: true,
};
const make_orgs_search_config = (options) => {
  const { orgs_to_include, include_gov, reject_dead_orgs } = {
    ...org_search_config_option_defaults,
    ...options,
  };

  const org_data = (() => {
    switch (orgs_to_include) {
      case "all":
        return Dept.get_all();
      case "with_data":
        return Dept.depts_with_data();
      case "without_data":
        return Dept.depts_without_data();
      default:
        throw new Error(
          `Error: make_orgs_search_config option orgs_to_include is an enum, {"all", "with_data", "without_data"}. Given value of "${orgs_to_include}" is invalid.`
        );
    }
  })();
  const get_data = () =>
    _.chain(org_data)
      .thru((data) => (include_gov ? [Gov].concat(data) : data))
      .thru((data) => (reject_dead_orgs ? _.reject(data, "is_dead") : data))
      .value();

  const with_or_without = (boolean) => (boolean ? "with" : "without");
  const config_name = `orgs_${orgs_to_include}_${with_or_without(
    include_gov
  )}_gov_${with_or_without(!reject_dead_orgs)}_dead`;

  return {
    ...org_templates,
    get_data,
    filter: (query, datum) =>
      memoized_re_matchers(query, org_attributes_to_match, config_name)(datum),
    config_name,
  };
};

const all_dp_orgs = {
  ...org_templates,
  get_data: () => _.filter(Dept.get_all(), "dp_status"),
  filter: (query, datum) =>
    memoized_re_matchers(query, org_attributes_to_match, "all_dp_orgs")(datum),
};

const glossary_attributes_to_match = ["definition", "title"];

const glossary = {
  config_name: "glossary",
  header_function: () => trivial_text_maker("glossary"),
  name_function: _.property("title"),
  menu_content_function: (glossaryItem, search) => (
    <Fragment>
      <div
        style={{
          fontSize: "14px",
          lineHeight: "1.8em",
          padding: "5px 0px",
        }}
        dangerouslySetInnerHTML={{
          __html: highlight_search_match(search, glossaryItem.title),
        }}
      />
      <div
        style={{
          fontSize: "12px",
          lineHeight: 1,
          padding: "0px 20px 20px 20px",
          color: textColor,
        }}
        dangerouslySetInnerHTML={{
          __html: highlight_search_match(search, glossaryItem.definition),
        }}
      />
    </Fragment>
  ),
  get_data: () => GlossaryEntry.get_all(),
  filter: (query, datum) =>
    memoized_re_matchers(
      query,
      glossary_attributes_to_match,
      "glossary"
    )(datum),
};

const glossary_lite = {
  config_name: "glossary_lite",
  header_function: () => trivial_text_maker("glossary"),
  name_function: _.property("title"),
  get_data: () => GlossaryEntry.get_all(),
  filter: (query, datum) =>
    memoized_re_matchers(
      query,
      glossary_attributes_to_match,
      "glossary_lite"
    )(datum),
};

const gocos = {
  config_name: "gocos",
  header_function: () => `${Tag.plural} - ${Tag.tag_roots.GOCO.name}`,
  name_function: _.property("name"),
  get_data: () =>
    _.chain(Tag.get_all())
      .filter((tag) => tag.root.id === "GOCO")
      .filter("is_lowest_level_tag")
      .value(),
  filter: (query, datum) =>
    memoized_re_matchers(query, ["name"], "gocos")(datum),
};

const how_we_help = {
  config_name: "how_we_help",
  header_function: () => `${Tag.plural} - ${Tag.tag_roots.HWH.name}`,
  name_function: _.property("name"),
  get_data: () =>
    _.chain(Tag.get_all())
      .filter((tag) => tag.root.id === "HWH")
      .filter("is_lowest_level_tag")
      .value(),
  filter: (query, datum) =>
    memoized_re_matchers(query, ["name"], "how_we_help")(datum),
};

const who_we_help = {
  config_name: "who_we_help",
  header_function: () => `${Tag.plural} - ${Tag.tag_roots.WWH.name}`,
  name_function: _.property("name"),
  get_data: () =>
    _.chain(Tag.get_all())
      .filter((tag) => tag.root.id === "WWH")
      .filter("is_lowest_level_tag")
      .value(),
  filter: (query, datum) =>
    memoized_re_matchers(query, ["name"], "who_we_help")(datum),
};

const horizontal_initiative = {
  config_name: "horizontal_initiative",
  header_function: () => `${Tag.plural} - ${Tag.tag_roots.HI.name}`,
  name_function: _.property("name"),
  get_data: () =>
    _.chain(Tag.get_all())
      .filter((tag) => tag.root.id === "HI")
      .filter("is_lowest_level_tag")
      .value(),
  filter: (query, datum) =>
    memoized_re_matchers(query, ["name"], "horizontal_initiative")(datum),
};

const datasets = {
  config_name: "datasets",
  header_function: () => trivial_text_maker("build_a_report"),
  name_function: (table) => table.title,
  get_data: () =>
    _.chain(Table.get_all())
      .reject("reference_table")
      .map((t) => ({
        name: t.name,
        title: t.title,
        flat_tag_titles: _.chain(t.tags)
          .map((key) => GlossaryEntry.lookup(key))
          .compact()
          .map("title")
          .compact()
          .thru((titles) => titles.join(" "))
          .value(),
        table: t,
      }))
      .value(),
  filter: (query, datum) =>
    memoized_re_matchers(query, ["name", "flat_tag_titles"], "datasets")(datum),
};

const program_or_crso_search_name = ({ is_internal_service, name, dept }) =>
  is_internal_service ? name : `${name} - ${dept.name}`;

const programs = {
  config_name: "programs",
  header_function: () => trivial_text_maker("programs"),
  name_function: program_or_crso_search_name,
  get_data: () => Program.get_all(),
  filter: (query, datum) =>
    memoized_re_matchers(
      query,
      ["name", "old_name", "activity_code"],
      "programs"
    )(datum),
  menu_content_function: function (program, search) {
    const name = this.name_function(program);

    if (program.old_name) {
      const reg_exps = query_to_reg_exps(search);

      const matched_on_current_name = _.every(reg_exps, (re) =>
        _.deburr(program.name).match(re)
      );
      const matched_on_old_name = _.every(reg_exps, (re) =>
        _.deburr(program.old_name).match(re)
      );

      if (matched_on_old_name && !matched_on_current_name) {
        return (
          <InfoBaseHighlighter
            search={search}
            content={`${name} (${trivial_text_maker("previously_named")}: ${
              program.old_name
            })`}
          />
        );
      }
    } else {
      if (program.is_dead) {
        return (
          <span className="typeahead__grayed-out">
            <InfoBaseHighlighter
              search={search}
              content={`${name} (${trivial_text_maker("non_active_program")})`}
            />
          </span>
        );
      } else {
        return <InfoBaseHighlighter search={search} content={name} />;
      }
    }
  },
};

//only include CRs because SO's have really really long names
const crsos = {
  config_name: "crsos",
  header_function: () => trivial_text_maker("core_resps"),
  name_function: program_or_crso_search_name,
  get_data: () => _.filter(CRSO.get_all(), "is_cr"),
  filter: (query, datum) =>
    memoized_re_matchers(query, ["name", "activity_code"], "crsos")(datum),
};

export {
  highlight_search_match,
  make_orgs_search_config,
  all_dp_orgs,
  crsos,
  programs,
  gocos,
  horizontal_initiative,
  how_we_help,
  who_we_help,
  datasets,
  glossary,
  glossary_lite,
};
