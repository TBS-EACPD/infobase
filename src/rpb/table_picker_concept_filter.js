
const minus_concept_whitelist = [
  "QFR",
  "AUTH",
  "EXP",
  "VOTED",
  "STAT",
  "PEOPLE",
  "SOBJ",
  "PA",
  "GOV_FRAM",
  "PLANNED_EXP",
  "PROG",
  "SOBJ10",
  "EST_PROC",
  "FPS",
  "FTE",
];

const concept_filter = concept_key => _.includes(minus_concept_whitelist, concept_key);


const concept_categories = {
  timing: ["QFR","PA","EST_PROC"],
  money: ["AUTH","EXP","VOTED","STAT","PLANNED_EXP","SOBJ10"],
  people: ["PEOPLE","FTE","FPS"],
  organization: ["GOV_FRAM","SOBJ","PROG"],
}

/* TODO: what to do with FPS??????*/

const categories = ["people","money","timing","organization"];
const concepts_by_category = _.fromPairs(_.map(categories,cat => [cat,concept_categories[cat]]));

export {
  categories,
  concepts_by_category,
  concept_filter,
  concept_categories,
}; 