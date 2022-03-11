import _ from "lodash";
import React from "react";

import { Tooltip } from "src/components";
import { IconQuestion } from "src/icons/icons";

import { covid_create_text_maker_component } from "./covid_text_provider";

import text from "./covid_estimates_tooltips.yaml";

const { TM } = covid_create_text_maker_component(text);

const tooltips_by_topic = {
  est_doc_total: [
    {
      fiscal_years: [2021],
      subject_ids: ["gov"],
      topic_ids: ["MAINS"],
      tooltip: <TM k="covid_2021_mains_note" />,
    },
    {
      fiscal_years: [2021],
      subject_ids: ["gov"],
      topic_ids: ["SEA"],
      tooltip: <TM k="covid_2021_supps_a_note" />,
    },
    {
      fiscal_years: [2021],
      subject_ids: ["gov"],
      topic_ids: ["SEB"],
      tooltip: <TM k="covid_2021_supps_b_note" />,
    },
  ],
  measure: [
    {
      fiscal_years: [2021],
      subject_ids: ["gov", 280],
      topic_ids: ["COV082"],
      tooltip: (
        <TM k="covid_estimates_2021_mains_COV082_2020_reprofile_tooltip" />
      ),
    },
    {
      fiscal_years: [2021],
      subject_ids: ["gov", 280],
      topic_ids: ["COV115"],
      tooltip: (
        <TM k="covid_estimates_2021_mains_COV115_2020_reprofile_tooltip" />
      ),
    },
    {
      fiscal_years: [2021],
      subject_ids: ["*"],
      topic_ids: ["COV043", "COV082", "COV113", "COV118", "COV145", "COV204"],
      tooltip: (
        <TM k="covid_estimates_2021_supps_a_2020_partial_reprofile_tooltip" />
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
      tooltip: (
        <TM k="covid_estimates_2021_supps_a_2020_full_reprofile_tooltip" />
      ),
    },
    {
      fiscal_years: [2021],
      subject_ids: ["*"],
      topic_ids: [
        "COV032",
        "COV088",
        "COV112",
        "COV119",
        "COV121",
        "COV125",
        "COV134",
      ],
      tooltip: (
        <TM k="covid_estimates_2021_supps_b_2020_full_reprofile_tooltip" />
      ),
    },
    {
      fiscal_years: [2021],
      subject_ids: ["*"],
      topic_ids: [
        "COV145",
        "COV043",
        "COV065",
        "COV134",
        "COV083",
        "COV002",
        "COV079",
        "COV153",
      ],
      tooltip: (
        <TM k="covid_estimates_2021_supps_c_2020_full_reprofile_tooltip" />
      ),
    },
  ],
};

export const get_tooltip = (topic, selected_year, panel_subject_id, topic_id) =>
  _.chain(tooltips_by_topic)
    .get(topic)
    .filter(
      ({ fiscal_years, subject_ids, topic_ids }) =>
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
    .map(({ tooltip }, ix) => (
      <Tooltip tooltip_content={tooltip} key={ix}>
        <IconQuestion width={"1.2em"} svg_style={{ verticalAlign: "0em" }} />
      </Tooltip>
    ))
    .value();
