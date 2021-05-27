import _ from "lodash";
import React from "react";

import { CellTooltip } from "./covid_common_components";
import { covid_create_text_maker_component } from "./covid_text_provider";

import text from "./covid_estimates_tooltips.yaml";

const { text_maker } = covid_create_text_maker_component(text);

const tooltips_by_topic = {
  est_doc_total: [
    {
      fiscal_years: [2021],
      subject_ids: ["gov"],
      topic_ids: ["MAINS"],
      text: text_maker("covid_mains_2021_note"),
    },
    {
      fiscal_years: [2021],
      subject_ids: ["gov"],
      topic_ids: ["SEA"],
      text: text_maker("covid_supps_a_2021_note"),
    },
  ],
  measure: [
    {
      fiscal_years: [2020, 2021],
      subject_ids: ["gov", 280],
      topic_ids: ["COV082"],
      text: text_maker("covid_estimates_COV082_2020_tooltip"),
    },
    {
      fiscal_years: [2020, 2021],
      subject_ids: ["gov", 280],
      topic_ids: ["COV115"],
      text: text_maker("covid_estimates_COV115_2020_tooltip"),
    },
    {
      fiscal_years: [2021],
      subject_ids: ["*"],
      topic_ids: ["COV043", "COV113", "COV118", "COV145", "COV204"],
      text: text_maker(
        "covid_estimates_supps_a_partial_reprofile_2020_tooltip"
      ),
    },
    {
      fiscal_years: [2021],
      subject_ids: ["*"],
      topic_ids: [
        "COV002",
        "COV004",
        "COV005",
        "COV006",
        "COV010",
        "COV012",
        "COV014",
        "COV023",
        "COV024",
        "COV026",
        "COV037",
        "COV038",
        "COV041",
        "COV049",
        "COV062",
        "COV079",
        "COV084",
        "COV098",
        "COV112",
        "COV121",
        "COV122",
        "COV124",
        "COV129",
        "COV134",
        "COV141",
        "COV153",
        "COV154",
        "COV231",
      ],
      text: text_maker("covid_estimates_supps_a_full_reprofile_2020_tooltip"),
    },
  ],
};

export const get_tooltip = (topic, selected_year, panel_subject_id, topic_id) =>
  _.chain(tooltips_by_topic)
    .get(topic)
    .filter(
      ({ fiscal_years, subject_ids, measure_ids, topic_ids }) =>
        _.some(fiscal_years, (tooltip_fiscal_year) =>
          _.includes(["*", selected_year], tooltip_fiscal_year)
        ) &&
        _.some(subject_ids, (tooltip_subject_id) =>
          _.includes(["*", panel_subject_id], tooltip_subject_id)
        ) &&
        _.some(topic_ids, (tooltip_topic_id) =>
          _.includes(["*", topic_id], tooltip_topic_id)
        )
    )
    .map(({ text }) => <CellTooltip tooltip_text={text} key={text} />)
    .value();
