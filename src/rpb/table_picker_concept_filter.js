const concept_categories = {
  concept_category_money: ["AUTH", "EXP", "VOTED", "STAT", "PLANNED_EXP_TAG", "SOBJ10"],
  concept_category_people: ["PEOPLE", "FTE", "GENDER", "AGE", "FOL", "GEO"],
  concept_category_source: ["QFR", "PA", "EST_PROC", "DP"],
  concept_category_timing: ["ANNUAL", "QUARTERLY"],
  concept_category_other: ["GOCA", "SOBJ", "PROG"],
}

/* some tables have tags that we don't want to show, so establish a whitelist */
const concept_whitelist = _.chain(concept_categories)
  .flatMap()
  .uniq()
  .value();

const concept_filter = concept_key => _.includes(concept_whitelist, concept_key);

const categories = _.keys(concept_categories);

const concepts_by_category = _.chain(categories)
  .map(cat => [ cat, concept_categories[cat] ])
  .fromPairs()
  .value();

export {
  categories,
  concepts_by_category,
  concept_filter,
  concept_categories,
}; 