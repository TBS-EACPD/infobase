export const headcount_types = process.env.USE_TEST_DATA
  ? ["type"]
  : [
      "dept",
      "type",
      "region",
      "age_group",
      "ex_lvl",
      "gender",
      "fol",
      "avg_age",
    ];
