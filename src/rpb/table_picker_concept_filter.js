
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

module.exports = exports = concept_key => _.includes(minus_concept_whitelist, concept_key);
