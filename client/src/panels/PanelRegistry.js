import _ from "lodash";

import { get_footnotes_by_subject_and_topic } from "src/models/footnotes/footnotes";
import { subject_types } from "src/models/subjects";

import { assign_to_dev_helper_namespace } from "src/core/assign_to_dev_helper_namespace";
import { is_dev } from "src/core/injected_build_constants";

import { rpb_link, get_appropriate_rpb_subject } from "src/rpb/rpb_link";
import { Table } from "src/tables/TableClass";

const create_panel_key = (key, subject_type) => `${key}:${subject_type}`;

const default_args = {
  table_dependencies: [],
  machinery_footnotes: true,
};

const panels = {};
class PanelRegistry {
  static get panels() {
    return panels;
  }

  static lookup(key, subject_type) {
    const lookup = create_panel_key(key, subject_type);
    if (is_dev && !panels[lookup]) {
      // eslint-disable-next-line no-console
      console.error(
        `bad panel key - ${lookup} for subject_type ${subject_type}`
      );
      return null;
    }
    return panels[lookup];
  }

  static is_registered_panel_key(test_key) {
    return _.chain(panels)
      .keys(panels)
      .join()
      .thru((all_panel_keys) =>
        RegExp(`,${test_key}:.+,`).test(`,${all_panel_keys},`)
      )
      .value();
  }

  static register_instance(instance) {
    const { key, full_key, subject_type, title, is_static } = instance;

    if (!_.includes(subject_types, subject_type)) {
      throw new Error(
        `panel ${key}'s subject_type (${subject_type}) is not valid; subject_type is required and must correspond to a valid subject (one of ${_.join(
          subject_types,
          ", "
        )}).`
      );
    }
    if (!is_static && _.isUndefined(title)) {
      throw new Error(
        `panel ${key}'s title is undefined; title is required, unless the panel is "static"`
      );
    }

    if (full_key in panels) {
      throw new Error(`panel ${instance.key} has already been defined`);
    }

    panels[full_key] = instance;
  }

  constructor(def) {
    //note that everything attached to this is read-only
    //Additionally, every panel only has one object like this, so this object contains nothing about

    //we copy every thing except render and calculate, which follow a specific API
    const to_assign = _.omit(def, ["render", "calculate"]);

    const full_key = create_panel_key(def.key, def.subject_type);
    Object.assign(this, default_args, to_assign, { full_key });

    this._inner_render = def.render;
    this._inner_calculate = _.memoize(def.calculate || (() => true));

    this.constructor.register_instance(this);
  }

  get tables() {
    return _.chain(this.table_dependencies)
      .map((table_id) => [table_id, Table.store.lookup(table_id)])
      .fromPairs()
      .value();
  }

  is_panel_valid_for_subject(subject, options = {}) {
    //delegates to the proper subject_type's calculate function
    if (this.subject_type !== subject.subject_type) {
      return false;
    }

    // TODO: this is something panels should handle themselves. Troublesome that the PanelRegistry
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

    const panel_args = this._inner_calculate(subject, this.tables, options);
    if (panel_args === false) {
      return false;
    }

    return true;
  }

  calculate(subject, options = {}) {
    const panel_args = this._inner_calculate(subject, this.tables, options);

    return { subject, panel_args };
  }

  get_title(subject) {
    return _.isFunction(this.title) ? this.title(subject) : this.title;
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
    const calculations = this.calculate(subject, options);
    const title = this.get_title(subject);
    const sources = this.get_source(subject);
    const footnotes = this.get_footnotes(subject);
    const glossary_keys = this.glossary_keys || [];

    const react_el = this._inner_render(
      {
        calculations,
        title,
        sources,
        footnotes,
        glossary_keys,
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
