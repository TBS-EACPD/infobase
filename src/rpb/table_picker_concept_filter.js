
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
  QFR:"timing",
  AUTH:"money",
  EXP:"money",
  VOTED:"money",
  STAT:"money",
  PEOPLE:"people",
  SOBJ:"organization",
  PA:"timing",
  GOV_FRAM:"organization",
  PLANNED_EXP:"money",
  PROG:"organization",
  SOBJ10:"organization",
  EST_PROC:"todelete",
  FPS:"todelete",
  FTE:"people"
};


const concept_categories_reversed = {
  timing:["QFR","PA"],
  money:["AUTH","EXP","VOTED","STAT","PLANNED_EXP"],
  people:["PEOPLE","FTE"],
  organization:["SOBJ","GOV_FRAM","PROJ","SOBJ10"]
}

export {
  concept_filter,
  concept_categories,
  concept_categories_reversed,
}; 