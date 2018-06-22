import { Dept } from './models/subject.js';
import { trivial_text_maker } from './models/text.js';

export const result_laggards = [
  136,
  305,
  86,
];

export const get_missing_result_footnote = () => {
  const org_names = _.map(result_laggards, id=> Dept.lookup(id).sexy_name );
  return trivial_text_maker("gov_missing_dp_results", {late_orgs:org_names});
};


