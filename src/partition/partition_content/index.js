import {
  make_dept_exp_perspective,
  make_dept_fte_perspective,
} from './dept_perspective.js';
import {
  make_goca_exp_perspective,
  make_goca_fte_perspective,
  make_hwh_exp_perspective,
  make_hwh_fte_perspective,
} from './tag_perspectives.js';
import { 
  make_spend_type_perspective,
} from './spend_type_perspective.js';
import {
  make_org_info_ministry_perspective,
  make_org_info_federal_perspective,
  make_org_info_interests_perspective,
} from './org_info_perspectives.js';
import {
  make_planned_spend_est_type_perspective,
  make_planned_spend_vs_type_perspective,
  make_planned_spend_org_planned_spend_perspective,
  make_planned_spend_est_doc_mains_perspective,
  make_planned_spend_est_doc_sea_perspective,
  make_planned_spend_est_doc_seb_perspective,
  make_planned_spend_est_doc_sec_perspective,
  make_planned_spend_est_doc_im_perspective,
} from './planned_spend_perspectives.js';

import { data_types } from './perspective_utils.js';

const all_data_types = data_types;

const get_all_perspectives = () => {
  return {
    deptExpPerspective: make_dept_exp_perspective(),
    deptFtePerspective: make_dept_fte_perspective(),
    gocaExpPerspective: make_goca_exp_perspective(),
    gocaFtePerspective: make_goca_fte_perspective(),
    hwhExpPerspective: make_hwh_exp_perspective(),
    hwhFtePerspective: make_hwh_fte_perspective(),
    spendTypePerspective: make_spend_type_perspective(),
    orgInfoMinistryPerspective: make_org_info_ministry_perspective(),
    orgInfoFederalPerspective: make_org_info_federal_perspective(),
    orgInfoInterestsPerspective: make_org_info_interests_perspective(),
    plannedSpendEstTypePerspective: make_planned_spend_est_type_perspective(),
    plannedSpendVsTypePerspective: make_planned_spend_vs_type_perspective(),
    plannedSpendOrgPlannedSpendPerspective: make_planned_spend_org_planned_spend_perspective(),
    plannedSpendEstDocMainsPerspective: make_planned_spend_est_doc_mains_perspective(),
    plannedSpendEstDocSeaPerspective: make_planned_spend_est_doc_sea_perspective(),
    plannedSpendEstDocSebPerspective: make_planned_spend_est_doc_seb_perspective(),
    plannedSpendEstDocSecPerspective: make_planned_spend_est_doc_sec_perspective(),
    plannedSpendEstDocImPerspective: make_planned_spend_est_doc_im_perspective(),
  }
};

export {
  all_data_types,
  get_all_perspectives,
};