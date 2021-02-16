import {
  make_dept_exp_perspective,
  make_dept_fte_perspective,
} from "./dept_perspectives.js";
import {
  make_estimates_est_type_perspective,
  make_estimates_est_doc_sea_perspective,
  make_estimates_est_doc_seb_perspective,
  make_estimates_est_doc_sec_perspective,
  make_estimates_vs_type_perspective,
  make_estimates_est_doc_mains_perspective,
  make_estimates_org_estimates_perspective,
  //make_estimates_est_doc_im_perspective,
} from "./estimates_perspectives.js";
import {
  make_org_info_ministry_perspective,
  make_org_info_federal_perspective,
  make_org_info_interests_perspective,
} from "./org_info_perspectives.js";

import { data_types, remapped_data_types } from "./perspective_utils.js";
import { make_spend_type_perspective } from "./spend_type_perspective.js";
import {
  make_goco_exp_perspective,
  make_goco_fte_perspective,
  //make_hwh_exp_perspective,
  //make_hwh_fte_perspective,
} from "./tag_perspectives.js";

const all_data_types = data_types;

// Should explain this, it's mildly hacky.
// The perspectives are full of implicit loading dependencies on tables (and subjects and text, but ensuring tables have loaded is enough),
// so each perspective can't just be evaluated whenever. Right now PartitionRoute is the place that ingests all the perspectives,
// and all table dependencies are ensured to have loaded there (from a hardcoded list).
// Best would be if each perspective explicitly handled loading dependencies, or at least declared them so that the list in
// PartitionRoute didn't have to be hard coded. Fix is a todo.
//
// ... also, order here determines default order of options in the perspective dropdown form.
const get_all_perspectives = () => {
  return [
    make_dept_exp_perspective(),
    make_dept_fte_perspective(),
    make_goco_exp_perspective(),
    make_goco_fte_perspective(),
    //make_hwh_exp_perspective(),
    //make_hwh_fte_perspective(),
    make_spend_type_perspective(),
    make_org_info_ministry_perspective(),
    make_org_info_federal_perspective(),
    make_org_info_interests_perspective(),
    make_estimates_est_doc_mains_perspective(),
    make_estimates_est_doc_sea_perspective(),
    make_estimates_est_doc_seb_perspective(),
    make_estimates_est_doc_sec_perspective(),
    make_estimates_vs_type_perspective(),
    make_estimates_est_type_perspective(),
    make_estimates_org_estimates_perspective(),
    //make_estimates_est_doc_im_perspective(),
  ];
};

export { all_data_types, remapped_data_types, get_all_perspectives };
