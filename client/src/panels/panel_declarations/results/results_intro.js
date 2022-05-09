import React from "react";

import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import { create_text_maker_component, Tooltip } from "src/components/index";

import { lang, is_a11y_mode } from "src/core/injected_build_constants";

import { IconQuestion } from "src/icons/icons";

import { get_static_url } from "src/request_utils";

import { result_docs, current_drr_key, current_dp_key } from "./results_common";

import text from "./results_intro_text.yaml";
const { text_maker, TM } = create_text_maker_component(text);

const ResultsIntroPanel = ({ doc_urls }) => {
  return (
    <div className="row align-items-center">
      <div className="col-12 col-lg-7 medium-panel-text">
        <TM k="results_intro_text" />
      </div>
      {!is_a11y_mode && (
        <div className="col-12 col-lg-5">
          <div
            style={{
              padding: "20px",
            }}
          >
            <img
              alt={text_maker("results_intro_img_text")}
              src={get_static_url(`png/result-taxonomy-${lang}.png`)}
              style={{
                width: "100%",
                maxHeight: "500px",
              }}
            />
          </div>
        </div>
      )}
      <div className="col-12 col-lg-12 medium-panel-text">
        <p>
          <TM k="gba_plus_intro_text_p_1" />
          <Tooltip
            tooltip_content={text_maker("gba_plus_intro_tooltip_content")}
          >
            <IconQuestion
              width={"1.2em"}
              svg_style={{ verticalAlign: "-0.2em" }}
            />
          </Tooltip>
          {"."}
        </p>
        <TM k="gba_plus_intro_text_p_2" />
        <TM k="reports_links_text" args={doc_urls} />
      </div>
    </div>
  );
};

export const declare_results_intro_panel = () =>
  declare_panel({
    panel_key: "results_intro",
    subject_types: ["gov", "dept"],
    panel_config_func: () => ({
      get_title: () => text_maker("results_intro_title"),
      calculate: () => ({
        doc_urls: {
          dp_url_year: result_docs[current_dp_key].year,
          dp_url: result_docs[current_dp_key][`doc_url_${lang}`],
          drr_url_year: result_docs[current_drr_key].year,
          drr_url: result_docs[current_drr_key][`doc_url_${lang}`],
        },
      }),
      render({ title, subject, calculations, sources, datasets, footnotes }) {
        return (
          <InfographicPanel {...{ title, sources, datasets, footnotes }}>
            <ResultsIntroPanel subject={subject} {...calculations} />
          </InfographicPanel>
        );
      },
    }),
  });
