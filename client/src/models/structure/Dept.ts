import _ from "lodash";

import { trivial_text_maker } from "src/models/text";
import { BaseSubjectFactory } from "src/models/utils/BaseSubjectFactory";
import { make_store } from "src/models/utils/make_store";

import { sanitized_marked } from "src/general_utils";

import { CRSO } from "./CRSO";
import { InstForm } from "./InstForm";
import { Minister } from "./Minister";
import { Ministry } from "./Ministry";

interface DeptDef {
  id: string;
  dept_code: string;
  crso_ids: string[];
  abbr: string;
  legal_title: string;
  applied_title: string;
  old_applied_title: string;
  status_code: string;
  legislation: string;
  raw_mandate: string;
  pas_code: string;
  schedule: string;
  faa_hr: string;
  auditor: string;
  incorp_yr: string;
  fed_ownership: string;
  end_yr: string;
  notes: string;
  dp_status_code: string;
  inst_form_id: string;
  ministry_id: string;
  minister_ids: string[];
  table_ids: string[];
  eval_url: string;
  website_url: string;
  le_la: string;
  du_de_la: string;
  other_lang_abbr: string;
  other_lang_applied_title: string;
  other_lang_legal_title: string;
}

// Interface merging to fill in type system blind spot, see note on Object.assign(this, def) in BaseSubjectFactory's constructor
export interface Dept extends DeptDef {} // eslint-disable-line @typescript-eslint/no-empty-interface

export class Dept extends BaseSubjectFactory<DeptDef>(
  "dept",
  trivial_text_maker("orgs"),
  ["results", "services", "covid"]
) {
  static store = make_store(
    (def: DeptDef) => new Dept(def),
    (dept) => [dept.dept_code, +dept.id]
  );

  constructor(def: DeptDef) {
    super(def);
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

  get inst_form() {
    return InstForm.store.lookup(this.inst_form_id);
  }
  get ministry() {
    return Ministry.store.lookup(this.ministry_id);
  }
  get ministers() {
    return _.map(this.minister_ids, Minister.store.lookup);
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
      case "b":
        return trivial_text_maker("transferred");
      case "c":
        return trivial_text_maker("dissolved");
      default:
        return ""; // SUBJECT_TS_TODO should probably throw, or maybe that validation should happen at the populate step in populate_stores.js
    }
  }
  get is_dp_org() {
    return this.dp_status_code === "0" || this.dp_status_code === "1";
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
    return (
      !_.isEmpty(this.end_yr) || this.status !== trivial_text_maker("active")
    );
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