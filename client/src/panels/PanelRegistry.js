import _ from "lodash";

import { get_footnotes_by_subject_and_topic } from "src/models/footnotes/footnotes";

import { assign_to_dev_helper_namespace } from "src/core/assign_to_dev_helper_namespace";

import { rpb_link, get_appropriate_rpb_subject } from "src/rpb/rpb_link";
import { Table } from "src/tables/TableClass";

const panel_store = {};

export class PanelRegistry {
  static get panels() {
    return panel_store;
  }

  static get_full_key_for_subject_type = (key, subject_type) =>
    `${key}:${subject_type}`;

  static is_registered_key(key) {
    return _.some(
      panel_store,
      ({ key: registered_key }) => registered_key === key
    );
  }

  static is_registered_full_key(full_key) {
    return full_key in panel_store;
  }

  static is_registered_key_for_subject_type(key, subject_type) {
    return PanelRegistry.is_registered_full_key(
      PanelRegistry.get_full_key_for_subject_type(key, subject_type)
    );
  }

  static register_instance(instance) {
    const { full_key } = instance;

    if (PanelRegistry.is_registered_full_key(full_key)) {
      throw new Error(`Panel ${full_key} has already been defined`);
    }

    panel_store[full_key] = instance;
  }

  static lookup(key, subject_type) {
    const full_key = PanelRegistry.get_full_key_for_subject_type(
      key,
      subject_type
    );

    if (!PanelRegistry.is_registered_full_key(full_key)) {
      throw new Error(
        `Lookup found nothing for panel key "${key}" and subject type "${subject_type}"`
      );
    }

    return panel_store[full_key];
  }

  constructor(provided_def) {
    const panel_def_defaults = {
      table_dependencies: [],
      calculate: _.constant(true),
      get_dataset_keys: _.constant([]),
      get_data_source_keys: _.property("derived_source_keys"),
      get_topic_keys: _.property("derived_topic_keys"),
      machinery_footnotes: true, // TODO could be always included along with derived keys to get_topic_keys, panels could ommit as desired from there
      glossary_keys: [],
    };
    const panel_def = { ...panel_def_defaults, ...provided_def };

    Object.assign(this, panel_def);

    // Wrap provided callbacks with memoization and currying
    this.calculate = _.memoize(
      (subject) => panel_def.calculate({ subject, tables: this.tables }),
      ({ guid }) => guid
    );

    this.get_title = (subject) =>
      panel_def.get_title({
        subject,
        calculations: this.calculate(subject),
      });

    this.get_dataset_keys = (subject) =>
      panel_def.get_dataset_keys({
        subject,
        calculations: this.calculate(subject),
      });

    this.get_data_source_keys = (subject) =>
      panel_def.get_dataset_keys({
        subject,
        calculations: this.calculate(subject),
        derived_source_keys:
          this.derive_data_source_keys_from_datasets(subject),
      });

    this.get_topic_keys = (subject) =>
      panel_def.get_topic_keys({
        subject,
        calculations: this.calculate(subject),
        derived_topic_keys:
          this.derive_topic_keys_from_data_sources_and_datasets(subject),
      });

    this.render = (subject, options = {}) =>
      panel_def.render(
        {
          subject,
          calculations: this.calculate(subject),
          title: this.get_title(subject),
          sources: this.get_source(subject),
          footnotes: this.get_footnotes(subject),
          glossary_keys: this.glossary_keys,
        },
        options
      );

    PanelRegistry.register_instance(this);
  }

  get full_key() {
    return PanelRegistry.get_full_key_for_subject_type(
      this.key,
      this.subject_type
    );
  }

  get tables() {
    return _.chain(this.table_dependencies)
      .map((table_id) => [table_id, Table.store.lookup(table_id)])
      .fromPairs()
      .value();
  }

  is_panel_valid_for_subject(subject) {
    if (this.subject_type !== subject.subject_type) {
      return false;
    }

    // Enforces that panels with table dependencies actually have data for the given subject, unless they're explicitly ok with "missing info"
    // TODO: This is something panels should handle themselves. Troublesome that the PanelRegistry
    // makes this sort of check for dept tables but not CR or program tables. One way or another, this
    // will go away when we drop tables all together
    if (
      this.subject_type === "dept" &&
      this.missing_info !== "ok" &&
      _.some(this.tables, ({ depts }) => depts && !depts[subject.id])
    ) {
      return false;
    }

    // returning false from a calculate is the primary way for a panel to communicate that it shouldn't render for the given subject,
    // small hacky double-purpose to the current calculate function API. TODO standalone should_panel_render function?
    if (!this.calculate(subject)) {
      return false;
    }

    return true;
  }

  derive_data_source_keys_from_datasets(_subject) {
    return []; // TODO
  }
  get_source(subject) {
    if (this.source === false) {
      return [];
    }
    if (_.isFunction(this.source)) {
      return this.source(subject);
    } else {
      return _.map(this.tables, (table) => {
        return {
          html: table.name,
          href: rpb_link({
            subject: get_appropriate_rpb_subject(subject).guid,
            table: table.id,
            mode: "details",
          }),
        };
      });
    }
  }

  derive_topic_keys_from_data_sources_and_datasets(_subject) {
    return []; // TODO
  }
  get footnote_concept_keys() {
    if (this.footnotes === false) {
      return [];
    } else if (_.isArray(this.footnotes)) {
      return _.chain(this.footnotes)
        .concat(this.machinery_footnotes ? ["MACHINERY"] : [])
        .uniqBy()
        .value();
    } else {
      return _.chain(this.tables)
        .map("tags")
        .compact()
        .flatten()
        .concat(this.machinery_footnotes ? ["MACHINERY"] : [])
        .uniqBy()
        .value();
    }
  }
  get_footnotes(subject) {
    const footnote_concepts = this.footnote_concept_keys;

    return _.chain(
      get_footnotes_by_subject_and_topic(subject, footnote_concepts)
    )
      .uniqBy("text")
      .compact()
      .value();
  }
}

assign_to_dev_helper_namespace({ PanelRegistry });
