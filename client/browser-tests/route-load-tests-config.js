module.exports.route_load_tests_config = [
  {
    name: "Always failing route, to test error boundary",
    route: "error-boundary-test",
    test_on: ["eng", "fra", "basic-eng", "basic-fra"],
    expect_to_fail: true,
  },
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
    name: "Infographic - Gov - COVID-19 Response",
    route: "orgs/gov/gov/infograph/covid",
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
    route: "orgs/dept/326/infograph/intro",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Dept - Finance",
    route: "orgs/dept/326/infograph/financial",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Dept - COVID-19 Response",
    route: "orgs/dept/1/infograph/covid",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Dept - People",
    route: "orgs/dept/326/infograph/people",
    test_on: ["eng", "fra", "basic-eng"],
  },
  {
    name: "Infographic - Dept - Services",
    route: "orgs/dept/326/infograph/services",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Dept - Results",
    route: "orgs/dept/326/infograph/results",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Dept - Where can I go from here?",
    route: "orgs/dept/326/infograph/related",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Dept - All data",
    route: "orgs/dept/326/infograph/all_data",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - CRSO - About",
    route: "orgs/crso/TBC-BXA00/infograph/intro",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - CRSO - Finance",
    route: "orgs/crso/TBC-BXA00/infograph/financial",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - CRSO - People",
    route: "orgs/crso/TBC-BXA00/infograph/people",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - CRSO - Results",
    route: "orgs/crso/TBC-BXA00/infograph/results",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - CRSO - Where can I go from here?",
    route: "orgs/crso/TBC-BXA00/infograph/related",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - CRSO - All data",
    route: "orgs/crso/TBC-BXA00/infograph/all_data",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Program - About",
    route: "orgs/program/TBC-BXC04/infograph/intro",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Program - Finance",
    route: "orgs/program/TBC-BXC04/infograph/financial",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Program - Results",
    route: "orgs/program/TBC-BXC04/infograph/results",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Program - Where can I go from here?",
    route: "orgs/program/TBC-BXC04/infograph/related",
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
    name: "Infographic - Crown Corp - About",
    route: "orgs/dept/146/infograph/intro",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Crown Corp - Finance",
    route: "orgs/dept/146/infograph/financial",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Crown Corp - Where can I go from here?",
    route: "orgs/dept/146/infograph/related",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Inactive Program - About",
    route: "orgs/program/PPP-AHZ00/infograph/intro",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Inactive Program - Finance",
    route: "orgs/program/PPP-AHZ00/infograph/financial",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Infographic - Inactive Program - Where can I go from here?",
    route: "orgs/program/PPP-AHZ00/infograph/related",
    test_on: ["eng", "basic-eng"],
  },

  {
    name: "Report Builder - Table Picker",
    route: "rpb",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Report Builder - Report",
    route:
      "rpb/~(columns~(~'thisyearexpenditures)~subject~'gov_gov~'dimension~'major_voted_stat~table~'orgVoteStatQfr~sort_col~'dept~descending~false~filter~'All)",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Tag Explorer",
    route: "tag-explorer",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Indicator text comparison - TBS",
    route: "diff/326",
    test_on: ["eng", "basic-eng"],
  },
  {
    name: "Footnote Inventory - all footnotes",
    route: "footnote-inventory",
    test_on: ["eng", "basic-eng", "fra"],
  },
];
