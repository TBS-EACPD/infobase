import _ from "lodash";

import { trivial_text_maker } from "src/models/text";

import { make_store } from "src/models/utils/make_store";

import { sanitized_marked } from "src/general_utils";

import { BaseSubjectFactory } from "./BaseSubjectFactory";

import { CRSO } from "./CRSO";

interface DeptDef {
  id: string;
  dept_code?: string;
  abbr?: string;
  legal_title: string;
  applied_title?: string;
  old_applied_title?: string;
  status_code: string;
  legislation?: string;
  raw_mandate?: string;
  pas_code?: string;
  schedule?: string;
  faa_hr?: string;
  auditor?: string;
  incorp_yr: string;
  fed_ownership?: string;
  end_yr?: string;
  notes?: string;
  dp_status_code: string;
  ministry_id?: string;
  inst_form_id: string;
  eval_url?: string;
  dept_website?: string;
  le_la: string;
  du_de_la: string;
  other_lang_abbr?: string;
  other_lang_legal_title: string;
  other_lang_applied_title?: string;

  minister_ids: string[];
  table_ids: string[];
  crso_ids: string[];
}

type MinisterDef = {
  id: string;
  name: string;
};

type MinistryDef = {
  id: string;
  name: string;
};

type InstFormDef = {
  id: string;
  name: string;
  parent_id?: string;
};
interface InstForm extends InstFormDef {
  parent_form?: InstForm;
}

// Interface merging to fill in type system blind spot, see note on Object.assign(this, def) in BaseSubjectFactory's constructor, pending future TS features
export interface Dept extends DeptDef {} // eslint-disable-line @typescript-eslint/no-empty-interface

// Another quirk with BaseSubjectFactory, subject_type's mustbe const and provided in the generic type and value arguments, pending future TS features
const dept_subject_type = "dept" as const;

export class Dept extends BaseSubjectFactory<DeptDef, typeof dept_subject_type>(
  dept_subject_type,
  trivial_text_maker("orgs"),
  ["results", "services", "covid", "people_data"]
) {
  static store = make_store(
    (def: DeptDef) => new Dept(def),
    (dept) => _.compact([dept.dept_code, +dept.id])
  );

  static ministerStore = make_store((def: MinisterDef) => def);
  static ministryStore = make_store((def: MinistryDef) => def);
  static instFormStore = make_store(
    (def: InstFormDef): InstForm => ({
      ...def,
      get parent_form() {
        return def.parent_id
          ? Dept.instFormStore.lookup(def.parent_id)
          : undefined;
      },
    })
  );

  static lookup_by_minister_id(id: string) {
    return _.filter(Dept.store.get_all(), ({ minister_ids }) =>
      _.includes(minister_ids, id)
    );
  }
  static lookup_by_ministry_id(id: string) {
    return _.filter(
      Dept.store.get_all(),
      ({ ministry_id }) => ministry_id === id
    );
  }
  static lookup_by_inst_form_id(id: string) {
    return _.filter(
      Dept.store.get_all(),
      ({ inst_form_id }) => inst_form_id === id
    );
  }

  get ministers() {
    return _.map(this.minister_ids, Dept.ministerStore.lookup);
  }
  get ministry() {
    // TODO fair number of IGOC orgs have no ministry, should there be an explicit "Other" entity in the ministry store to hold those?
    return typeof this.ministry_id !== "undefined"
      ? Dept.ministryStore.lookup(this.ministry_id)
      : undefined;
  }
  get inst_form() {
    return Dept.instFormStore.lookup(this.inst_form_id);
  }

  static depts_with_table_data() {
    return _.filter(Dept.store.get_all(), (dept) => dept.has_table_data);
  }
  static depts_without_table_data() {
    return _.filter(Dept.store.get_all(), (dept) => !dept.has_table_data);
  }
  get has_table_data() {
    return !_.isEmpty(this.table_ids);
  }

  get crsos() {
    return _.map(this.crso_ids, CRSO.store.lookup);
  }
  get program_ids() {
    return _.map(this.programs, "id");
  }
  get programs() {
    return _.chain(this.crsos).map("programs").flatten().compact().value();
  }

  get name() {
    return this.applied_title || this.legal_title;
  }
  get old_name() {
    return this.old_applied_title;
  }
  get status() {
    switch (this.status_code) {
      case "a":
        return trivial_text_maker("active");
      case "t":
        return trivial_text_maker("transferred");
      case "d":
        return trivial_text_maker("dissolved");
      default:
        return "";
    }
  }
  get is_dp_org() {
    return this.dp_status_code === "1";
  }
  get has_planned_spending() {
    // TODO: these hardcoded rules are horrible, need the pipeline to include flags somewhere so planned spending status can be managed as data
    const is_categorically_exempt = _.includes(
      ["crown_corp", "parl_ent", "spec_op_agency", "joint_enterprise"],
      this.inst_form?.id
    );

    const is_special_case = _.includes(
      ["CSEC", "CSIS", "IJC", "GG"],
      this.dept_code
    );

    return !(is_categorically_exempt || is_special_case);
  }
  get is_dead() {
    return !_.isEmpty(this.end_yr) || this.status_code !== "a";
  }
  get mandate() {
    return sanitized_marked(_.trim(this.raw_mandate));
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
}
