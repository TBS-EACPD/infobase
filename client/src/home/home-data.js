import _ from "lodash";
import React from "react";

import { create_text_maker_component } from "src/components/index";

import { CURRENT_EST_DOC } from "src/models/estimates";

import { services_feature_flag } from "src/core/injected_build_constants";

import {
  IconFinancesAlt,
  IconEmployeesAlt,
  IconClipboardAlt,
  IconHelpAlt,
  IconServicesHome,
  IconCompareEstimates,
  IconHierarchy,
  IconTag,
  IconReport,
} from "src/icons/icons";

import infographic_sections_text_bundle from "src/infographic/bubble_definitions.yaml";

import { lang } from "src/core/injected_build_constants";

const { text_maker } = create_text_maker_component([
  infographic_sections_text_bundle,
]);

var finance_details;
var people_details;
var results_details;

if (lang === "en") {
  finance_details =
    ". In 2021-22, the government spent $376.1 billion. The three largest items in terms of spending were: Old Age Security payments (Old Age Security Act) - Employment and Social Development Canada, Canada Health Transfer (Part V.1 - Federal-Provincial Fiscal Arrangements Act) - Department of Finance Canada, Fiscal Equalization (Part I - Federal-Provincial Fiscal Arrangements Act) - Department of Finance Canada. Click to learn more.";
  people_details =
    ". As of March 31st, 2021 there were 319,601 employees in the Federal Public Service , with 42.2% located in the National Capital Region. Click to learn more.";
  results_details =
    ". In 2021-22, the federal government sought to achieve 1501 results. Progress towards meeting these results was measured using 2,698 indicators . Of those indicators, 1,343 (50%) have met their target. Click to learn more.";
} else if (lang === "fr") {
  finance_details =
    ". En 2021-2022, le gouvernement a dépensé 376,1 milliards de dollars. Les trois items suivant représentaient la plus grande partie des dépenses : Versements de la Sécurité de la vieillesse (Loi sur la sécurité de la vieillesse) - Emploi et Développement social Canada, Transfert canadien en matière de santé (Partie V.1 - Loi sur les arrangements fiscaux entre le gouvernement fédéral et les provinces) - Ministère des Finances Canada, Péréquation fiscale (Partie I - Loi sur les arrangements fiscaux entre le gouvernement fédéral et les provinces) - Ministère des Finances Canada. Cliquez pour en savoir plus.";
  people_details =
    ". Au 31 mars 2021, il y avait 319 601 employés au sein de la fonction publique générale , dont 42,2 % travaillaient dans la région de la capitale nationale. Cliquez pour en savoir plus.";
  results_details =
    ". En 2021-2022, le gouvernement fédéral a cherché à rencontrer 1516 résultats. Les progrès accomplis dans l'atteinte de ces résultats ont été mesurés à l’aide de 2 731 indicateurs . De ces indicateurs, 1 361 (50 %) ont atteint leur cible. Cliquez pour en savoir plus.";
}

const infographic_link_items = _.compact([
  {
    href: "#infographic/gov/gov/financial",
    svg: (
      <IconFinancesAlt width="100%" color="#FFFFFF" alternate_color={false} />
    ),
    title:
      text_maker(
        "financial_title"
      ) /*+ "In 2021-22, the government spent $376.1 billion. The three largest items in terms of spending were: Old Age Security payments (Old Age Security Act) - Employment and Social Development Canada, Canada Health Transfer (Part V.1 - Federal-Provincial Fiscal Arrangements Act) - Department of Finance Canada, Fiscal Equalization (Part I - Federal-Provincial Fiscal Arrangements Act) - Department of Finance Canada"*/,
    description: text_maker("financial_desc") + finance_details,
    //". In 2021-22, the government spent $376.1 billion. The three largest items in terms of spending were: Old Age Security payments (Old Age Security Act) - Employment and Social Development Canada, Canada Health Transfer (Part V.1 - Federal-Provincial Fiscal Arrangements Act) - Department of Finance Canada, Fiscal Equalization (Part I - Federal-Provincial Fiscal Arrangements Act) - Department of Finance Canada. Click to learn more.",
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
    description: text_maker("people_desc") + people_details,
    //". As of March 31st, 2021 there were 319,601 employees in the Federal Public Service , with 42.2% located in the National Capital Region. Click to learn more.",
  },
  {
    href: "#infographic/gov/gov/results",
    svg: (
      <IconClipboardAlt width="100%" color="#FFFFFF" alternate_color={false} />
    ),
    title: text_maker("results_title"),
    description: text_maker("results_desc") + results_details,
    //". In 2021-22, the federal government sought to achieve 1501 results. Progress towards meeting these results was measured using 2,698 indicators . Of those indicators, 1,343 (50%) have met their target. Click to learn more.",
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
    text_key: "quick_link_DP23",
    href: "#infographic/gov/gov/results/.-.-(panel_key.-.-'gov_dp)",
    is_new: "true",
  },
  {
    text_key: "main_estimates",
    href: "#compare_estimates",
    is_new: "true",
  },
  {
    text_key: "quick_link_DRR22",
    href: "#infographic/gov/gov/results/.-.-(panel_key.-.-'gov_drr)",
  },
  {
    text_key: "quick_link_gov_spending",
    href: "#infographic/gov/gov/financial/.-.-(panel_key.-.-'welcome_mat)",
  },
  {
    text_key: "quick_link_service_inventory_2020",
    href: "#infographic/gov/gov/services/.-.-(panel_key.-.-'services_intro)",
  },
  {
    text_key: "covid_expenditures_estimated_exp_2022",
    href: "#orgs/gov/gov/infograph/covid/.-.-(panel_key.-.-'covid_expenditures_panel)",
  },
  {
    text_key: "covid_measure_spending_auth_2022",
    href: "#infographic/gov/gov/covid/.-.-(panel_key.-.-'covid_estimates_panel)",
  },
  {
    text_key: "quick_link_people_2021",
    href: "#infographic/gov/gov/people",
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
    text_key:
      CURRENT_EST_DOC === "MAINS"
        ? "estimates_comp_home_text"
        : "estimates_comp_home_text_supps",
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
]);

export { infographic_link_items, featured_content_items, subapp_items };
