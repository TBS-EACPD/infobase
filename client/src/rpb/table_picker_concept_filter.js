const concept_categories = {
  concept_category_money: [
    "AUTH",
    "EXP",
    "FTE",
    "VOTED",
    "STAT",
    "SOBJ",
    "PLANNED_EXP",
    "SOBJ10",
  ],
  concept_category_people: ["PEOPLE", "GENDER", "AGE", "FOL", "GEO"],
  concept_category_source: ["QFR", "PA", "EST_PROC", "DP", "DRR"],
  concept_category_other: ["ANNUAL", "QUARTERLY", "PROG"],
};

/* some tables have tags that we don't want to show, so establish a whitelist */
const concept_whitelist = _.chain(concept_categories).flatMap().uniq().value();

const concept_whitelist_filter = (concept_key) =>
  _.includes(concept_whitelist, concept_key);
const concept_filter_by_categories = (concent_type, concept_keys) =>
  _.intersection(
    concept_categories[`concept_category_${concent_type}`],
    concept_keys
  ).length > 0;

const categories = _.keys(concept_categories);

const concepts_by_category = _.chain(categories)
  .map((cat) => [cat, concept_categories[cat]])
  .fromPairs()
  .value();

export {
  categories,
  concepts_by_category,
  concept_whitelist_filter,
  concept_filter_by_categories,
  concept_categories,
};
