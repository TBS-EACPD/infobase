import _ from "lodash";
import React from "react";

import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import { create_text_maker_component } from "src/components/index";

import { ResultCounts, current_drr_key } from "src/models/results";
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

export const declare_simplographic_panel = () =>
  declare_panel({
    panel_key: "simplographic",
    subject_types: ["gov"],
    panel_config_func: () => ({
      legacy_non_table_dependencies: ["requires_result_counts"],
      legacy_table_dependencies: ["orgVoteStatPa", "orgEmployeeRegion"],
      get_dataset_keys: () => ["org_vote_stat", "employee_region"],
      get_title: () => text_maker("simplographic_title"),
      calculate: ({ tables }) => {
        const { orgVoteStatPa, orgEmployeeRegion } = tables;
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

        //People calcs
        const employee_by_prov = orgEmployeeRegion.sum_cols_by_grouped_data(
          "{{ppl_last_year}}",
          "region_code"
        );
        const total_employees = _.chain(employee_by_prov)
          .values()
          .sum()
          .value();
        const ncr_employees = employee_by_prov.ncr;
        const empl_count_ncr_ratio = ncr_employees / total_employees;

        const gov_counts = ResultCounts.get_gov_counts();

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

        const org_employee_type_link = rpb_link({ table: "orgEmployeeType" });
        const org_employee_region_link = rpb_link({
          table: "orgEmployeeRegion",
        });
        const org_vote_stat_pa_link = rpb_link({ table: "orgVoteStatPa" });

        const results_link = infographic_href_template(Gov.instance, "results");

        const num_results = gov_counts[`${current_drr_key}_results`];
        const num_indicators = gov_counts[`${current_drr_key}_total`];
        const num_met = gov_counts[`${current_drr_key}_indicators_met`];

        const pct_met = num_met / num_indicators;

        return {
          largest_items,
          gov_exp_pa_last_year,
          empl_count_total: total_employees,
          empl_count_ncr_ratio,
          num_federal_inst: federal_institutions.length,
          num_ministries: ministries.length,

          num_results,
          num_indicators,
          num_met,
          pct_met,

          org_vote_stat_pa_link,
          org_employee_type_link,
          org_employee_region_link,
          results_link,
        };
      },

      render({ title, calculations }) {
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
      },
    }),
  });
