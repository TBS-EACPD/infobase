import _ from "lodash";

import { Program } from "src/models/structure";
import { trivial_text_maker } from "src/models/text";

import { BaseSubjectFactory } from "src/models/utils/BaseSubjectFactory";
import { make_store } from "src/models/utils/make_store";

type TagDef = {
  id: string;
  name: string;
  description: string;
  cardinality: string;
  parent_tag?: Tag;
  root?: Tag;
};

// Interface merging to fill in type system blind spot, see note on Object.assign(this, def) in BaseSubjectFactory's constructor
export interface Tag extends TagDef {
  root: Tag;
}

const tag_roots: Tag[] = [];
export class Tag extends BaseSubjectFactory<TagDef>("tag") {
  static store = make_store((def: TagDef) => {
    return new Tag(def);
  });

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

  children_tags: Tag[] = [];
  programs: Program[] = [];

  constructor(def: TagDef) {
    super(def);

    if (typeof def.root === "undefined") {
      tag_roots.push(this);
      this.root = this;
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
  get related_tags() {
    return _.chain(this.programs)
      .map((prog) => prog.tags)
      .flatten()
      .filter((tag) => tag.root.id === this.root.id)
      .uniq()
      .without(this)
      .value();
  }

  // TODO funky legacy junk, but search configs and the tag explorer at least use it. Should probably review and clean up
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
}
