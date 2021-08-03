import _ from "lodash";
import React from "react";

import { HeightClippedGraph } from "src/panels/panel_declarations/common_panel_components";
import { declare_panel } from "src/panels/panel_declarations/common_panel_utils";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";

import {
  LeafSpinner,
  DisplayTable,
  create_text_maker_component,
} from "src/components/index";

import { useSummaryServices } from "src/models/populate_services";

import { Subject } from "src/models/subject";

import text from "./services.yaml";

const { Gov, Dept } = Subject;
const { text_maker, TM } = create_text_maker_component(text);

const OrgsReportingServicesPanel = () => {
  const { loading, data } = useSummaryServices({
    subject: Gov,
    query_fragment: `
    service_general_stats {
      number_of_services
    }
    orgs_reporting_services_summary {
      id
      subject_id
      number_of_services
      total_volume
    }`,
  });
  if (loading) {
    return <LeafSpinner config_name="inline_panel" />;
  }
  const {
    orgs_reporting_services_summary,
    service_general_stats: { number_of_services },
  } = data;

  const column_configs = {
    subject_id: {
      index: 0,
      header: text_maker("org"),
      is_searchable: true,
      formatter: (org_id) => (
        <a href={`#orgs/dept/${org_id}/infograph/services`}>
          {Dept.lookup(org_id).name}
        </a>
      ),
      plain_formatter: (org_id) => Dept.lookup(org_id).name,
    },
    number_of_services: {
      index: 1,
      header: text_maker("number_of_services"),
      formatter: "big_int",
    },
    total_volume: {
      index: 2,
      header: text_maker("application_digital"),
      is_summable: true,
      formatter: "big_int",
    },
  };
  return (
    <HeightClippedGraph clipHeight={600}>
      {
        <TM
          className="medium-panel-text"
          k="orgs_reporting_services_text"
          args={{
            number_of_depts: orgs_reporting_services_summary.length,
            number_of_applications: _.sumBy(
              orgs_reporting_services_summary,
              "total_volume"
            ),
            number_of_services,
          }}
        />
      }
      <DisplayTable
        unsorted_initial={true}
        data={orgs_reporting_services_summary}
        column_configs={column_configs}
      />
    </HeightClippedGraph>
  );
};

export const declare_orgs_reporting_services_panel = () =>
  declare_panel({
    panel_key: "orgs_reporting_services",
    levels: ["gov"],
    panel_config_func: (level, panel_key) => ({
      title: text_maker("orgs_reporting_services_title"),
      footnotes: false,
      render({ title, calculations, sources }) {
        return (
          <InfographicPanel title={title} sources={sources}>
            <OrgsReportingServicesPanel />
          </InfographicPanel>
        );
      },
    }),
  });
