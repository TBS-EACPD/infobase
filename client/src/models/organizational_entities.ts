import _ from "lodash";

import { trivial_text_maker } from "src/models/text";

import {
  mix,
  staticStoreMixin,
  PluralSingular,
  SubjectMixin,
  CanHaveServerData,
} from "./utils/BaseSubjectFactory";

const static_subject_store_with_server_data = (data_types: string[]) =>
  mix().with(
    staticStoreMixin,
    PluralSingular,
    SubjectMixin,
    CanHaveServerData(data_types)
  );

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type ConstructorType = { [key: string]: any };

interface CRSODefinition {
  dept: any; // SUBJECT_TS_TODO type this once Dept type is solid
  id: string;
  activity_code: string;
  name: string;
  description: string;
  is_active: boolean;
  is_drf: boolean;
  is_internal_service: boolean;
}

interface ProgramDefinition {
  crso: any; // SUBJECT_TS_TODO type this once CRSO type is solid
  activity_code: string;
  dept: any; // SUBJECT_TS_TODO type this once Dept type is solid
  description: string;
  name: string;
  old_name: string;
  is_active: boolean;
  is_internal_service: boolean;
  is_fake: boolean;
}

const CRSO = class CRSO extends static_subject_store_with_server_data([
  "results",
  "services",
]) {
  static get subject_type() {
    return "crso";
  }
  static get singular() {
    return trivial_text_maker("core_resp");
  }
  static get plural() {
    return trivial_text_maker("core_resps");
  }
  // subject class getters always return CR, instance funcs below are type sensitive
  // fine for now, something to clean up when we finally drop SO's
  singular() {
    if (this.is_cr) {
      return trivial_text_maker("core_resp");
    } else {
      return trivial_text_maker("strategic_outcome");
    }
  }
  plural() {
    if (this.is_cr) {
      return trivial_text_maker("core_resps");
    } else {
      return trivial_text_maker("strategic_outcomes");
    }
  }
  static get_from_id(crso_id: string) {
    return this.lookup(crso_id);
  }
  static create_and_register(def: CRSODefinition) {
    const inst = new CRSO(def);
    this.register(inst.id, inst);
    return inst;
  }
  constructor(attrs: CRSODefinition) {
    super();
    Object.assign(
      this,
      {
        programs: [],
      },
      attrs
    );
  }
  get has_planned_spending() {
    return _.some(this.programs, (program) => program.has_planned_spending);
  }
  get is_cr() {
    return this.is_drf;
  }
  get is_dead() {
    return !this.is_active;
  }
};

const Program = class Program extends static_subject_store_with_server_data([
  "results",
  "services",
]) {
  static get subject_type() {
    return "program";
  }
  static get singular() {
    return trivial_text_maker("program");
  }
  static get plural() {
    return trivial_text_maker("programs");
  }
  static unique_id(dept: any, activity_code: string) {
    //dept can be an object, a dept_code or a dept unique_id.
    const dc = _.isObject(dept) ? dept.dept_code : Dept.lookup(dept).dept_code;
    return `${dc}-${activity_code}`;
  }
  static get_from_activity_code(dept_code: any, activity_code: string) {
    return this.lookup(this.unique_id(dept_code, activity_code));
  }
  static create_and_register(def: ProgramDefinition) {
    const inst = new Program(def);
    this.register(inst.id, inst);
    return inst;
  }
  constructor(attrs: ProgramDefinition) {
    super();
    Object.assign(
      this,
      {
        tags: [],
      },
      attrs
    );
    this.id = (this.constructor as ConstructorType).unique_id(
      this.dept,
      this.activity_code
    );
  }
  get tags_by_scheme() {
    return _.groupBy(this.tags, (tag) => tag.root.id);
  }
  get has_planned_spending() {
    return this.dept.has_planned_spending;
  }
  get link_to_infographic() {
    return `#orgs/program/${this.id}/infograph`;
  }
  get is_dead() {
    return !this.is_active;
  }
};

export { CRSO, Program };
