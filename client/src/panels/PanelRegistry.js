import _ from "lodash";

import { get_footnotes_by_subject_and_topic } from "src/models/footnotes/footnotes";

import { assign_to_dev_helper_namespace } from "src/core/assign_to_dev_helper_namespace";

import { rpb_link, get_appropriate_rpb_subject } from "src/rpb/rpb_link";
import { Table } from "src/tables/TableClass";

const create_full_panel_key = (key, subject_type) => `${key}:${subject_type}`;

const default_args = {
  table_dependencies: [],
  glossary_keys: [],
  machinery_footnotes: true,
};

const panels = {};
class PanelRegistry {
  static get panels() {
    return panels;
  }

  static is_registered_full_key(panel_key) {
    return panel_key in panels;
  }

  static is_registered_key_base(key_base) {
    return _.some(
      panels,
      ({ key_base: registered_key_base }) => registered_key_base === key_base
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
    const full_key = create_full_panel_key(key, subject_type);

    if (!PanelRegistry.is_registered_full_key(full_key)) {
      throw new Error(
        `Bad panel key "${full_key}" - no panel for subject type "${subject_type}" with key "${key}"`
      );
    }

    return panels[full_key];
  }

  constructor(def) {
    Object.assign(this, default_args, _.omit(def, ["render", "calculate"]), {
      calculate: def.calculate ? _.memoize(def.calculate) : _.constant(true),
      _inner_render: def.render,
      key_base: def.key,
      full_key: create_full_panel_key(def.key, def.subject_type),
    });

    this.constructor.register_instance(this);
  }

  get tables() {
    return _.chain(this.table_dependencies)
      .map((table_id) => [table_id, Table.store.lookup(table_id)])
      .fromPairs()
      .value();
  }

  is_panel_valid_for_subject(subject, options = {}) {
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

    // returning false from a calculate is the primary way for a panel to communicate that it shouldn't render for the given subject
    if (!this.calculate(subject, this.tables, options)) {
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

  render(subject, options = {}) {
    const calculations = this.calculate(subject, this.tables, options);

    const sources = this.get_source(subject);

    const footnotes = this.get_footnotes(subject);

    const react_el = this._inner_render(
      {
        subject,
        calculations,
        title: this.get_title(subject, calculations),
        sources,
        footnotes,
        glossary_keys: this.glossary_keys,
      },
      options
    );

    return react_el;
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
