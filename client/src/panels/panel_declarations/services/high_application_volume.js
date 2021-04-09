import _ from "lodash";
import React from "react";

import { HeightClippedGraph } from "src/panels/panel_declarations/common_panel_components.js";
import { declare_panel } from "src/panels/panel_declarations/common_panel_utils.js";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel.js";

import {
  DisplayTable,
  create_text_maker_component,
} from "src/components/index.js";

import { useServices } from "src/models/populate_services.js";

import { Subject } from "src/models/subject.js";

import {
  delivery_channels_keys,
  delivery_channels_query_fragment,
} from "./shared.js";

import text from "./services.yaml";

const { Dept } = Subject;
const { text_maker, TM } = create_text_maker_component(text);

const HighApplicationVolumePanel = ({ subject }) => {
  const { loading, data } = useServices({
    subject,
    service_fragments: delivery_channels_query_fragment,
  });
  if (loading) {
    return <span>loading</span>;
  }

  const processed_data = _.chain(data)
    .groupBy("org_id")
    .map((org_services, org_id) => ({
      org_id,
      total_volume: _.sumBy(org_services, (service) =>
        _.reduce(
          delivery_channels_keys,
          (sum, key) =>
            sum + _.sumBy(service.service_report, `${key}_count`) || 0,
          0
        )
      ),
    }))
    // 45,000+ volume is considered "high volume"
    .reject(({ total_volume }) => total_volume <= 45000)
    .sortBy("total_volume")
    .reverse()
    .value();

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
          num_of_high_volume_depts: processed_data.length,
          highest_volume_dept: Dept.lookup(processed_data[0].org_id).name,
          highest_volume_value: processed_data[0].total_volume,
        }}
      />
      <DisplayTable
        unsorted_initial={true}
        data={processed_data}
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
<<<<<<< HEAD
=======
      requires_services: true,
>>>>>>> whole change to apollo hooks copied from commits that became too hard to solve conflicts, please refer to PR to refer to previous commits
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
