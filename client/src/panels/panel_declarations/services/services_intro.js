import React from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";

import { create_text_maker_component, LeafSpinner } from "src/components/index";

import { useSummaryServices } from "src/models/populate_services";

import text from "./services.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const ServicesIntroPanel = ({ subject }) => {
  const { loading, data } = useSummaryServices({
    subject,
    query_fragment: `service_general_stats{
      id
      number_of_services
      number_of_reporting_orgs
    }`,
  });
  if (loading) {
    return <LeafSpinner config_name="inline_panel" />;
  }
  const {
    service_general_stats: { number_of_reporting_orgs },
  } = data;
  return (
    <div className="medium-panel-text">
      <TM k="services_intro_gov" args={{ number_of_reporting_orgs }} />
      <div className="pane-row">
        <div className="pane-rect">
          <span className="pane-max-width">GC reports</span>
          <span className="large_panel_text bold">X services</span>
        </div>
        <div className="pane-rect">
          <span className="pane-max-width">
            % of High volume services which met Service Standards
          </span>
          <span className="large_panel_text bold">X%</span>
        </div>
      </div>
      <div className="pane-row">
        <div className="pane-rect">
          <span className="pane-max-width">
            % of client interaction points available online
          </span>
          <span className="large_panel_text bold">X%</span>
        </div>
        <div className="pane-rect">
          <span className="pane-max-width">
            % of services that are online end-to-end
          </span>
          <span className="large_panel_text bold">X%</span>
        </div>
      </div>
    </div>
  );
};

export const declare_services_intro_panel = () =>
  declare_panel({
    panel_key: "services_intro",
    levels: ["gov", "dept", "program"],
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