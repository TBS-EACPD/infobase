import _ from "lodash";

import { get_footnotes_by_subject_and_topic } from "src/models/footnotes/footnotes";

import { assign_to_dev_helper_namespace } from "src/core/assign_to_dev_helper_namespace";

import { rpb_link, get_appropriate_rpb_subject } from "src/rpb/rpb_link";
import { Table } from "src/tables/TableClass";

const panels = {};

class PanelRegistry {
  static get panels() {
    return panels;
  }

  static get_full_key_for_subject_type = (key, subject_type) =>
    `${key}:${subject_type}`;

  static is_registered_key(key) {
    return _.some(panels, ({ key: registered_key }) => registered_key === key);
  }

  static is_registered_full_key(full_key) {
    return full_key in panels;
  }

  static is_registered_key_for_subject_type(key, subject_type) {
    return PanelRegistry.is_registered_full_key(
      PanelRegistry.get_full_key_for_subject_type(key, subject_type)
    );
  }

  static register_instance(instance) {
    const { full_key } = instance;

    if (PanelRegistry.is_registered_full_key(full_key)) {
      throw new Error(`panel ${full_key} has already been defined`);
    }

    panels[full_key] = instance;
  }

  static lookup(key, subject_type) {
    const full_key = PanelRegistry.get_full_key_for_subject_type(
      key,
      subject_type
    );

    if (!PanelRegistry.is_registered_full_key(full_key)) {
      throw new Error(
        `Bad panel key "${full_key}" - no panel for subject type "${subject_type}" with key "${key}"`
      );
    }

    return panels[full_key];
  }

  constructor(panel_def) {
    const panel_def_defaults = {
      table_dependencies: [],
      calculate: _.constant(true),
      machinery_footnotes: true,
      glossary_keys: [],
    };

    const def = { ...panel_def_defaults, ...panel_def };

    const calculate = _.memoize(
      (subject) => def.calculate(subject, this.tables),
      ({ subject_type, id }) => `${subject_type}:${id}`
    );

    const curry_getter_with_calculations = (getter) => (subject) =>
      getter(subject, calculate(subject));

    Object.assign(this, def, {
      full_key: PanelRegistry.get_full_key_for_subject_type(
        def.key,
        def.subject_type
      ),
      tables: _.chain(def.table_dependencies)
        .map((table_id) => [table_id, Table.store.lookup(table_id)])
        .fromPairs()
        .value(),
      calculate,
      get_title: curry_getter_with_calculations(def.get_title),
      render: (subject, options = {}) =>
        def.render(
          {
            subject,
            calculations: this.calculate(subject),
            title: this.get_title(subject),
            sources: this.get_source(subject),
            footnotes: this.get_footnotes(subject),
            glossary_keys: this.glossary_keys,
          },
          options
        ),
    });

    this.constructor.register_instance(this);
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
      _.some(
        this.table_dependencies,
        (t) =>
          Table.store.lookup(t).depts &&
          !Table.store.lookup(t).depts[subject.id]
      )
    ) {
      return false;
    }

    // returning false from a calculate is the primary way for a panel to communicate that it shouldn't render for the given subject,
    // small hacky double-purpose to the current calculate function API
    if (!this.calculate(subject)) {
      return false;
    }

    return true;
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
    //array of footnote strings

    const footnote_concepts = this.footnote_concept_keys;

    return _.chain(
      get_footnotes_by_subject_and_topic(subject, footnote_concepts)
    )
      .uniqBy("text") //some footnotes are duplicated to support different topics, years, orgs, etc.
      .compact()
      .value();
  }
}

const tables_for_panel = (panel_key, subject_type) =>
  _.chain(PanelRegistry.panels)
    .filter({ key: panel_key })
    .thru((panels) =>
      subject_type ? _.filter(panels, { subject_type }) : panels
    )
    .map("table_dependencies")
    .flatten()
    .uniqBy()
    .value();

export { PanelRegistry, tables_for_panel };

assign_to_dev_helper_namespace({ PanelRegistry });
