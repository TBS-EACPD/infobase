import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";

import { create_text_maker_component, LeafSpinner } from "src/components/index";

import { useSummaryServices } from "src/models/populate_services";

import { formats } from "src/core/format";

import text from "./services.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const ServicesIntroPanel = ({ subject }) => {
  const { loading, data } = useSummaryServices({
    subject,
    query_fragment: `service_general_stats{
      id
      number_of_services
      number_of_online_enabled_services
      pct_of_online_client_interaction_pts
      num_of_subject_offering_services
    }`,
  });
  if (loading) {
    return <LeafSpinner config_name="inline_panel" />;
  }
  const {
    service_general_stats: {
      number_of_services,
      number_of_online_enabled_services,
      pct_of_online_client_interaction_pts,
      num_of_subject_offering_services,
      num_of_programs_offering_services,
    },
  } = data;

  const pct_formatter = (value) => formats.percentage1_raw(value);

  return (
    <div className="medium-panel-text">
      <TM
        k={`services_intro_${subject.level}`}
        args={{
          subject,
          ...(subject.level === "gov"
            ? { num_of_subject_offering_services }
            : { num_of_programs_offering_services }),
        }}
      />
      <div className="pane-row">
        <div className="pane-rect">
          <span className="pane-max-width">
            <TM k="total_number_of_services" args={{ subject }} />
          </span>
          <TM
            className="large_panel_text"
            k="number_value_of_services"
            args={{ number_of_services }}
          />
        </div>
        <div className="pane-rect">
          <span className="pane-max-width">
            <TM k="pct_of_met_high_vol_services" />
          </span>
          <span className="large_panel_text bold">X%</span>
        </div>
      </div>
      <div className="pane-row">
        <div className="pane-rect">
          <span className="pane-max-width">
            <TM k="pct_of_client_interaction_pts_online" />
          </span>
          <span className="large_panel_text bold">
            {pct_formatter(pct_of_online_client_interaction_pts)}
          </span>
        </div>
        <div className="pane-rect">
          <span className="pane-max-width">
            <TM k="pct_of_online_end_services" />
          </span>
          <span className="large_panel_text bold">
            {pct_formatter(
              number_of_online_enabled_services / number_of_services
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export const declare_services_intro_panel = () =>
  declare_panel({
    panel_key: "services_intro",
    levels: ["gov", "dept"],
    panel_config_func: (level, panel_key) => ({
      title: text_maker("services_intro_title"),
      calculate: (subject) => {
        return {
          subject,
        };
      },
      footnotes: false,
      render({ title, calculations, sources }) {
        const { subject } = calculations;
        return (
          <InfographicPanel title={title} sources={sources}>
            <ServicesIntroPanel subject={subject} />
          </InfographicPanel>
        );
      },
    }),
  });
