module.exports.route_load_tests_config = [
  {
    name: "Homepage",
    route: "",
    test_on: ["eng", "fra", "basic-eng", "basic-fra"],
  },
  {
    name: "About",
    route: "about",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Budget Tracker",
    route: "budget-measures/budget-measure/overview",
    test_on: ["eng"],
  },
  {
    name: "Bubble Explorer",
    route: "explore-dept",
    test_on: ["eng"],
  },
  {
    name: "Datasets",
    route: "metadata",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Estimates Comparison",
    route: "compare_estimates",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Glossary",
    route: "glossary",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "IGOC",
    route: "igoc",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Gov - About",
    route: "orgs/gov/gov/infograph/intro",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Gov - Finance",
    route: "orgs/gov/gov/infograph/financial",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Gov - People",
    route: "",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Gov - Results",
    route: "",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Gov - Where can I go from here?",
    route: "orgs/gov/gov/infograph/related",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Gov - All data",
    route: "orgs/gov/gov/infograph/all_data",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Dept - Finance",
    route: "orgs/dept/1/infograph/financial",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - CRSO - Finance",
    route: "orgs/crso/AGR-BWN00/infograph/financial",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Program - Finance",
    route: "orgs/program/AGR-BWN01/infograph/",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Report Builder",
    route: "rpb/~(columns~(~'thisyearexpenditures)~subject~'gov_gov~mode~'simple~dimension~'major_voted_stat~table~'table1~preferDeptBreakout~true~descending~false~filter~'All)",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Resource Explorer",
    route: "resource-explorer",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Government at a Glance",
    route: "partition/dept/exp",
    test_on: ["eng"],
  },
];