import _ from "lodash";
import React, { Fragment } from "react";

import { glossaryEntryStore } from "src/models/glossary";
import { query_search_services } from "src/models/services/services_queries";
import { Dept, Gov, Program, CRSO, ProgramTag } from "src/models/subjects";

import { trivial_text_maker } from "src/models/text";

import { textColor } from "src/style_constants/index";
import { Table } from "src/tables/TableClass";

import {
  get_simplified_search_phrase,
  search_phrase_to_all_words_regex,
  highlight_search_match,
  SearchHighlighter,
} from "./search_utils";

const get_re_matcher = (accessors, search_phrase) => (obj) => {
  const regex = search_phrase_to_all_words_regex(search_phrase);

  return _.chain(accessors)
    .map((accessor) => (_.isString(accessor) ? obj[accessor] : accessor(obj)))
    .some((str) => {
      if (!_.isString(str)) {
        return false;
      } else {
        return _.deburr(str).match(regex);
      }
    })
    .value();
};

function create_re_matcher(search_phrase, accessors) {
  const re_matcher = get_re_matcher(accessors, search_phrase);

  const nonce = _.random(0.1, 1.1);
  let nonce_use_count = 0;

  return _.memoize(re_matcher, (obj) =>
    !_.isUndefined(obj.id) ? obj.id : nonce + nonce_use_count++
  );
}
const memoized_re_matchers = _.memoize(
  create_re_matcher,
  (search_phrase, accessors, config_name) =>
    get_simplified_search_phrase(search_phrase) + config_name
);

const default_menu_content_function = (data, search_phrase, name_function) => (
  <SearchHighlighter search={search_phrase} content={name_function(data)} />
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
    <SearchHighlighter
      search={search}
      content={`${name} (${trivial_text_maker("limited_data")})`}
    />
  </span>
);
const org_templates = {
  header_function: () => trivial_text_maker("orgs"),
  name_function: (org) => org.name,
  menu_content_function: function (org, search, name_function) {
    if (org.subject_type === "gov") {
      return <SearchHighlighter search={search} content={name_function(org)} />;
    }

    const result_name = (() => {
      const name_like_attribute_matched = _.find(
        [
          "name",
          "legal_title",
          "old_name",
          "other_lang_applied_title",
          "other_lang_legal_title",
        ],
        (attribute) => get_re_matcher([attribute], search)(org)
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
        case "other_lang_applied_title":
          return `${org.name} (${org.other_lang_applied_title})`;
        case "other_lang_legal_title":
          return `${org.name} (${org.other_lang_legal_title})`;
        default:
          return org.name;
      }
    })();

    if (!org.has_table_data) {
      return LimitedDataDisplay(search, result_name);
    } else {
      return <SearchHighlighter search={search} content={result_name} />;
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

  const with_or_without = (boolean) => (boolean ? "with" : "without");
  const config_name = `orgs_${orgs_to_include}_${with_or_without(
    include_gov
  )}_gov_${with_or_without(!reject_dead_orgs)}_dead`;

  const org_data = (() => {
    switch (orgs_to_include) {
      case "all":
        return Dept.store.get_all();
      case "with_data":
        return Dept.depts_with_table_data();
      case "without_data":
        return Dept.depts_without_table_data();
      default:
        throw new Error(
          `Error: make_orgs_search_config option orgs_to_include is an enum, {"all", "with_data", "without_data"}. Given value of "${orgs_to_include}" is invalid.`
        );
    }
  })();

  return {
    ...org_templates,
    config_name,
    query: (search_phrase) =>
      Promise.resolve(
        _.chain(org_data)
          .thru((data) => (include_gov ? [Gov.instance].concat(data) : data))
          .thru((data) => (reject_dead_orgs ? _.reject(data, "is_dead") : data))
          .filter((org) =>
            memoized_re_matchers(
              search_phrase,
              org_attributes_to_match,
              config_name
            )(org)
          )
          .value()
      ),
  };
};

const all_dp_orgs = {
  ...org_templates,
  query: (search_phrase) =>
    Promise.resolve(
      _.filter(
        Dept.store.get_all(),
        (org) =>
          org.is_dp_org &&
          memoized_re_matchers(
            search_phrase,
            org_attributes_to_match,
            "all_dp_orgs"
          )(org)
      )
    ),
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
          __html: highlight_search_match(
            search,
            glossaryItem.get_compiled_definition()
          ),
        }}
      />
    </Fragment>
  ),
  query: (search_phrase) =>
    Promise.resolve(
      _.filter(glossaryEntryStore.get_all(), (glossary_entry) =>
        memoized_re_matchers(
          search_phrase,
          glossary_attributes_to_match,
          "glossary"
        )(glossary_entry)
      )
    ),
};

const glossary_lite = {
  config_name: "glossary_lite",
  header_function: () => trivial_text_maker("glossary"),
  name_function: _.property("title"),
  menu_content_function: default_menu_content_function,
  query: (search_phrase) =>
    Promise.resolve(glossary_lite.query_sync(search_phrase)),
  //Temporary sync solution for simple glossary sidebar needs
  query_sync: (search_phrase) =>
    _.filter(glossaryEntryStore.get_all(), (glossary_entry) =>
      memoized_re_matchers(
        search_phrase,
        glossary_attributes_to_match,
        "glossary_lite"
      )(glossary_entry)
    ),
};

const gocos = {
  config_name: "gocos",
  header_function: () =>
    `${ProgramTag.subject_name} - ${ProgramTag.tag_roots_by_id.GOCO.name}`,
  name_function: _.property("name"),
  menu_content_function: default_menu_content_function,
  query: (search_phrase) =>
    Promise.resolve(
      _.filter(
        ProgramTag.store.get_all(),
        (tag) =>
          tag.root.id === "GOCO" &&
          tag.has_programs &&
          memoized_re_matchers(search_phrase, ["name"], "gocos")(tag)
      )
    ),
};

const how_we_help = {
  config_name: "how_we_help",
  header_function: () =>
    `${ProgramTag.subject_name} - ${ProgramTag.tag_roots_by_id.HWH.name}`,
  name_function: _.property("name"),
  menu_content_function: default_menu_content_function,
  query: (search_phrase) =>
    Promise.resolve(
      _.filter(
        ProgramTag.store.get_all(),
        (tag) =>
          tag.root.id === "HWH" &&
          tag.has_programs &&
          memoized_re_matchers(search_phrase, ["name"], "how_we_help")(tag)
      )
    ),
};

const who_we_help = {
  config_name: "who_we_help",
  header_function: () =>
    `${ProgramTag.subject_name} - ${ProgramTag.tag_roots_by_id.WWH.name}`,
  name_function: _.property("name"),
  menu_content_function: default_menu_content_function,
  query: (search_phrase) =>
    Promise.resolve(
      _.filter(
        ProgramTag.store.get_all(),
        (tag) =>
          tag.root.id === "WWH" &&
          tag.has_programs &&
          memoized_re_matchers(search_phrase, ["name"], "who_we_help")(tag)
      )
    ),
};

const datasets = {
  config_name: "datasets",
  header_function: () => trivial_text_maker("build_a_report"),
  name_function: (table) => table.name,
  menu_content_function: default_menu_content_function,
  query: (search_phrase) =>
    Promise.resolve(
      _.chain(Table.store.get_all())
        .reject("reference_table")
        .map((t) => ({
          name: t.name,
          flat_tag_titles: _.chain(t.tags)
            .map(
              (key) =>
                glossaryEntryStore.has(key) && glossaryEntryStore.lookup(key)
            )
            .compact()
            .map("title")
            .compact()
            .thru((titles) => titles.join(" "))
            .value(),
          table: t,
        }))
        .filter(
          memoized_re_matchers(
            search_phrase,
            ["name", "flat_tag_titles"],
            "datasets"
          )
        )
        .value()
    ),
};

const program_or_crso_search_name = ({ is_internal_service, name, dept }) =>
  is_internal_service ? name : `${name} - ${dept.name}`;

const programs = {
  config_name: "programs",
  header_function: () => trivial_text_maker("programs"),
  name_function: program_or_crso_search_name,
  menu_content_function: function (program, search, name_function) {
    const name = name_function(program);

    if (program.old_name) {
      const regex = search_phrase_to_all_words_regex(search);

      const matched_on_current_name = _.deburr(program.name).match(regex);
      const matched_on_old_name = _.deburr(program.old_name).match(regex);

      if (matched_on_old_name && !matched_on_current_name) {
        return (
          <SearchHighlighter
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
            <SearchHighlighter
              search={search}
              content={`${name} (${trivial_text_maker("non_active_program")})`}
            />
          </span>
        );
      } else {
        return <SearchHighlighter search={search} content={name} />;
      }
    }
  },
  query: (search_phrase) =>
    Promise.resolve(
      _.filter(Program.store.get_all(), (program) =>
        memoized_re_matchers(
          search_phrase,
          ["name", "old_name", "activity_code"],
          "programs"
        )(program)
      )
    ),
};

//only include CRs because SO's have really really long names
const crsos = {
  config_name: "crsos",
  header_function: () => trivial_text_maker("core_resps"),
  name_function: program_or_crso_search_name,
  menu_content_function: default_menu_content_function,
  query: (search_phrase) =>
    Promise.resolve(
      _.filter(
        CRSO.store.get_all(),
        (crso) =>
          crso.is_cr &&
          memoized_re_matchers(
            search_phrase,
            ["name", "activity_code"],
            "crsos"
          )(crso)
      )
    ),
};

const services = {
  config_name: "services",
  header_function: () => trivial_text_maker("services"),
  name_function: (service) =>
    `${service.name} - ${Dept.store.lookup(service.org_id).name}`,
  menu_content_function: default_menu_content_function,
  query: (search_phrase) =>
    query_search_services({
      search_phrase: get_simplified_search_phrase(search_phrase),
    }),
};

export {
  highlight_search_match,
  make_orgs_search_config,
  all_dp_orgs,
  crsos,
  programs,
  gocos,
  how_we_help,
  who_we_help,
  datasets,
  glossary,
  glossary_lite,
  services,
};
