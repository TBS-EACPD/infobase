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

import { Dept, Program } from "src/models/subject_index";

import text from "./services.yaml";
const { text_maker, TM } = create_text_maker_component(text);

const OrgsOfferingServicesPanel = ({ subject }) => {
  const { loading, data } = useSummaryServices({
    subject,
    query_fragment: `
    service_general_stats {
      report_years
      number_of_services
    }
    subject_offering_services_summary {
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
    subject_offering_services_summary,
    service_general_stats: { report_years, number_of_services },
  } = data;
  const is_gov = subject.level === "gov";
  const correct_subject = is_gov ? Dept : Program;

  const cleaned_data = _.map(subject_offering_services_summary, (row) =>
    _.omit(row, ["__typename", "id", !is_gov && "total_volume"])
  );

  const column_configs = {
    subject_id: {
      index: 0,
      header: is_gov ? text_maker("org") : text_maker("programs"),
      is_searchable: true,
      formatter: (subject_id) => (
        <a
          href={`#orgs/${
            is_gov ? "dept" : "program"
          }/${subject_id}/infograph/services`}
        >
          {correct_subject.store.lookup(subject_id).name}
        </a>
      ),
      plain_formatter: (subject_id) =>
        correct_subject.store.lookup(subject_id).name,
    },
    number_of_services: {
      index: 1,
      header: text_maker("number_of_services"),
      formatter: "big_int",
    },
    ...(is_gov && {
      total_volume: {
        index: 2,
        header: text_maker("applications"),
        is_summable: true,
        formatter: "big_int",
      },
    }),
  };
  return (
    <HeightClippedGraph clipHeight={600}>
      <TM
        className="medium-panel-text"
        k={`${is_gov ? "orgs" : "programs"}_offering_services_text`}
        args={{
          subject,
          most_recent_year: report_years[0],
          number_of_subjects: cleaned_data.length,
          number_of_applications: _.sumBy(cleaned_data, "total_volume"),
          number_of_services,
        }}
      />
      <DisplayTable
        unsorted_initial={true}
        data={cleaned_data}
        column_configs={column_configs}
      />
    </HeightClippedGraph>
  );
};

export const declare_subject_offering_services_panel = () =>
  declare_panel({
    panel_key: "subject_offering_services",
    levels: ["gov", "dept"],
    panel_config_func: (level, panel_key) => ({
      title:
        level === "gov"
          ? text_maker("subject_offering_services_title")
          : text_maker("programs_offering_services_title"),
      footnotes: false,
      render({ title, calculations, sources }) {
        const { subject } = calculations;
        return (
          <InfographicPanel title={title} sources={sources}>
            <OrgsOfferingServicesPanel subject={subject} />
          </InfographicPanel>
        );
      },
    }),
  });
