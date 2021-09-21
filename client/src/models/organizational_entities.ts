import _ from "lodash";

import { trivial_text_maker } from "src/models/text";

import {
  mix,
  staticStoreMixin,
  PluralSingular,
  SubjectMixin,
  CanHaveServerData,
} from "./utils/BaseSubjectFactory";

const static_subject_store = () =>
  mix().with(staticStoreMixin, PluralSingular, SubjectMixin);
const static_subject_store_with_server_data = (data_types: string[]) =>
  mix().with(
    staticStoreMixin,
    PluralSingular,
    SubjectMixin,
    CanHaveServerData(data_types)
  );

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type ConstructorType = { [key: string]: any };

interface DeptDefinition {
  unique_id: string;
  dept_code: string;
  abbr: string;
  legal_title: string;
  applied_title: string;
  old_applied_title: string;
  status: string;
  legislation: string;
  raw_mandate: string;
  mandate: string;
  pas_code: string;
  schedule: string;
  faa_hr: string;
  auditor_str: string;
  incorp_yr: string;
  fed_ownership: string;
  end_yr: string;
  notes: string;
  _dp_status: string;
  eval_url: string;
  website_url: string;
  le_la: string;
  du_de_la: string;
  other_lang_abbr: string;
  other_lang_applied_title: string;
  other_lang_legal_title: string;
}

interface CRSODefinition {
  dept: typeof Dept;
  id: string;
  activity_code: string;
  name: string;
  description: string;
  is_active: boolean;
  is_drf: boolean;
  is_internal_service: boolean;
}

interface ProgramDefinition {
  crso: typeof CRSO;
  activity_code: string;
  dept: typeof Dept;
  description: string;
  name: string;
  old_name: string;
  is_active: boolean;
  is_internal_service: boolean;
  is_fake: boolean;
}

const Dept = class Dept extends static_subject_store_with_server_data([
  "results",
  "services",
  "covid",
]) {
  static lookup(org_id: string) {
    return super.lookup(_.isNaN(+org_id) ? org_id : +org_id);
  }
  static get subject_type() {
    return "dept";
  }
  static get singular() {
    return trivial_text_maker("org");
  }
  static get plural() {
    return trivial_text_maker("orgs");
  }
  static depts_with_data() {
    //lazy initialized
    if (!this._depts_with_data) {
      this._depts_with_data = _.filter(
        this.get_all(),
        (dept) => !_.isEmpty(dept.table_ids)
      );
    }
    return this._depts_with_data;
  }
  static depts_without_data() {
    //lazy initialized
    if (!this._depts_without_data) {
      this._depts_without_data = _.filter(this.get_all(), (dept) =>
        _.isEmpty(dept.table_ids)
      );
    }
    return this._depts_without_data;
  }
  static create_and_register(def: DeptDefinition) {
    const inst = new Dept(def);
    this.register(inst.id, inst);
    if (!_.isEmpty(inst.dept_code)) {
      this.register(inst.dept_code, inst);
    }
    return inst;
  }
  constructor(def: DeptDefinition) {
    super();
    Object.assign(
      this,
      {
        id: def.unique_id,
        name: def.applied_title || def.legal_title,
        old_name: def.old_applied_title,
        minister_objs: [],
        table_ids: [],
        crsos: [],
      },
      def
    );
  }

  get programs() {
    return _.chain(this.crsos).map("programs").flatten().compact().value();
  }
  // TODO: these hardcoded rules are horrible, need the pipeline to include flags somewhere so planned spending status can be managed as data
  get has_planned_spending() {
    const is_categorically_exempt = _.includes(
      ["crown_corp", "parl_ent", "spec_op_agency", "joint_enterprise"],
      this.inst_form.id
    );

    const is_special_case = _.includes(
      ["CSEC", "CSIS", "IJC", "GG"],
      this.dept_code
    );

    return !(is_categorically_exempt || is_special_case);
  }
  get is_rpp_org() {
    return this.dp_status !== false;
  }
  get dp_status() {
    const val = this._dp_status;
    if (val === 1) {
      return "fw";
    } else if (val === 0) {
      return "sw";
    } else {
      return false;
    }
  }
  get tables() {
    return this.table_ids;
  }
  get min() {
    return this.ministry.name;
  }
  get minister() {
    return _.map(this.ministers, "name");
  }
  get type() {
    // not a great variable name, but too hard to fix all the instances that could exist
    return this.inst_form.name;
  }
  get auditor() {
    return this.auditor_str;
  }
  get is_dead() {
    return (
      !_.isEmpty(this.end_yr) || this.status !== trivial_text_maker("active")
    );
  }
  /*
    POPULATION GROUPS:

    fps (schedule I, faa_hr in (IV,V)
      cpa (schedule I, faa_hr IV)
        min_depts (schedule I)
        cpa_other_portion (schedule IV)
      separate_agencies (faa_hr V)
    na (schedule not I, faa_hr NULL)

  */
  get pop_group_gp_key() {
    const { schedule, faa_hr } = this;
    if (schedule === "I" || _.includes(["IV", "V"], faa_hr)) {
      return "fps";
    } else {
      return "na";
    }
  }
  get pop_group_parent_key() {
    const { schedule, faa_hr } = this;
    if (this.pop_group_gp_key === "fps") {
      if (schedule === "I" || faa_hr === "IV") {
        return "cpa";
      } else {
        return "separate_agencies";
      }
    } else {
      return undefined;
    }
  }
  get granular_pop_group_key() {
    const { schedule } = this;
    if (this.pop_group_parent_key === "cpa") {
      if (schedule === "I") {
        return "cpa_min_depts";
      } else {
        return "cpa_other_portion";
      }
    } else {
      return undefined;
    }
  }
};

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
  static unique_id(dept: typeof Dept | string, activity_code: string) {
    //dept can be an object, a dept_code or a dept unique_id.
    const dc = _.isObject(dept) ? dept.dept_code : Dept.lookup(dept).dept_code;
    return `${dc}-${activity_code}`;
  }
  static get_from_activity_code(
    dept_code: typeof Dept | string,
    activity_code: string
  ) {
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

//Currently doesnt do anything, not even link to other departments
const Minister = class Minister extends static_subject_store() {
  static get subject_type() {
    return "minister";
  }
  static get singular() {
    return trivial_text_maker("minister");
  }
  static get plural() {
    return trivial_text_maker("minister");
  }

  static create_and_register(id: string, name: string) {
    const inst = new Minister(id, name);
    this.register(inst.id, inst);
    return inst;
  }
  constructor(id: string, name: string) {
    super();
    this.id = id;
    this.name = name;
    this.description = "";
  }
};

const InstForm = class InstForm extends static_subject_store() {
  static get subject_type() {
    return "inst_form";
  }
  static get singular() {
    return trivial_text_maker("inst_form");
  }
  static get plural() {
    return trivial_text_maker("inst_forms");
  }
  static grandparent_forms() {
    return _.filter(this.get_all(), (obj) => _.isEmpty(obj.parent_forms));
  }
  static parent_forms() {
    return _.filter(
      this.get_all(),
      (obj) => obj.parent_form && !_.isEmpty(obj.children_forms)
    );
  }
  static leaf_forms() {
    return _.filter(this.get_all(), (obj) => _.isEmpty(obj.children_forms));
  }
  static create_and_register(id: string, name: string) {
    const inst = new InstForm(id, name);
    this.register(inst.id, inst);
    return inst;
  }
  constructor(id: string, name: string) {
    super();
    Object.assign(this, {
      id,
      name,
      //Below will be populated by the creator
      parent_form: null,
      children_forms: [],
      orgs: [],
    });
  }
};

export { Dept, CRSO, Program, InstForm, Minister };
