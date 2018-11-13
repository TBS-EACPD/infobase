module.exports.route_load_tests_config = [
  {
    name: "Homepage",
    route: "",
    selector: {
      app: "div.home-root > div.intro-box > div.container > h2 > span",
      a11y_app: "#app-focus-root > div > div > section:nth-child(2) > ul > li:nth-child(1) > a",
    },
    expected_text: {
      app: {
        en: "Find",
        fr: "Trouver",
      },
      a11y_app: {
        en: "Learn about government finances",
        fr: "Apprendre au sujet des finances du gouvernement",
      },
    },
  },
  {
    name: "About",
    route: "about",
    selector: {
      common: "div.medium_panel_text.about-root > div > p",
    },
    expected_text: {
      common: {
        en: "interactive",
        fr: "interactif",
      },
    },
  },
  {
    name: "Government at a glance",
    route: "partition/dept/exp",
    selector: {
      app: "div.partition-controls > form.form-horizontal > div.partition-control-element > text",
    },
    expected_text: {
      app: {
        en: "Select",
        fr: "Sélectionner",
      },
    },
  },
];