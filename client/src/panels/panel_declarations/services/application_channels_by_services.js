import _ from "lodash";
import React, { useState, useEffect } from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";

import {
  DisplayTable,
  create_text_maker_component,
  LeafSpinner,
} from "src/components/index";

import { useServices } from "src/models/populate_services";

import { infobase_colors } from "src/core/color_schemes";
import { is_a11y_mode } from "src/core/injected_build_constants";

import { StandardLegend, SelectAllControl } from "src/charts/legends/index";
import { WrappedNivoBar } from "src/charts/wrapped_nivo/index";

import {
  application_channels_keys,
  application_channels_query_fragment,
} from "./shared";

import text from "./services.yaml";

const { text_maker, TM } = create_text_maker_component(text);
const colors = infobase_colors();

const ServicesChannelsPanel = ({ subject }) => {
  const { loading, data } = useServices({
    subject,
    query_fragments: `
    id
    name
    ${application_channels_query_fragment}
    `,
  });

  const [active_services, set_active_services] = useState({});
  useEffect(() => {
    const median_3_values = _.chain(data)
      .map((service) => ({
        id: service.id,
        value: _.chain(application_channels_keys)
          .flatMap((key) =>
            _.map(service.service_report, (report) => report[key])
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
  }, [data]);

  if (loading) {
    return <LeafSpinner config_name="inline_panel" />;
  }
  const { max_vol_service_name, max_vol_service_value } = _.chain(data)
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
      max_vol_channel_value: _.chain(data)
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
      ..._.chain(data)
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
          subject.level === "program"
            ? "application_channels_by_services_program_text"
            : "application_channels_by_services_text"
        }
        args={{
          subject,
          max_vol_service_name,
          max_vol_service_value,
          max_vol_channel_name,
          max_vol_channel_value,
        }}
      />
      {is_a11y_mode ? (
        <DisplayTable
          data={_.map(data, ({ name, service_report }) => ({
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
            <TM className="medium-panel-text" k="services_channels_title" />
          </div>
          <div className="col-12 col-lg-4">
            <StandardLegend
              legendListProps={{
                items: _.chain(data)
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
                      _.chain(data)
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
                  data={_.chain(data)
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
              keys={_.map(data, "name")}
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
    levels: ["dept", "program"],
    panel_config_func: (level, panel_key) => ({
      title: text_maker("services_channels_title"),
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