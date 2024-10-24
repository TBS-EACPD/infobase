import _ from "lodash";
import React, { useState } from "react";

import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import {
  create_text_maker_component,
  LeafSpinner,
  StatelessModal,
} from "src/components/index";

import {
  useServiceSummaryGov,
  useServiceSummaryOrg,
} from "src/models/services/queries";

import { FormFrontend } from "src/FormFrontend";

// import { formats } from "src/core/format";

import text from "./services.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const ServicesIntroPanel = ({ subject }) => {
  const useSummaryServices = {
    gov: useServiceSummaryGov,
    dept: useServiceSummaryOrg,
  }[subject.subject_type];
  const { loading, data } = useSummaryServices({ id: subject.id });

  const [show_service_feedback, set_show_service_feedback] = useState(false);

  if (loading) {
    return <LeafSpinner config_name="subroute" />;
  }

  const {
    service_general_stats: {
      report_years,
      // number_of_services,
      // number_of_online_enabled_services,
      // pct_of_standards_met_high_vol_services,
      // pct_of_online_client_interaction_pts,
      num_of_subject_offering_services,
      num_of_programs_offering_services,
    },
  } = data;

  // const pct_formatter = (value) => formats.percentage1_raw(value);

  return (
    <div className="medium-panel-text">
      <TM
        k={`services_intro_${subject.subject_type}`}
        args={{
          subject,
          from_year: _.last(report_years),
          to_year: _.first(report_years),
          ...(subject.subject_type === "gov"
            ? { num_of_subject_offering_services }
            : { num_of_programs_offering_services }),
        }}
      />
      <p>
        {text_maker("service_inventory_feedback_request")}{" "}
        <button
          onClick={() => set_show_service_feedback(true)}
          className={"link-styled button-unstyled"}
        >
          {text_maker("service_inventory_feedback_button")}
        </button>
      </p>
      <StatelessModal
        title={text_maker("service_inventory_feedback_title")}
        show={show_service_feedback}
        on_close_callback={() => set_show_service_feedback(false)}
      >
        <FormFrontend template_name="service_inventory_feedback" />
      </StatelessModal>
      {/* SI_TODO what's this, can it be deleted?
      />
      {/* SI_TODO This was once part of visaulization
      OCIO decided numbers don't match "their" numbers (either their screwed up DRR, or possibly MAF)
      Hence, wanted them removed but I believe they're valuable visualizations so kept the code around.
      I've talked to Mike to we should bring this back, possibly change around to numbers they want
      But I'm now doubtful if that will happen.
      
      To remove this code, server populate summary part should also be removed

      <div className="pane-row">
        <div className="pane-rect">
          <span className="pane-max-width">
            <TM
              k={`${subject.subject_type}_total_number_of_services`}
              args={{ subject }}
            />
          </span>
          <TM
            className="large_panel_text"
            k="number_value_of_services"
            args={{ number_of_services }}
          />
        </div>
        <div className="pane-rect">
          <span className="pane-max-width">
            <TM k="pct_of_met_high_vol_services" args={{ subject }} />
          </span>
          <span className="large_panel_text bold">
            {pct_formatter(pct_of_standards_met_high_vol_services)}
          </span>
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
            */}
    </div>
  );
};

export const declare_services_intro_panel = () =>
  declare_panel({
    panel_key: "services_intro",
    subject_types: ["gov", "dept"],
    panel_config_func: () => ({
      get_title: () => text_maker("services_intro_title"),
      calculate: ({ subject }) => {
        return {
          subject,
        };
      },
      get_dataset_keys: () => ["service_inventory"],
      render({ title, subject, sources, datasets }) {
        return (
          <InfographicPanel title={title} sources={sources} datasets={datasets}>
            <ServicesIntroPanel subject={subject} />
          </InfographicPanel>
        );
      },
    }),
  });
