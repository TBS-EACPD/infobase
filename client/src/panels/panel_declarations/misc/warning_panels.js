import _ from "lodash";
import React, { Fragment } from "react";

import { declare_panel } from "src/panels/PanelRegistry";

import {
  create_text_maker_component,
  AlertBanner,
  KeyConceptList,
  MultiColumnList,
} from "src/components/index";

import { PRE_DRR_PUBLIC_ACCOUNTS_LATE_FTE_MOCK_DOC } from "src/models/footnotes/dynamic_footnotes";

import dynamic_footnote_text from "src/models/footnotes/dynamic_footnotes.yaml";
import * as Results from "src/models/results";
import {
  useServicesForOrg,
  useServicesForProgram,
} from "src/models/services/queries";
import { Dept } from "src/models/subjects";

import text from "./warning_panels.yaml";

const { TM, text_maker } = create_text_maker_component([
  text,
  dynamic_footnote_text,
]);

const { result_docs_in_tabling_order } = Results;
console.log(result_docs_in_tabling_order);

const WarningPanel = ({
  banner_class = "info",
  center_text = true,
  children,
}) => (
  <AlertBanner
    banner_class={banner_class}
    additional_class_names="large_panel_text"
    style={center_text ? { textAlign: "center" } : {}}
  >
    {children}
  </AlertBanner>
);

const common_panel_config = {
  is_meta_panel: true,
  get_title: _.constant(false),
};

const dead_panel_config = {
  ...common_panel_config,
  calculate: ({ subject }) => subject.is_dead,
};

const dept_with_gaps = [
  "263",
  "124",
  "69",
  "150",
  "98",
  "297",
  "347",
  "246",
  "210",
  "539",
  "333",
  "302",
  "222",
  "174",
  "152",
  "134",
  "118",
  "117",
  "114",
  "99",
];

const NoServiceSubmissionPanel = ({ subject }) => {
  const useServices = (() => {
    if (subject.subject_type === "dept") {
      return useServicesForOrg;
    }
    if (subject.subject_type === "program") {
      return useServicesForProgram;
    }
  })();

  const { loading } = useServices({ id: subject.id });
  if (loading) {
    return <span>loading</span>;
  }

  return (
    dept_with_gaps.includes(subject.id) && (
      <WarningPanel banner_class="warning">
        <TM k="no_service_submission_text" args={{ subject }} />
      </WarningPanel>
    )
  );
};

export const declare_no_services_submission_panel = () =>
  declare_panel({
    panel_key: `no_services_submission_warning`,
    subject_types: ["dept", "program"],
    panel_config_func: () => ({
      ...common_panel_config,
      render: ({ subject }) => {
        return <NoServiceSubmissionPanel subject={subject} />;
      },
    }),
  });

export const declare_dead_program_warning_panel = () =>
  declare_panel({
    panel_key: "dead_program_warning",
    subject_types: ["program"],
    panel_config_func: () => ({
      ...dead_panel_config,

      render() {
        return (
          <WarningPanel banner_class="danger">
            <TM k="dead_program_warning" />
          </WarningPanel>
        );
      },
    }),
  });

export const declare_dead_crso_warning_panel = () =>
  declare_panel({
    panel_key: "dead_crso_warning",
    subject_types: ["crso"],
    panel_config_func: () => ({
      ...dead_panel_config,

      render() {
        return (
          <WarningPanel banner_class="danger">
            <TM k="dead_crso_warning" />
          </WarningPanel>
        );
      },
    }),
  });

export const declare_m2m_tag_warning_panel = () =>
  declare_panel({
    panel_key: "m2m_warning",
    subject_types: ["tag"],
    panel_config_func: () => ({
      ...common_panel_config,

      calculate: ({ subject }) => {
        return subject.is_m2m;
      },

      render: () => (
        <WarningPanel center_text={false}>
          <KeyConceptList
            question_answer_pairs={_.map(
              [
                "MtoM_tag_warning_reporting_level",
                "MtoM_tag_warning_resource_splitting",
                "MtoM_tag_warning_double_counting",
              ],
              (key) => [
                <TM key={key + "_q"} k={key + "_q"} />,
                <TM key={key + "_a"} k={key + "_a"} />,
              ]
            )}
          />
        </WarningPanel>
      ),
    }),
  });

const late_panel_config = {
  ...common_panel_config,
};

export const declare_temp_untabled_warning_panel = () =>
  declare_panel({
    panel_key: "temp_untabled_warning",
    subject_types: ["gov", "dept", "crso", "program"],
    panel_config_func: (subject_type) => {
      const docs_with_late_orgs = _.chain(result_docs_in_tabling_order)
        .reverse()
        .filter(({ temp_untabled_orgs }) => temp_untabled_orgs.length > 0)
        .value();

      const get_per_doc_late_results_alert = (
        per_doc_inner_content,
        subject
      ) => {
        return (
          <Fragment>
            {_.map(docs_with_late_orgs, (result_doc, ix) => {
              if (subject_type != "gov") {
                return _.map(result_doc.temp_untabled_orgs, (org_id) => {
                  if (org_id == subject.id)
                    return (
                      <WarningPanel key={ix} banner_class="warning">
                        {per_doc_inner_content(result_doc)}
                      </WarningPanel>
                    );
                });
              } else {
                return (
                  <WarningPanel key={ix} banner_class="warning">
                    {per_doc_inner_content(result_doc)}
                  </WarningPanel>
                );
              }
            })}
          </Fragment>
        );
      };

      switch (subject_type) {
        case "gov":
          return {
            ...late_panel_config,

            calculate: () => !_.isEmpty(docs_with_late_orgs),
            render({ subject }) {
              const per_doc_inner_content = (result_doc) => (
                <div style={{ textAlign: "left" }}>
                  <TM
                    k={"temp_untabled_orgs_gov"}
                    args={{
                      result_doc_name: text_maker(
                        `${result_doc.doc_type}_name`,
                        { year: result_doc.year }
                      ),
                    }}
                  />
                  <MultiColumnList
                    list_items={_.map(
                      result_doc.temp_untabled_orgs,
                      (org_id) => Dept.store.lookup(org_id).name
                    )}
                    column_count={2}
                  />
                </div>
              );

              return get_per_doc_late_results_alert(
                per_doc_inner_content,
                subject
              );
            },
          };
        default:
          return {
            ...late_panel_config,

            calculate: ({ subject }) =>
              _.chain(docs_with_late_orgs)
                .flatMap("temp_untabled_orgs")
                .includes(
                  subject_type === "dept" ? subject.id : subject.dept.id
                )
                .value(),
            render({ subject }) {
              const per_doc_inner_content = (result_doc) => {
                return (
                  <TM
                    k={`temp_untabled_orgs`}
                    args={{
                      result_doc_name: text_maker(
                        `${result_doc.doc_type}_name`,
                        {
                          year: result_doc.year,
                        }
                      ),
                    }}
                  />
                );
              };

              return get_per_doc_late_results_alert(
                per_doc_inner_content,
                subject
              );
            },
          };
      }
    },
  });

export const declare_late_results_warning_panel = () =>
  declare_panel({
    panel_key: "late_results_warning",
    subject_types: ["gov", "dept", "crso", "program"],
    panel_config_func: (subject_type) => {
      const docs_with_late_orgs = _.chain(result_docs_in_tabling_order)
        .reverse()
        .filter(({ late_results_orgs }) => late_results_orgs.length > 0)
        .value();

      const get_per_doc_late_results_alert = (
        per_doc_inner_content,
        subject
      ) => {
        return (
          <Fragment>
            {_.map(docs_with_late_orgs, (result_doc, ix) => {
              if (subject_type != "gov") {
                return _.map(result_doc.late_results_orgs, (org_id) => {
                  if (org_id == subject.id)
                    return (
                      <WarningPanel key={ix} banner_class="warning">
                        {per_doc_inner_content(result_doc)}
                      </WarningPanel>
                    );
                });
              } else {
                return (
                  <WarningPanel key={ix} banner_class="warning">
                    {per_doc_inner_content(result_doc)}
                  </WarningPanel>
                );
              }
            })}
          </Fragment>
        );
      };

      switch (subject_type) {
        case "gov":
          return {
            ...late_panel_config,

            calculate: () => !_.isEmpty(docs_with_late_orgs),
            render({ subject }) {
              const per_doc_inner_content = (result_doc) => (
                <div style={{ textAlign: "left" }}>
                  <TM
                    k={"late_results_warning_gov"}
                    args={{
                      result_doc_name: text_maker(
                        `${result_doc.doc_type}_name`,
                        { year: result_doc.year }
                      ),
                    }}
                  />
                  <MultiColumnList
                    list_items={_.map(
                      result_doc.late_results_orgs,
                      (org_id) => Dept.store.lookup(org_id).name
                    )}
                    column_count={2}
                  />
                </div>
              );

              return get_per_doc_late_results_alert(
                per_doc_inner_content,
                subject
              );
            },
          };
        default:
          return {
            ...late_panel_config,

            calculate: ({ subject }) =>
              _.chain(docs_with_late_orgs)
                .flatMap("late_results_orgs")
                .includes(
                  subject_type === "dept" ? subject.id : subject.dept.id
                )
                .value(),
            render({ subject }) {
              const per_doc_inner_content = (result_doc) => {
                return (
                  <TM
                    k={`late_results_warning_${subject_type}`}
                    args={{
                      result_doc_name: text_maker(
                        `${result_doc.doc_type}_name`,
                        {
                          year: result_doc.year,
                        }
                      ),
                    }}
                  />
                );
              };

              return get_per_doc_late_results_alert(
                per_doc_inner_content,
                subject
              );
            },
          };
      }
    },
  });

const get_declare_late_resources_panel = (planned_or_actual, late_orgs) => () =>
  declare_panel({
    panel_key: `late_${planned_or_actual}_resources_warning`,
    subject_types: ["gov", "dept", "crso", "program"],
    panel_config_func: (subject_type) => {
      switch (subject_type) {
        case "gov":
          return {
            ...late_panel_config,

            calculate: () => !_.isEmpty(late_orgs),
            render: () => (
              <WarningPanel center_text={false} banner_class="warning">
                <TM k={`late_${planned_or_actual}_resources_warning_gov`} />
                <MultiColumnList
                  list_items={_.map(
                    late_orgs,
                    (org_id) => Dept.store.lookup(org_id).name
                  )}
                  column_count={2}
                />
              </WarningPanel>
            ),
          };
        default:
          return {
            ...late_panel_config,

            calculate: ({ subject }) =>
              _.includes(
                late_orgs,
                subject_type === "dept" ? subject.id : subject.dept.id
              ),
            render: () => (
              <WarningPanel banner_class="warning">
                <TM
                  k={`late_${planned_or_actual}_resources_warning_${subject_type}`}
                />
              </WarningPanel>
            ),
          };
      }
    },
  });

const depts_with_late_actual_resources = _.chain(result_docs_in_tabling_order)
  .filter(({ doc_type }) => doc_type === "drr")
  .last()
  .get("late_resources_orgs")
  .concat(PRE_DRR_PUBLIC_ACCOUNTS_LATE_FTE_MOCK_DOC.late_resources_orgs)
  .uniq()
  .value();
export const declare_late_actual_resources_panel =
  get_declare_late_resources_panel("actual", depts_with_late_actual_resources);

const depts_with_late_planned_resources = _.chain(result_docs_in_tabling_order)
  .filter(({ doc_type }) => doc_type === "dp")
  .last()
  .get("late_resources_orgs")
  .value();
export const declare_late_planned_resources_panel =
  get_declare_late_resources_panel(
    "planned",
    depts_with_late_planned_resources
  );
