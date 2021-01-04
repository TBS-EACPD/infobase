import _ from "src/app_bootstrap/lodash_mixins.js";

const featured_content_items = _.compact([
  {
    text_key: "quick_link_covid_estimates",
    href:
      "#orgs/gov/gov/infograph/financial/.-.-(panel_key.-.-'covid_estimates_panel)",
    is_new: "true",
  },
  {
    text_key: "quick_link_DRR_1920",
    href: "#orgs/gov/gov/infograph/results/.-.-(panel_key.-.-'gov_drr)",
    is_new: "true",
  },
  {
    text_key: "quick_link_gov_spending",
    href: "#orgs/gov/gov/infograph/financial/.-.-(panel_key.-.-'welcome_mat)",
    is_new: "true",
  },
  {
    text_key: "supps_b",
    href: "#compare_estimates",
  },
  {
    text_key: "quick_link_tp_by_region",
    href: "#orgs/gov/gov/infograph/financial/.-.-(panel_key.-.-'tp_by_region)",
  },
  {
    text_key: "igoc",
    href: "#igoc",
  },
]);

export { featured_content_items };
