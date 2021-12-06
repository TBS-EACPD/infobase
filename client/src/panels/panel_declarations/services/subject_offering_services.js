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

import {
  useServiceSummaryGov,
  useServiceSummaryOrg,
} from "src/models/services/services_queries";

import { Dept, Program } from "src/models/subjects";

import { get_source_links } from "src/metadata/data_sources";

import text from "./services.yaml";
const { text_maker, TM } = create_text_maker_component(text);

const OrgsOfferingServicesPanel = ({ subject }) => {
  const useSummaryServices = {
    gov: useServiceSummaryGov,
    dept: useServiceSummaryOrg,
  }[subject.subject_type];
  const { loading, data } = useSummaryServices({ id: subject.id });

  if (loading) {
    return <LeafSpinner config_name="subroute" />;
  }

  const {
    subject_offering_services_summary,
    service_general_stats: { report_years, number_of_services },
  } = data;

  const is_gov = subject.subject_type === "gov";
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
          href={`#infographic/${
            is_gov ? "dept" : "program"
          }/${subject_id}/services`}
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
      {!is_gov && (
        <TM
          className="medium-panel-text"
          k="list_of_provided_services_program_caveat"
        />
      )}
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
    subject_types: ["gov", "dept"],
    panel_config_func: (subject_type, panel_key) => ({
      title:
        subject_type === "gov"
          ? text_maker("subject_offering_services_title")
          : text_maker("programs_offering_services_title"),
      footnotes: false,
      source: () => get_source_links(["SERVICES"]),
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
