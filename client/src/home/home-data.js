import _ from "lodash";
import React from "react";

import { create_text_maker_component } from "src/components/index.js";

import { services_feature_flag } from "src/core/injected_build_constants.js";

import {
  IconFinancesAlt,
  IconEmployeesAlt,
  IconClipboardAlt,
  IconHelpAlt,
  IconServicesHome,
} from "src/icons/icons.js";

import home_text_bundle from "./home.yaml";

const { TM } = create_text_maker_component(home_text_bundle);

const infographic_link_items = _.compact([
  {
    href: "#orgs/gov/gov/infograph/financial",
    svg: (
      <IconFinancesAlt width="100%" color="#FFFFFF" alternate_color={false} />
    ),
    title: <TM k="home_finance_title" />,
  },
  {
    href: "#orgs/gov/gov/infograph/covid",
    svg: <IconHelpAlt width="100%" color="#FFFFFF" alternate_color={false} />,
    title: <TM k="covid" />,
  },
  {
    href: "#orgs/gov/gov/infograph/people",
    svg: (
      <IconEmployeesAlt width="100%" color="#FFFFFF" alternate_color={false} />
    ),
    title: <TM k="home_ppl_title" />,
  },
  services_feature_flag && {
    href: "#orgs/gov/gov/infograph/services",
    svg: (
      <IconServicesHome width="100%" color="#FFFFFF" alternate_color={false} />
    ),
    title: <TM k="home_services_title" />,
  },
  {
    href: "#orgs/gov/gov/infograph/results",
    svg: (
      <IconClipboardAlt width="100%" color="#FFFFFF" alternate_color={false} />
    ),
    title: <TM k="home_results_title" />,
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

export { infographic_link_items, featured_content_items };
