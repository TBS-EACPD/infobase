import _ from "lodash";
import React from "react";

import { HeightClippedGraph } from "src/panels/panel_declarations/common_panel_components.js";
import { declare_panel } from "src/panels/panel_declarations/common_panel_utils.js";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel.js";

import {
  DisplayTable,
  create_text_maker_component,
} from "src/components/index.js";

import { useSummaryServices } from "src/models/populate_services.js";

import { Subject } from "src/models/subject.js";

import text from "./services.yaml";

const { Dept } = Subject;
const { text_maker, TM } = create_text_maker_component(text);

const HighApplicationVolumePanel = ({ subject }) => {
  const { loading, data } = useSummaryServices({
    subject,
    query_fragment: `
    service_high_volume_summary {
      id
      subject_id
      total_volume
    }`,
  });
  if (loading) {
    return <span>loading</span>;
  }
  const { service_high_volume_summary } = data;
  const highest_volume_dept = service_high_volume_summary[0];

  const column_configs = {
    org_id: {
      index: 0,
      header: text_maker("org"),
      is_searchable: true,
      formatter: (org_id) => (
        <a href={`#orgs/dept/${org_id}/infograph/services`}>
          {Dept.lookup(org_id).name}
        </a>
      ),
      raw_formatter: (org_id) => Dept.lookup(org_id).name,
    },
    total_volume: {
      index: 1,
      header: text_maker("applications_and_calls"),
      is_summable: true,
      formatter: "big_int",
    },
  };
  return (
    <HeightClippedGraph clipHeight={600}>
      <TM
        className="medium-panel-text"
        k="high_application_volume_text"
        args={{
          num_of_high_volume_depts: service_high_volume_summary.length,
          highest_volume_dept: Dept.lookup(highest_volume_dept.org_id).name,
          highest_volume_value: highest_volume_dept.total_volume,
        }}
      />
      <DisplayTable
        unsorted_initial={true}
        data={service_high_volume_summary}
        column_configs={column_configs}
      />
    </HeightClippedGraph>
  );
};

export const declare_high_application_volume_panel = () =>
  declare_panel({
    panel_key: "high_application_volume",
    levels: ["gov"],
    panel_config_func: (level, panel_key) => ({
      title: text_maker("high_application_volume_title"),
      footnotes: false,
      render({ title, calculations, sources }) {
        const { subject } = calculations;
        return (
          <InfographicPanel title={title} sources={sources}>
            <HighApplicationVolumePanel subject={subject} />
          </InfographicPanel>
        );
      },
    }),
  });
