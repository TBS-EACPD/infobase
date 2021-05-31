import _ from "lodash";
import React from "react";

import { create_text_maker_component } from "src/components/index";

import { services_feature_flag } from "src/core/injected_build_constants";

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
  IconTreemap,
} from "src/icons/icons";

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
    text_key: "covid_expenditures_estimated_exp_2021",
    href:
      "#orgs/gov/gov/infograph/covid/.-.-(panel_key.-.-'covid_expenditures_panel)",
    is_new: "true",
  },
  {
    text_key: "supps_a",
    href: "#compare_estimates",
    is_new: "true",
  },
  {
    text_key: "covid_measure_spending_auth",
    href:
      "#orgs/gov/gov/infograph/covid/.-.-(panel_key.-.-'covid_estimates_panel)",
  },
  {
    text_key: "quick_link_people_2020",
    href: "#orgs/gov/gov/infograph/people",
  },
  {
    text_key: "quick_link_DP_2022",
    href: "#orgs/gov/gov/infograph/results/.-.-(panel_key.-.-'gov_dp)",
  },
  {
    text_key: "quick_link_main_estimates",
    href:
      "#rpb/.-.-(table.-.-'orgVoteStatEstimates.-.-subject.-.-'gov_gov.-.-columns.-.-(.-.-'*7b*7best_last_year_4*7d*7d_estimates.-.-'*7b*7best_last_year_3*7d*7d_estimates.-.-'*7b*7best_last_year_2*7d*7d_estimates.-.-'*7b*7best_last_year*7d*7d_estimates.-.-'*7b*7best_in_year*7d*7d_estimates))",
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
    svg: <IconTreemap width="100%" color="#2C70C9" alternate_color={false} />,
    title_key: "treemap_title",
    text_key: "treemap_text",
    href: "#treemap",
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
