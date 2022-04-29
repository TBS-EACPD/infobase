import _ from "lodash";

import { get_footnotes_by_subject_and_topic } from "src/models/footnotes/footnotes";

import { Datasets } from "src/models/metadata/Datasets";
import { Sources } from "src/models/metadata/Sources";

import { assign_to_dev_helper_namespace } from "src/core/assign_to_dev_helper_namespace";

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
      legacy_table_dependencies: [],
      calculate: _.constant(true),
      get_dataset_keys: _.constant([]),
      get_source_keys: _.property("derived_source_keys"),
      get_topic_keys: _.property("derived_topic_keys"),
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

    this.get_source_keys = (subject) =>
      panel_def.get_source_keys({
        subject,
        calculations: this.calculate(subject),
        derived_source_keys: this.derive_source_keys_from_datasets(subject),
      });

    this.get_topic_keys = (subject) =>
      panel_def.get_topic_keys({
        subject,
        calculations: this.calculate(subject),
        derived_topic_keys:
          this.derive_topic_keys_from_sources_and_datasets(subject),
      });

    this.render = (subject, options = {}) =>
      panel_def.render(
        {
          subject,
          calculations: this.calculate(subject),
          title: this.get_title(subject),
          sources: this.get_sources(subject),
          datasets: this.get_datasets(subject),
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
    return _.chain(this.legacy_table_dependencies)
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

  get_datasets(subject) {
    return _.map(this.get_dataset_keys(subject), (key) => Datasets[key]);
  }
  derive_source_keys_from_datasets(subject) {
    return _.chain(this.get_datasets(subject))
      .flatMap("source_keys")
      .uniq()
      .value();
  }
  get_sources(subject) {
    return _.map(this.get_source_keys(subject), (key) => Sources[key]);
  }

  derive_topic_keys_from_sources_and_datasets(subject) {
    const dataset_topic_keys = _.flatMap(
      this.get_datasets(subject),
      "topic_keys"
    );
    const source_topic_keys = _.flatMap(this.get_sources(subject), "topic_key");
    return _.uniq([...dataset_topic_keys, ...source_topic_keys, "MACHINERY"]);
  }
  get_footnotes(subject) {
    return _.chain(
      get_footnotes_by_subject_and_topic(subject, this.get_topic_keys(subject))
    )
      .uniqBy("text")
      .compact()
      .value();
  }
}

export const declare_panel = ({
  panel_key,
  subject_types,
  panel_config_func,
}) => {
  // HACK WARNING: redeclarations on the same panel_key are quietly thrown out here, with no warning.
  // With the current flow for loading panels from the infographic route via `get_panels_for_subject`, which was designed for bundle splitting,
  // these declare_panel calls are repeated on every infographic bubble load. Untangling this will be a thorny TODO, but until we do there's
  // going to be a potential blind spot on miss-use of `declare_panel` and/or reused panel keys

  if (!PanelRegistry.is_registered_key(panel_key)) {
    subject_types.forEach(
      (subject_type) =>
        new PanelRegistry({
          subject_type,
          key: panel_key,
          ...panel_config_func(subject_type, panel_key),
        })
    );
  }

  return panel_key;
};

assign_to_dev_helper_namespace({ PanelRegistry });
