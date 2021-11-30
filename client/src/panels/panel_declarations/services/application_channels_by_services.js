import _ from "lodash";
import React, { useState, useEffect } from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";

import {
  DisplayTable,
  create_text_maker_component,
  LeafSpinner,
  Select,
  SelectAllControl,
} from "src/components/index";

import {
  useServicesByOrg,
  useServicesByProgram,
} from "src/models/services_queries";

import { infobase_colors } from "src/core/color_schemes";
import { formats } from "src/core/format";
import { is_a11y_mode } from "src/core/injected_build_constants";

import { StandardLegend } from "src/charts/legends/index";
import { WrappedNivoBar } from "src/charts/wrapped_nivo/index";

import { application_channels_keys } from "./shared";

import text from "./services.yaml";

const { text_maker, TM } = create_text_maker_component(text);
const colors = infobase_colors();
const get_report_years = (data) =>
  _.chain(data).flatMap("report_years").uniq().sort().reverse().value();

const ServicesChannelsPanel = ({ subject }) => {
  const useServices =
    subject.subject_type === "program"
      ? useServicesByProgram
      : useServicesByOrg;
  const { loading, data } = useServices({ id: subject.id });
  const unique_services = _.uniqBy(data, "id");

  const [active_services, set_active_services] = useState({});
  const [active_year, set_active_year] = useState("");
  const report_years = get_report_years(unique_services);
  const most_recent_year = report_years[0];

  useEffect(() => {
    set_active_year(most_recent_year);
  }, [most_recent_year]);

  useEffect(() => {
    const median_3_values = _.chain(data)
      .uniqBy("id")
      .map((service) => ({
        id: service.id,
        value: _.chain(application_channels_keys)
          .flatMap((key) =>
            _.map(
              service.service_report,
              (report) => report.year === most_recent_year && report[key]
            )
          )
          .max()
          .value(),
      }))
      .filter("value")
      .sortBy("value")
      .map("id")
      .thru((processed_services) =>
        _.times(3, (i) =>
          _.nth(processed_services, _.floor(processed_services.length / 2) - i)
        )
      )
      .map((id) => [id, true])
      .fromPairs()
      .value();
    set_active_services(median_3_values);
  }, [data, most_recent_year]);

  if (loading) {
    return <LeafSpinner config_name="relative_panel" />;
  }

  const most_recent_filtered_data = _.map(unique_services, (service) => ({
    ...service,
    service_report: _.filter(
      service.service_report,
      (report) => report.year === most_recent_year
    ),
  }));
  const active_year_filtered_data = _.map(unique_services, (service) => ({
    ...service,
    service_report: _.filter(
      service.service_report,
      (report) => report.year === active_year
    ),
  }));
  const { max_vol_service_name, max_vol_service_value } = _.chain(
    most_recent_filtered_data
  )
    .map(({ name, service_report }) => ({
      max_vol_service_name: name,
      max_vol_service_value: _.chain(application_channels_keys)
        .map((key) => _.sumBy(service_report, key))
        .sum()
        .value(),
    }))
    .maxBy("max_vol_service_value")
    .value();
  const { max_vol_channel_name, max_vol_channel_value } = _.chain(
    application_channels_keys
  )
    .map((key) => ({
      max_vol_channel_name: text_maker(key),
      max_vol_channel_value: _.chain(most_recent_filtered_data)
        .map(({ service_report }) => _.sumBy(service_report, key))
        .sum()
        .value(),
    }))
    .maxBy("max_vol_channel_value")
    .value();

  const services_channel_nivo_data = _.map(
    application_channels_keys,
    (key) => ({
      id: text_maker(key),
      ..._.chain(active_year_filtered_data)
        .filter(({ id }) => active_services[id])
        .map((service) => [
          service.name,
          _.sumBy(service.service_report, key) || 0,
        ])
        .fromPairs()
        .value(),
    })
  );
  const services_channels_column_configs = {
    name: {
      index: 0,
      is_searchable: true,
      header: text_maker("service_name"),
    },
    ..._.chain(application_channels_keys)
      .map((key, idx) => [key, { index: idx + 1, header: text_maker(key) }])
      .fromPairs()
      .value(),
  };

  return (
    <div>
      <TM
        className="medium-panel-text"
        k={
          subject.subject_type === "program"
            ? "application_channels_by_services_program_text"
            : "application_channels_by_services_text"
        }
        args={{
          subject,
          most_recent_year,
          max_vol_service_name,
          max_vol_service_value,
          max_vol_channel_name,
          max_vol_channel_value,
        }}
      />
      {is_a11y_mode ? (
        <DisplayTable
          data={_.map(unique_services, ({ name, service_report }) => ({
            name: name,
            ..._.chain(application_channels_keys)
              .map((key) => [key, _.sumBy(service_report, key)])
              .fromPairs()
              .value(),
          }))}
          column_configs={services_channels_column_configs}
        />
      ) : (
        <div className="row">
          <div
            className="col-12 col-lg-12"
            style={{
              textAlign: "center",
              fontWeight: 700,
              marginTop: "50px",
            }}
          >
            <TM className="medium-panel-text" k="customizable_service_graph" />
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Select
                id="services_channels_select"
                selected={active_year}
                options={_.map(report_years, (year) => ({
                  id: year,
                  display: formats.year_to_fiscal_year_raw(year),
                }))}
                onSelect={(year) => set_active_year(year)}
              />
            </div>
          </div>
          <div className="col-12 col-lg-4">
            <StandardLegend
              legendListProps={{
                items: _.chain(active_year_filtered_data)
                  .map(({ id, name }) => ({
                    id,
                    label: name,
                    color: colors(name),
                    active: _.isUndefined(active_services[id])
                      ? false
                      : active_services[id],
                  }))
                  .sortBy("label")
                  .value(),
                onClick: (id) =>
                  set_active_services({
                    ...active_services,
                    [id]: !active_services[id],
                  }),
              }}
              Controls={
                <SelectAllControl
                  SelectAllOnClick={() =>
                    set_active_services(
                      _.chain(active_year_filtered_data)
                        .map(({ id }) => [id, true])
                        .fromPairs()
                        .value()
                    )
                  }
                  SelectNoneOnClick={() => set_active_services({})}
                />
              }
            />
          </div>
          <div className="col-12 col-lg-8">
            <WrappedNivoBar
              data={services_channel_nivo_data}
              custom_table={
                <DisplayTable
                  data={_.chain(active_year_filtered_data)
                    .filter(({ id }) => active_services[id])
                    .map(({ name, service_report }) => ({
                      name: name,
                      ..._.chain(application_channels_keys)
                        .map((key) => [key, _.sumBy(service_report, key)])
                        .fromPairs()
                        .value(),
                    }))
                    .value()}
                  column_configs={services_channels_column_configs}
                />
              }
              is_money={false}
              keys={_.map(active_year_filtered_data, "name")}
              indexBy={"id"}
              colors={(d) => colors(d.id)}
              bttm_axis={{
                tickRotation: 35,
              }}
              margin={{
                top: 15,
                right: 60,
                bottom: 120,
                left: 60,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export const declare_application_channels_by_services_panel = () =>
  declare_panel({
    panel_key: "application_channels_by_services",
    subject_types: ["dept", "program"],
    panel_config_func: (subject_type, panel_key) => ({
      title: text_maker("customizable_service_graph"),
      footnotes: false,
      render({ title, calculations, sources }) {
        const { subject } = calculations;
        return (
          <InfographicPanel title={title} sources={sources}>
            <ServicesChannelsPanel subject={subject} />
          </InfographicPanel>
        );
      },
    }),
  });
