import _ from "lodash";
import React from "react";

import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import { create_text_maker_component, LeafSpinner } from "src/components/index";

import { useGovPeopleSummary } from "src/models/people/queries";
import {
  ResultCounts,
  ResultDrCounts,
  ResultPrCounts,
  current_drr_key,
} from "src/models/results";
import { Gov, Dept } from "src/models/subjects";

import { is_mobile } from "src/core/feature_detection";

import {
  IconFinances,
  IconEmployees,
  IconHierarchy,
  IconClipboard,
} from "src/icons/icons";

import { infographic_href_template, rpb_link } from "src/link_utils";

import simplographic_text from "./simplographic.yaml";
import "./simplographic.scss";

const { text_maker, TM } = create_text_maker_component(simplographic_text);

// Split the panel implementation from the declaration
const SimplographicPanel = ({ title, calculations, peopleLoading }) => {
  if (peopleLoading) {
    return <LeafSpinner config_name="subroute" />;
  }

  const Row = (props) => {
    const this_row_props = {
      className: "row about-government-intro-grid",
      style: {
        borderTop: 0,
        padding: "15px 0px",
        marginLeft: "-50px",
        marginRight: "-15px",
      },
    };
    if (props.top_border) {
      this_row_props.style.borderTop = "#";
    }
    return (
      <div {...this_row_props}>
        <div
          className="col-12 col-lg-3"
          style={{ flexDirection: "column", justifyContent: "center" }}
        >
          <div
            className="justify-content-center"
            style={{
              display: "flex",
              alignItems: "center",
              height: "100%",
            }}
          >
            {props.svg}
          </div>
        </div>
        <section
          className="col-12 col-lg-9"
          style={{ flexDirection: "column" }}
        >
          <div
            className="h2 mrgn-tp-sm"
            style={{
              textAlign: is_mobile() ? "center" : "inherit",
            }}
          >
            <TM k={props.title_key} />
          </div>
          <TM el="p" k={props.text_key} args={calculations} />
        </section>
      </div>
    );
  };

  return (
    <InfographicPanel title={title}>
      <div className="medium-panel-text">
        <Row
          top_border
          svg={
            <IconFinances
              width="15rem"
              color="#2C70C9"
              alternate_color={false}
            />
          }
          title_key="simplographic_spending_title"
          text_key="simplographic_spending_text"
        />
        <Row
          svg={
            <IconEmployees
              width="15rem"
              color="#2C70C9"
              alternate_color={false}
            />
          }
          title_key="simplographic_people_title"
          text_key="simplographic_people_text"
        />
        <Row
          svg={
            <IconHierarchy
              width="15rem"
              color="#2C70C9"
              alternate_color={false}
            />
          }
          title_key="simplographic_struct_title"
          text_key="simplographic_struct_text"
        />
        <Row
          svg={
            <IconClipboard
              width="15rem"
              color="#2C70C9"
              alternate_color={false}
            />
          }
          title_key="simplographic_results_title"
          text_key="simplographic_results_text"
        />
      </div>
    </InfographicPanel>
  );
};

// Create a container component for the panel
const SimplographicContainer = (props) => {
  // Use GraphQL hooks for people data
  const { data: peopleData, loading: peopleLoading } = useGovPeopleSummary({});

  // Process peopleData when it's loaded
  const processedProps = { ...props };

  if (!peopleLoading && peopleData) {
    const regionData = peopleData.region || [];

    const latestYearData = regionData
      .map((region) => {
        if (!region || !region.yearly_data) return null;
        const sortedYearlyData = [...region.yearly_data]
          .filter((yd) => yd && yd.year && yd.value !== null)
          .sort((a, b) => b.year - a.year);
        return {
          dimension: region.dimension,
          value: sortedYearlyData[0]?.value || 0,
        };
      })
      .filter(Boolean);

    const total_employees = _.sumBy(latestYearData, "value");
    const ncr_employees =
      latestYearData.find(
        (r) => r.dimension === "National Capital Region (NCR)"
      )?.value || 0;
    const empl_count_ncr_ratio = ncr_employees / total_employees;

    processedProps.calculations = {
      ...props.calculations,
      empl_count_total: total_employees,
      empl_count_ncr_ratio,
    };
  }

  return (
    <SimplographicPanel
      {...processedProps}
      peopleData={peopleData}
      peopleLoading={peopleLoading}
    />
  );
};

export const declare_simplographic_panel = () =>
  declare_panel({
    panel_key: "simplographic",
    subject_types: ["gov"],
    panel_config_func: () => ({
      legacy_non_table_dependencies: ["requires_result_counts"],
      legacy_table_dependencies: ["orgVoteStatPa"],
      get_dataset_keys: () => ["org_vote_stat"],
      get_title: () => text_maker("simplographic_title"),
      calculate: ({ tables }) => {
        const { orgVoteStatPa } = tables;
        const gov_exp_pa_last_year = orgVoteStatPa
          .q()
          .sum("{{pa_last_year}}exp");

        const federal_institutions = _.chain(Dept.store.get_all())
          .filter("inst_form.parent_form.parent_form")
          .filter(
            (org) => org.inst_form.parent_form.parent_form.id === "fed_int_gp"
          )
          .reject("end_yr")
          .reject({ id: "999" })
          .value();

        const ministries = _.chain(federal_institutions)
          .map((org) => org.ministry)
          .uniqBy()
          .value();

        const gov_counts = ResultCounts.get_gov_counts();
        const dr_counts = ResultDrCounts.get_gov_counts();
        const pr_counts = ResultPrCounts.get_gov_counts();

        const col = "{{pa_last_year}}exp";
        const largest_items = _.chain(orgVoteStatPa.data)
          .sortBy(col)
          .takeRight(3)
          .reverse()
          .map((row) => ({
            subject: Dept.store.lookup(row.dept),
            desc: row.desc,
            amt: row[col],
          }))
          .value();

        const org_vote_stat_pa_link = rpb_link({ table: "orgVoteStatPa" });
        const results_link = infographic_href_template(Gov.instance, "results");

        const num_results = gov_counts[`${current_drr_key}_results`];
        const num_indicators = gov_counts[`${current_drr_key}_total`];
        const num_met = gov_counts[`${current_drr_key}_indicators_met`];

        const dr_results = dr_counts[`${current_drr_key}_results`];
        const dr_indicators = dr_counts[`${current_drr_key}_total`];
        const dr_met = dr_counts[`${current_drr_key}_indicators_met`];

        const pr_results = pr_counts[`${current_drr_key}_results`];
        const pr_indicators = pr_counts[`${current_drr_key}_total`];
        const pr_met = pr_counts[`${current_drr_key}_indicators_met`];

        const pct_met = num_met / num_indicators;
        const dr_pct_met = dr_met / dr_indicators;
        const pr_pct_met = pr_met / pr_indicators;

        return {
          largest_items,
          gov_exp_pa_last_year,
          num_federal_inst: federal_institutions.length,
          num_ministries: ministries.length,

          num_results,
          num_indicators,
          num_met,
          pct_met,

          dr_results,
          dr_indicators,
          dr_met,
          dr_pct_met,

          pr_results,
          pr_indicators,
          pr_met,
          pr_pct_met,

          org_vote_stat_pa_link,
          results_link,
        };
      },

      render(props) {
        return <SimplographicContainer {...props} />;
      },
    }),
  });
