import _ from "lodash";
import React from "react";
import { createSelector } from "reselect";

import { IndicatorList } from "src/panels/panel_declarations/results/result_components";
import {
  TM,
  text_maker,
} from "src/panels/panel_declarations/results/result_text_provider";

import { Indicator, result_docs } from "src/models/results";

import { infographic_href_template } from "src/link_utils";

import "./result_displays.scss";

const type_text_keys = {
  dept: "orgs",
  cr: "core_responsibilities",
  so: "strategic_outcomes",
  program: "programs",
  dr: "dept_results",
  result: "results",
};

export const get_type_name = (type_key) => {
  const text_key = type_text_keys[type_key];
  return text_key ? text_maker(text_key) : null;
};

export const ResultCounts = ({ base_hierarchy, doc, subject }) => {
  const indicators = _.filter(Indicator.get_flat_indicators(subject), { doc });

  const indicator_count_obj = {
    count: indicators.length,
    type_key: "indicator",
    type_name: "indicators",
  };

  const count_items = _.chain(base_hierarchy)
    .reject("root")
    .groupBy("data.type")
    .toPairs()
    .map(([type_key, group]) => ({
      type_name: get_type_name(type_key),
      type_key,
      count: group.length,
    }))
    .concat([indicator_count_obj])
    .map(({ type_key, count }) => [type_key, count])
    .fromPairs()
    .value();

  let text_key = "";
  if (subject.subject_type === "dept") {
    if (/drr/.test(doc)) {
      text_key = "result_counts_drr_dept";
    } else {
      text_key = "result_counts_dp_dept";
    }
  } else if (subject.subject_type === "program") {
    if (/drr/.test(doc)) {
      text_key = "result_counts_drr_prog";
    } else {
      text_key = "result_counts_dp_prog";
    }
  } else if (subject.subject_type === "crso") {
    //we only care about CRs, which are only DP
    text_key = "result_counts_dp_cr";
  }

  return (
    <div className="medium-panel-text">
      <TM
        k={text_key}
        args={{
          subject,

          doc_year: result_docs[doc].year,

          num_programs: count_items.program || 0,
          num_prog_results: count_items.result || 0,
          num_results: (count_items.result || 0) + (count_items.dr || 0),
          num_indicators: count_items.indicator || 0,

          num_drs: count_items.dr,
          num_crs: count_items.cr,
        }}
      />
    </div>
  );
};

export const spending_header = createSelector(
  (doc) => doc,
  (doc) => (
    <TM
      k={/dp/.test(doc) ? "planned_spending_header" : "actual_spending_header"}
      args={{
        year: result_docs[doc].primary_resource_year_written,
      }}
    />
  )
);

export const fte_header = createSelector(
  (doc) => doc,
  (doc) => (
    <TM
      k={/dp/.test(doc) ? "planned_ftes_header" : "actual_ftes_header"}
      args={{
        year: result_docs[doc].primary_resource_year_written,
      }}
    />
  )
);

export const ResultNodeContent = ({
  node: {
    data: { result, contributing_programs, result_subject, indicators },
    children: indicator_nodes,
  },
  doc,
}) => (
  <div className="indicator-container-container">
    <div className="indicator-container">
      <IndicatorList indicators={_.map(indicator_nodes, "data.indicator")} />
    </div>
    {!_.isEmpty(contributing_programs) && (
      <div>
        <div className="h6 heavy-weight">
          <TM k="programs_tagged_as_dr_contributors" />
        </div>
        <ul>
          {_.map(contributing_programs, (prog) => (
            <li key={prog.id}>
              <a href={infographic_href_template(prog)}>{prog.name}</a>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);
