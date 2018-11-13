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
    name: "Government at a glance",
    route: "partition/dept/exp",
    test_on: ["eng"],
  },
];