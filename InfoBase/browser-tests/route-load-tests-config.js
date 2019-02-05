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
    test_on: ["eng", "basic-eng"],
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
    name: "Government at a Glance",
    route: "partition/dept/exp",
    test_on: ["eng"],
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
    route: "orgs/gov/gov/infograph/people",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Gov - Results",
    route: "orgs/gov/gov/infograph/results",
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
    name: "Infographic - Dept - About",
    route: "orgs/dept/1/infograph/intro",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Dept - Finance",
    route: "orgs/dept/1/infograph/financial",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Dept - People",
    route: "orgs/dept/1/infograph/people",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Dept - Results",
    route: "orgs/dept/1/infograph/results",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Dept - Where can I go from here?",
    route: "orgs/dept/1/infograph/related",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Dept - All data",
    route: "orgs/dept/1/infograph/all_data",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - CRSO - About",
    route: "orgs/crso/AGR-BWN00/infograph/intro",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - CRSO - Finance",
    route: "orgs/crso/AGR-BWN00/infograph/financial",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - CRSO - People",
    route: "orgs/crso/AGR-BWN00/infograph/people",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - CRSO - Results",
    route: "orgs/crso/AGR-BWN00/infograph/results",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - CRSO - Where can I go from here?",
    route: "orgs/crso/AGR-BWN00/infograph/related",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - CRSO - All data",
    route: "orgs/crso/AGR-BWN00/infograph/all_data",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Program - About",
    route: "orgs/program/AGR-BWN01/infograph/intro",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Program - Finance",
    route: "orgs/program/AGR-BWN01/infograph/financial",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Program - Results",
    route: "orgs/program/AGR-BWN01/infograph/results",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Program - Where can I go from here?",
    route: "orgs/program/AGR-BWN01/infograph/related",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Tag - About",
    route: "orgs/tag/GOC002/infograph/intro",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Tag - Tagged Programs",
    route: "orgs/tag/GOC002/infograph/structure",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Tag - Where can I go from here?",
    route: "orgs/tag/GOC002/infograph/related",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Report Builder - Table Picker",
    route: "rpb",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Report Builder - Report - Legacy URL",
    route: "rpb/~(columns~(~'thisyearexpenditures)~subject~'gov_gov~mode~'simple~dimension~'major_voted_stat~table~'table1~preferDeptBreakout~true~descending~false~filter~'All)",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Report Builder - Report",
    route: "rpb/~(columns~(~'thisyearexpenditures)~subject~'gov_gov~mode~'simple~dimension~'major_voted_stat~table~'orgVoteStatQfr~preferDeptBreakout~true~sort_col~'dept~descending~false~filter~'All)",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Resource Explorer",
    route: "resource-explorer",
    test_on: ["eng", "basic-eng"],
  },
];