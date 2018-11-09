module.exports.route_load_tests_config = [
  {
    name: "Homepage",
    route: "",
    selector: {
      nona11y: "div.home-root > div.intro-box > div.container > h2 > span",
      a11y: "#app-focus-root > div > div > section:nth-child(2) > ul > li:nth-child(1) > a",
    },
    expected_text: {
      en: {
        nona11y: "Find",
        a11y: "Learn about government finances",
      },
      fr: {
        nona11y: "Trouver",
        a11y: "Apprendre au sujet des finances du gouvernement",
      },
    },
  },
  {
    name: "About",
    route: "about",
    selector: {
      common: "div.medium_panel_text.about-root > div > p"
    },
    expected_text: {
      en: {
        common: "interactive",
      },
      fr: {
        common: "interactif",
      },
    },
  },
  {
    name: "About",
    route: "about",
    selector: {
      common: "div.medium_panel_text.about-root > div > p"
    },
    expected_text: {
      en: {
        common: "interactive",
      },
      fr: {
        common: "interactif",
      },
    },
  },
  {
    name: "Government at a glance",
    route: "partition/dept/exp",
    selector: {
      nona11y: "div.partition-controls > form.form-horizontal > div.partition-control-element > text",
    },
    expected_text: {
      en: {
        nona11y: "Select",
      },
      fr: {
        nona11y: "Sélectionner",
      },
    },
  },
];