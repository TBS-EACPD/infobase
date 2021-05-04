import _ from "lodash";
import React from "react";

import { create_text_maker_component } from "src/components/index.js";

import { services_feature_flag } from "src/core/injected_build_constants.ts";

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

import infographic_sections_text_bundle from "src/infographic/bubble_definitions.yaml";

const { text_maker } = create_text_maker_component([
  infographic_sections_text_bundle,
]);

const infographic_link_items = _.compact([
  {
    href: "#orgs/gov/gov/infograph/financial",
    svg: (
      <IconFinancesAlt width="100%" color="#FFFFFF" alternate_color={false} />
    ),
    title: text_maker("financial_title"),
    description: text_maker("financial_desc"),
  },
  {
    href: "#orgs/gov/gov/infograph/covid",
    svg: <IconHelpAlt width="100%" color="#FFFFFF" alternate_color={false} />,
    title: text_maker("covid"),
    description: text_maker("covid_desc"),
  },
  {
    href: "#orgs/gov/gov/infograph/people",
    svg: (
      <IconEmployeesAlt width="100%" color="#FFFFFF" alternate_color={false} />
    ),
    title: text_maker("people_title"),
    description: text_maker("people_desc"),
  },
  {
    href: "#orgs/gov/gov/infograph/results",
    svg: (
      <IconClipboardAlt width="100%" color="#FFFFFF" alternate_color={false} />
    ),
    title: text_maker("results_title"),
    description: text_maker("results_desc"),
  },
  services_feature_flag && {
    href: "#orgs/gov/gov/infograph/services",
    svg: (
      <IconServicesHome width="100%" color="#FFFFFF" alternate_color={false} />
    ),
    title: text_maker("services_title"),
    description: text_maker("services_desc"),
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
    href: "#igoc",
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
    href: "#compare_estimates",
  },
  {
    svg: <IconTag width="100%" color="#2C70C9" alternate_color={false} />,
    title_key: "explorer_home_title",
    text_key: "explorer_home_text",
    href: "#tag-explorer",
  },
  {
    svg: <IconReport width="100%" color="#2C70C9" alternate_color={false} />,
    title_key: "home_build_a_report",
    text_key: "report_builder_home_desc",
    href: "#rpb",
  },
  {
    svg: (
      <IconResultsReport width="100%" color="#2C70C9" alternate_color={false} />
    ),
    title_key: "home_diff_title",
    text_key: "home_diff_text",
    href: "#diff",
  },
]);

export { infographic_link_items, featured_content_items, subapp_items };
