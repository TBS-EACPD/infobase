import _ from "lodash";

import FootNote from "src/models/footnotes/footnotes.js";

import { Subject } from "src/models/subject.js";

import { assign_to_dev_helper_namespace } from "src/core/assign_to_dev_helper_namespace.js";
import { is_dev } from "src/core/injected_build_constants.js";
import { Table } from "src/core/TableClass.js";

import { rpb_link, get_appropriate_rpb_subject } from "src/rpb/rpb_link.js";

const subjects = _.keys(Subject);

const create_panel_key = (key, level) => `${key}:${level}`;

const default_args = {
  depends_on: [],
  machinery_footnotes: true,
  layout: {
    full: { graph: 12, text: 12 },
  },
};

const panels = {};
class PanelRegistry {
  static get panels() {
    return panels;
  }

  static lookup(key, level) {
    const lookup = create_panel_key(key, level);
    if (is_dev && !panels[lookup]) {
      // eslint-disable-next-line no-console
      console.error(`bad panel key - ${lookup} for level ${level}`);
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

  static panels_for_table(table_id) {
    return _.filter(panels, ({ depends_on }) =>
      _.includes(depends_on, table_id)
    );
  }

  static panels_for_level(level_name) {
    return _.filter(panels, { level: level_name });
  }

  static register_instance(instance) {
    const { full_key, level } = instance;

    if (!_.includes(subjects, level)) {
      throw `panel ${instance.key} has an undefined level`;
    }
    if (full_key in panels) {
      throw `panel ${instance.key} has already been defined`;
    }

    panels[full_key] = instance;
  }

  new_api_warnings() {
    if (is_dev) {
      _.each(["layout_def", "text", "title"], (property) => {
        if (this[property]) {
          // eslint-disable-next-line no-console
          console.warning(`PanelRegistry redundant property: ${property}`);
        }
      });
    }
  }

  constructor(def) {
    this.new_api_warnings();

    //note that everything attached to this is read-only
    //Additionally, every panel only has one object like this, so this object contains nothing about

    //we copy every thing except render and calculate, which follow a specific API
    this._inner_calculate = def.calculate || (() => true);
    this._inner_render = def.render;
    const to_assign = _.omit(def, ["render", "calculate"]);
    const full_key = create_panel_key(def.key, def.level);
    Object.assign(this, default_args, to_assign, { full_key });
    this.constructor.register_instance(this);

    this.get_panel_args = _.memoize(this.get_panel_args);
  }

  get tables() {
    //table defs in depends_on indexed by their table ids
    return _.chain(this.depends_on)
      .map((table_id) => [table_id, Table.lookup(table_id)])
      .fromPairs()
      .value();
  }
  get_panel_args(subject, options) {
    const calc_func = this._inner_calculate;
    return calc_func.call(this, subject, options);
  }
  is_panel_valid_for_subject(subject, options = {}) {
    //delegates to the proper level's calculate function
    if (this.level !== subject.level) {
      return false;
    }
    // TODO: this is something panels should handle themselves. Troublesome that the PanelRegistry
    // makes this sort of check for dept tables but not CR or program tables. One way or another, this
    // will go away when we drop tables all together
    if (
      this.level === "dept" &&
      this.missing_info !== "ok" &&
      _.some(
        this.depends_on,
        (t) => Table.lookup(t).depts && !Table.lookup(t).depts[subject.id]
      )
    ) {
      return false;
    }
    const panel_args = this.get_panel_args(subject, options);
    if (panel_args === false) {
      return false;
    }
    return true;
  }

  calculate(subject, options = {}) {
    if (this.is_panel_valid_for_subject(subject, options)) {
      const panel_args = this.get_panel_args(subject, options);

      //inner_render API : a panel's inner_render fucntion usually wants access to panel_args and subject.
      return { subject, panel_args };
    } else {
      return false;
    }
  }

  get_source(subject) {
    if (this.source === false) {
      return [];
    }
    if (_.isFunction(this.source)) {
      return this.source(subject);
    } else {
      //if it's undefined we'll make one
      /* eslint-disable-next-line no-use-before-define */
      return _.chain(tables_for_panel(this.key, subject.level))
        .map((table) => Table.lookup(table))
        .map((table) => {
          return {
            html: table.name,
            href: rpb_link({
              subject: get_appropriate_rpb_subject(subject).guid,
              table: table.id,
              mode: "details",
            }),
          };
        })
        .value();
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

  get_glossary_keys() {
    return this.glossary_keys || [];
  }

  get_footnotes(subject) {
    //array of footnote strings

    const footnote_concepts = this.footnote_concept_keys;

    return _.chain(FootNote.get_for_subject(subject, footnote_concepts))
      .uniqBy("text") //some footnotes are duplicated to support different topics, years, orgs, etc.
      .compact()
      .value();
  }

  render(calculations, options = {}) {
    const { subject } = calculations;
    const render_func = this._inner_render;
    const footnotes = this.get_footnotes(subject);
    const glossary_keys = this.get_glossary_keys();
    const sources = this.get_source(subject);

    const react_el = render_func(
      {
        calculations,
        footnotes,
        glossary_keys,
        sources,
      },
      options
    );

    return react_el;
  }
}

function panels_with_key(key, level) {
  let panels = _.filter(PanelRegistry.panels, { key });
  if (level) {
    panels = _.filter(panels, { level });
  }
  return panels;
}

function tables_for_panel(panel_key, subject_level) {
  const panel_objs = panels_with_key(panel_key, subject_level);
  return _.chain(panel_objs).map("depends_on").flatten().uniqBy().value();
}

const layout_types = { full: "full", half: "half" };

export { PanelRegistry, layout_types, panels_with_key, tables_for_panel };

assign_to_dev_helper_namespace({ PanelRegistry });
