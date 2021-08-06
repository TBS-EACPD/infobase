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

const { Dept, Program } = Subject;
const { text_maker, TM } = create_text_maker_component(text);

const OrgsReportingServicesPanel = ({ subject }) => {
  const { loading, data } = useSummaryServices({
    subject,
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
  const is_gov = subject.level === "gov";
  const correct_subject = is_gov ? Dept : Program;

  const column_configs = {
    subject_id: {
      index: 0,
      header: is_gov ? text_maker("org") : text_maker("programs"),
      is_searchable: true,
      formatter: (subject_id) => (
        <a href={`#orgs/${subject.level}/${subject_id}/infograph/services`}>
          {correct_subject.lookup(subject_id).name}
        </a>
      ),
      plain_formatter: (subject_id) => correct_subject.lookup(subject_id).name,
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
      {is_gov ? (
        <TM
          className="medium-panel-text"
          k="orgs_reporting_services_text"
          args={{
            subject,
            number_of_depts: orgs_reporting_services_summary.length,
            number_of_applications: _.sumBy(
              orgs_reporting_services_summary,
              "total_volume"
            ),
            number_of_services,
          }}
        />
      ) : (
        <TM
          className="medium-panel-text"
          k="programs_reporting_services_text"
          args={{
            subject,
            number_of_programs: orgs_reporting_services_summary.length,
            number_of_applications: _.sumBy(
              orgs_reporting_services_summary,
              "total_volume"
            ),
            number_of_services,
          }}
        />
      )}
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
    levels: ["gov", "dept"],
    panel_config_func: (level, panel_key) => ({
      title:
        level === "gov"
          ? text_maker("orgs_reporting_services_title")
          : text_maker("programs_reporting_services_title"),
      footnotes: false,
      render({ title, calculations, sources }) {
        const { subject } = calculations;
        return (
          <InfographicPanel title={title} sources={sources}>
            <OrgsReportingServicesPanel subject={subject} />
          </InfographicPanel>
        );
      },
    }),
  });
