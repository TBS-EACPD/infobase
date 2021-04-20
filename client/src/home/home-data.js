import _ from "lodash";
import React from "react";

import { create_text_maker_component } from "src/components/index.js";

import {
  services_feature_flag,
  is_a11y_mode,
} from "src/core/injected_build_constants.js";

import {
  IconFinancesAlt,
  IconEmployeesAlt,
  IconClipboardAlt,
  IconHelpAlt,
  IconServicesHome,
  IconResultsReport,
  IconCompareEstimates,
  IconHierarchy,
  IconTag,
  IconReport,
} from "src/icons/icons.js";

import home_text_bundle from "./home.yaml";

const { TM, text_maker } = create_text_maker_component(home_text_bundle);

const infographic_link_items = _.compact([
  {
    href: "#orgs/gov/gov/infograph/financial",
    svg: (
      <IconFinancesAlt width="100%" color="#FFFFFF" alternate_color={false} />
    ),
    title: <TM k="home_finance_title" />,
    description: text_maker("home_finance_desc"),
  },
  {
    href: "#orgs/gov/gov/infograph/covid",
    svg: <IconHelpAlt width="100%" color="#FFFFFF" alternate_color={false} />,
    title: <TM k="covid" />,
    description: text_maker("home_covid_desc"),
  },
  {
    href: "#orgs/gov/gov/infograph/people",
    svg: (
      <IconEmployeesAlt width="100%" color="#FFFFFF" alternate_color={false} />
    ),
    title: <TM k="home_ppl_title" />,
    description: text_maker("home_ppl_desc"),
  },
  services_feature_flag && {
    href: "#orgs/gov/gov/infograph/services",
    svg: (
      <IconServicesHome width="100%" color="#FFFFFF" alternate_color={false} />
    ),
    title: <TM k="home_services_title" />,
    description: text_maker("home_services_desc"),
  },
  {
    href: "#orgs/gov/gov/infograph/results",
    svg: (
      <IconClipboardAlt width="100%" color="#FFFFFF" alternate_color={false} />
    ),
    title: <TM k="home_results_title" />,
    description: text_maker("home_results_desc"),
  },
]);

const featured_content_items = _.compact([
  {
    text_key: "covid_measure_spending_auth",
    href: "#orgs/gov/gov/infograph/covid",
    is_new: "true",
  },
  {
    text_key: "quick_link_people_2020",
    href: "#orgs/gov/gov/infograph/people",
    is_new: "true",
  },
  {
    text_key: "quick_link_DP_2022",
    href: "#orgs/gov/gov/infograph/results/.-.-(panel_key.-.-'gov_dp)",
    is_new: "true",
  },
  {
    text_key: "quick_link_main_estimates",
    href: "#compare_estimates",
    is_new: "true",
  },
  {
    text_key: "quick_link_DRR_1920",
    href: "#orgs/gov/gov/infograph/results/.-.-(panel_key.-.-'gov_drr)",
  },
  {
    text_key: "quick_link_gov_spending",
    href: "#orgs/gov/gov/infograph/financial/.-.-(panel_key.-.-'welcome_mat)",
  },
  {
    text_key: "quick_link_tp_by_region",
    href: "#orgs/gov/gov/infograph/financial/.-.-(panel_key.-.-'tp_by_region)",
  },
]);

const subapp_items = _.compact([
  {
    svg: <IconHierarchy width="100%" color="#2C70C9" alternate_color={false} />,
    title_key: "igoc_home_title",
    text_key: "igoc_home_desc",
    link_href: "#igoc",
  },
  {
    svg: (
      <IconCompareEstimates
        width="100%"
        color="#2C70C9"
        alternate_color={false}
      />
    ),
    title_key: "estimates_comp_home_title",
    text_key: "estimates_comp_home_text_supps",
    link_href: "#compare_estimates",
  },
  {
    svg: <IconTag width="100%" color="#2C70C9" alternate_color={false} />,
    title_key: "explorer_home_title",
    text_key: "explorer_home_text",
    link_href: "#tag-explorer",
  },
  {
    svg: <IconReport width="100%" color="#2C70C9" alternate_color={false} />,
    title_key: "home_build_a_report",
    text_key: "report_builder_home_desc",
    link_href: "#rpb",
  },
  {
    svg: (
      <IconResultsReport width="100%" color="#2C70C9" alternate_color={false} />
    ),
    title_key: "home_diff_title",
    text_key: "home_diff_text",
    link_href: "#diff",
  },
]);

export { infographic_link_items, featured_content_items, subapp_items };
