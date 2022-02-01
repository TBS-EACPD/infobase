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
    href: "#infographic/gov/gov/financial",
    svg: (
      <IconFinancesAlt width="100%" color="#FFFFFF" alternate_color={false} />
    ),
    title: text_maker("financial_title"),
    description: text_maker("financial_desc"),
  },
  {
    href: "#infographic/gov/gov/covid",
    svg: <IconHelpAlt width="100%" color="#FFFFFF" alternate_color={false} />,
    title: text_maker("covid"),
    description: text_maker("covid_desc"),
  },
  {
    href: "#infographic/gov/gov/people",
    svg: (
      <IconEmployeesAlt width="100%" color="#FFFFFF" alternate_color={false} />
    ),
    title: text_maker("people_title"),
    description: text_maker("people_desc"),
  },
  {
    href: "#infographic/gov/gov/results",
    svg: (
      <IconClipboardAlt width="100%" color="#FFFFFF" alternate_color={false} />
    ),
    title: text_maker("results_title"),
    description: text_maker("results_desc"),
  },
  services_feature_flag && {
    href: "#infographic/gov/gov/services",
    svg: (
      <IconServicesHome width="100%" color="#FFFFFF" alternate_color={false} />
    ),
    title: text_maker("services_title"),
    description: text_maker("services_desc"),
  },
]);

const featured_content_items = _.compact([
  {
    text_key: "quick_link_DRR20",
    href: "#infographic/gov/gov/results/.-.-(panel_key.-.-'gov_drr)",
    is_new: "true",
  },
  {
    text_key: "quick_link_service_inventory_2019",
    href: "#infographic/gov/gov/services/.-.-(panel_key.-.-'services_intro)",
    is_new: "true",
  },
  {
    text_key: "quick_link_people_2021",
    href: "#infographic/gov/gov/people",
  },
  {
    text_key: "quick_link_gov_spending",
    href: "#infographic/gov/gov/financial/.-.-(panel_key.-.-'welcome_mat)",
  },
  {
    text_key: "quick_link_spending_by_program",
    href: "#treemap/drf/spending/All/pa_last_year",
  },
  {
    text_key: "quick_link_ftes_by_program",
    href: "#treemap/drf_ftes/ftes/All/pa_last_year",
  },
  {
    text_key: "supps_b",
    href: "#compare_estimates",
  },
  {
    text_key: "covid_expenditures_estimated_exp_2021",
    href: "#orgs/gov/gov/infograph/covid/.-.-(panel_key.-.-'covid_expenditures_panel)",
  },
  {
    text_key: "covid_measure_spending_auth",
    href: "#infographic/gov/gov/covid/.-.-(panel_key.-.-'covid_estimates_panel)",
  },
  {
    text_key: "quick_link_DP_2022",
    href: "#infographic/gov/gov/results/.-.-(panel_key.-.-'gov_dp)",
  },
  {
    text_key: "quick_link_tp_by_region",
    href: "#infographic/gov/gov/financial/.-.-(panel_key.-.-'tp_by_region)",
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
