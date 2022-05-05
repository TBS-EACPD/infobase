import _ from "lodash";
import React from "react";

import { formats } from "src/core/format";
import { lang } from "src/core/injected_build_constants";

import { Tooltip } from "src/components";
import { IconQuestion } from "src/icons/icons";

import { covid_create_text_maker_component } from "./covid_text_provider";

import text from "./covid_estimates_tooltips.yaml";

const { TM, text_maker } = covid_create_text_maker_component(text);

const { year_to_fiscal_year } = formats;

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
      subject_ids: ["gov", "280"],
      topic_ids: ["COV082"],
      tooltip: (
        <TM k="covid_estimates_2021_mains_COV082_2020_reprofile_tooltip" />
      ),
    },
    {
      fiscal_years: [2021],
      subject_ids: ["gov", "280"],
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
        <TM
          k="covid_estimates_generic_full_reprofile_tooltip"
          args={{
            est_doc: text_maker("covid_supps_est_doc_template", {
              letter: "B",
            }),
            approved_year: year_to_fiscal_year(2020),
            reprofiled_year: year_to_fiscal_year(2021),
          }}
        />
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
        <TM
          k="covid_estimates_generic_full_reprofile_tooltip"
          args={{
            est_doc: text_maker("covid_supps_est_doc_template", {
              letter: "C",
            }),
            approved_year: year_to_fiscal_year(2020),
            reprofiled_year: year_to_fiscal_year(2021),
          }}
        />
      ),
    },
    {
      fiscal_years: [2022],
      subject_ids: ["gov"],
      topic_ids: ["COV014", "COV026", "COV112", "COV043"],
      tooltip: (
        <TM
          k="covid_estimates_generic_full_reprofile_tooltip"
          args={{
            est_doc: text_maker("est_doc_mains"),
            approved_year: year_to_fiscal_year(2020),
            reprofiled_year: year_to_fiscal_year(2022),
          }}
        />
      ),
    },
    {
      fiscal_years: [2022],
      subject_ids: ["gov"],
      topic_ids: ["COV145"],
      tooltip: (
        <TM
          k="covid_estimates_generic_partial_reprofile_tooltip"
          args={{
            est_doc: text_maker("est_doc_mains"),
            approved_year: year_to_fiscal_year(2020),
            reprofiled_year: year_to_fiscal_year(2022),
          }}
        />
      ),
    },
    {
      fiscal_years: [2022],
      subject_ids: ["gov"],
      topic_ids: ["COV062"],
      tooltip: (
        <TM
          k="covid_estimates_generic_full_reprofile_tooltip"
          args={{
            est_doc: text_maker("est_doc_mains"),
            approved_year: year_to_fiscal_year(2021),
            reprofiled_year: year_to_fiscal_year(2022),
          }}
        />
      ),
    },
    {
      fiscal_years: [2022],
      subject_ids: ["gov"],
      topic_ids: ["COV211", "COV226"],
      tooltip: (
        <TM
          k="covid_estimates_generic_partial_reprofile_tooltip"
          args={{
            est_doc: text_maker("est_doc_mains"),
            approved_year: year_to_fiscal_year(2021),
            reprofiled_year: year_to_fiscal_year(2022),
          }}
        />
      ),
    },
    {
      fiscal_years: [2022],
      subject_ids: ["gov"],
      topic_ids: ["COV010", "COV082"],
      tooltip: (
        <TM
          k="covid_estimates_generic_partial_reprofile_tooltip"
          args={{
            est_doc: text_maker("est_doc_mains"),
            approved_year: {
              en: "2020-21 and 2021-22",
              fr: "2020-2021 et 2021-2022",
            }[lang],
            reprofiled_year: year_to_fiscal_year(2022),
          }}
        />
      ),
    },
    //{
    //  fiscal_years: [2022],
    //  subject_ids: ["*"],
    //  topic_ids: ["COV014", "COV026", "COV112", "COV043"],
    //  tooltip: (
    //    <TM
    //      k="covid_estimates_generic_full_reprofile_tooltip"
    //      args={{
    //        est_doc: text_maker("est_doc_mains"),
    //        approved_year: year_to_fiscal_year(2020),
    //        reprofiled_year: year_to_fiscal_year(2022),
    //      }}
    //    />
    //  ),
    //},
    {
      fiscal_years: [2022],
      subject_ids: ["150"],
      topic_ids: ["COV145"],
      tooltip: (
        <TM
          k="covid_estimates_generic_full_reprofile_tooltip"
          args={{
            est_doc: text_maker("est_doc_mains"),
            approved_year: year_to_fiscal_year(2020),
            reprofiled_year: year_to_fiscal_year(2022),
          }}
        />
      ),
    },
    {
      fiscal_years: [2022],
      subject_ids: ["280"],
      topic_ids: ["COV010", "COV082"],
      tooltip: (
        <TM
          k="covid_estimates_generic_partial_reprofile_tooltip"
          args={{
            est_doc: text_maker("est_doc_mains"),
            approved_year: year_to_fiscal_year(2020),
            reprofiled_year: year_to_fiscal_year(2022),
          }}
        />
      ),
    },
    // {
    //   fiscal_years: [2022],
    //   subject_ids: ["*"],
    //   topic_ids: ["COV062", "COV226"],
    //   tooltip: (
    //     <TM
    //       k="covid_estimates_generic_full_reprofile_tooltip"
    //       args={{
    //         est_doc: text_maker("est_doc_mains"),
    //         approved_year: year_to_fiscal_year(2021),
    //         reprofiled_year: year_to_fiscal_year(2022),
    //       }}
    //     />
    //   ),
    // },
    {
      fiscal_years: [2022],
      subject_ids: ["228", "280"],
      topic_ids: ["COV082"],
      tooltip: (
        <TM
          k="covid_estimates_generic_partial_reprofile_tooltip"
          args={{
            est_doc: text_maker("est_doc_mains"),
            approved_year: year_to_fiscal_year(2021),
            reprofiled_year: year_to_fiscal_year(2022),
          }}
        />
      ),
    },
    {
      fiscal_years: [2022],
      subject_ids: ["280"],
      topic_ids: ["COV211"],
      tooltip: (
        <TM
          k="covid_estimates_generic_partial_reprofile_tooltip"
          args={{
            est_doc: text_maker("est_doc_mains"),
            approved_year: year_to_fiscal_year(2021),
            reprofiled_year: year_to_fiscal_year(2022),
          }}
        />
      ),
    },
    {
      fiscal_years: [2022],
      subject_ids: ["130"],
      topic_ids: ["COV010"],
      tooltip: (
        <TM
          k="covid_estimates_generic_full_reprofile_tooltip"
          args={{
            est_doc: text_maker("est_doc_mains"),
            approved_year: {
              en: "2020-21 and 2021-22,",
              fr: "2020-2021 et 2021-2022,",
            }[lang],
            reprofiled_year: year_to_fiscal_year(2022),
          }}
        />
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
