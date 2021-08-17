import _ from "lodash";

import { trivial_text_maker } from "src/models/text";

import { BaseSubjectFactory } from "src/models/utils/BaseSubjectFactory";
import { make_static_store } from "src/models/utils/make_static_store";

import { Dept } from "./organizational_entities";

type TagDef = {
  id: string;
  name: string;
  description: string;
  cardinality: string;
  parent_tag?: Tag;
  root?: Tag;
};

const tag_roots: Tag[] = [];
export class Tag extends BaseSubjectFactory(
  "tag",
  trivial_text_maker("tag"),
  trivial_text_maker("tag") + "s"
) {
  static get tag_roots() {
    return _.chain(tag_roots)
      .map((tag_root) => [tag_root.id, tag_root])
      .fromPairs()
      .value();
  }
  static get gocos_by_spendarea() {
    const goco_root = _.find(tag_roots, { id: "GOCO" });
    return goco_root?.children_tags;
  }

  id: string;
  name: string;
  description: string;
  cardinality: string;
  root: Tag;

  parent_tag?: Tag;

  programs = [] as any[]; // SUBJECT_TS_TODO come back to once programs are typed
  children_tags = [] as Tag[];

  constructor({
    id,
    name,
    description,
    cardinality,
    parent_tag,
    root,
  }: TagDef) {
    super({ id });

    this.id = id;
    this.name = name;
    this.description = description;
    this.cardinality = cardinality;
    this.parent_tag = parent_tag;

    if (typeof root === "undefined") {
      tag_roots.push(this);
      this.root = this;
    } else {
      this.root = root;
    }
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
  get is_m2m() {
    return this.cardinality === "MtoM";
  }
  tagged_by_org() {
    return _.chain(this.programs)
      .groupBy((prog) => prog.dept.id)
      .toPairs()
      .map(([org_id, programs]) => {
        return {
          name: Dept.lookup(org_id).name,
          programs: _.sortBy(programs, "name"),
        };
      })
      .sortBy("name")
      .value();
  }
  related_tags() {
    return _.chain(this.programs)
      .map((prog) => prog.tags)
      .flatten()
      .filter((tag) => tag.root.id === this.root.id)
      .uniq()
      .without(this)
      .value();
  }
}

export const tagStore = make_static_store((def: TagDef) => {
  return new Tag(def);
});
