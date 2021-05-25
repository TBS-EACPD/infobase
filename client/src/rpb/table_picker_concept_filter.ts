import _ from "lodash";

const concept_categories: { [key: string]: string[] } = {
  concept_category_money: [
    "AUTH",
    "EXP",
    "VOTED",
    "STAT",
    "SOBJ",
    "PLANNED_EXP",
    "SOBJ10",
  ],
  concept_category_people: ["PEOPLE", "FTE", "GENDER", "AGE", "FOL", "GEO"],
  concept_category_source: ["PA", "EST_PROC", "DP", "DRR"],
  concept_category_other: ["ANNUAL", "QUARTERLY", "PROG"],
};

/* some tables have tags that we don't want to show, so establish a whitelist */
const concept_whitelist = _.chain(concept_categories).flatMap().uniq().value();

const concept_filter = (concept_key: string[]) =>
  _.includes(concept_whitelist, concept_key);

const categories = _.keys(concept_categories);

const concepts_by_category = _.chain(categories)
  .map((cat: string) => [cat, concept_categories[cat]])
  .fromPairs()
  .value();

export { categories, concepts_by_category, concept_filter, concept_categories };
