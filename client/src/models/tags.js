import _ from "lodash";

import { trivial_text_maker } from "src/models/text";

import { Dept } from "./organizational_entities";
import {
  mix,
  exstensibleStoreMixin,
  PluralSingular,
  SubjectMixin,
} from "./storeMixins";

const extensible_subject_store = () =>
  mix().with(exstensibleStoreMixin, PluralSingular, SubjectMixin);

const tag_roots = [];
const Tag = class Tag extends extensible_subject_store() {
  static get tag_roots() {
    return _.chain(tag_roots)
      .map((tag_root) => [tag_root.id, tag_root])
      .fromPairs()
      .value();
  }
  static get subject_type() {
    return "tag";
  }
  static get singular() {
    return trivial_text_maker("tag");
  }
  static get plural() {
    return trivial_text_maker("tag") + "s";
  }
  static create_and_register(def) {
    const inst = new Tag(def);
    this.register(inst.id, inst);
    return inst;
  }
  static create_new_root(def) {
    const root = this.create_and_register(def);
    root.root = root;
    tag_roots.push(root);
    return root;
  }
  static get gocos_by_spendarea() {
    const goco_root = _.find(tag_roots, { id: "GOCO" });
    return goco_root.children_tags;
  }
  constructor(attrs) {
    super();
    Object.assign(
      this,
      {
        programs: [],
        children_tags: [],
      },
      attrs
    );
  }
  singular() {
    if (this.root.id === "GOCO") {
      if (this.parent_tag && _.includes(tag_roots, this.parent_tag)) {
        return trivial_text_maker("spend_area");
      } else {
        return trivial_text_maker("goco");
      }
    } else {
      if (!_.isEmpty(this.programs) && _.isEmpty(this.children_tags)) {
        return trivial_text_maker("tag");
      } else {
        return trivial_text_maker("tag_category");
      }
    }
  }
  plural() {
    if (this.root.id === "GOCO") {
      if (this.parent_tag && _.includes(tag_roots, this.parent_tag)) {
        return trivial_text_maker("spend_areas");
      } else {
        return trivial_text_maker("gocos");
      }
    } else {
      if (!_.isEmpty(this.programs) && _.isEmpty(this.children_tags)) {
        return trivial_text_maker("tag") + "(s)";
      } else {
        return trivial_text_maker("tag_categories");
      }
    }
  }
  get number_of_tagged() {
    return this.programs.length;
  }
  get is_lowest_level_tag() {
    return !_.isEmpty(this.programs);
  }
  get has_planned_spending() {
    return (
      this.is_lowest_level_tag &&
      _.some(this.programs, (program) => program.has_planned_spending)
    );
  }
  get planned_spending_gaps() {
    return (
      this.is_lowest_level_tag &&
      _.some(this.programs, (program) => !program.has_planned_spending)
    );
  }
  tagged_by_org() {
    return (
      _.chain(this.programs)
        //.filter(tagged => tagged.dept)
        .groupBy((prog) => prog.dept.id)
        .toPairs()
        .map(([org_id, programs]) => {
          return {
            name: Dept.lookup(org_id).name,
            programs: _.sortBy(programs, "name"),
          };
        })
        .sortBy("name")
        .value()
    );
  }
  get is_m2m() {
    return this.root.cardinality === "MtoM";
  }
  related_tags() {
    return _.chain(this.programs)
      .map((prog) => prog.tags)
      .flatten()
      .filter((tag) => tag.root.id === this.root.id)
      .uniqBy()
      .without(this)
      .value();
  }
};

export { Tag };
