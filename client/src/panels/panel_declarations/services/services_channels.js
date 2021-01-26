import _ from "lodash";
import React from "react";

import { infobase_colors } from "src/core/color_schemes.js";
import { is_a11y_mode } from "src/core/injected_build_constants.js";

import { StandardLegend, SelectAllControl } from "../../../charts/legends";
import { Service } from "../../../models/services.js";

import {
  create_text_maker_component,
  InfographicPanel,
  declare_panel,
  WrappedNivoBar,
  WrappedNivoPie,
  HeightClippedGraph,
  util_components,
} from "../shared.js";

import { delivery_channels_keys } from "./shared.js";

import text from "./services.yaml";

const { DisplayTable } = util_components;
const { text_maker, TM } = create_text_maker_component(text);
const colors = infobase_colors();

class ServicesChannelsPanel extends React.Component {
  constructor(props) {
    super(props);

    const services = props.panel_args.services;
    // Get 3 median of each report's maximum channel volume
    const median_3_values = _.chain(services)
      .map((service) => ({
        id: service.id,
        value: _.chain(delivery_channels_keys)
          .map((key) =>
            _.map(service.service_report, (report) => report[`${key}_count`])
          )
          .flatten()
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

    this.state = {
      active_services: median_3_values,
    };
  }
  render() {
    const { panel_args } = this.props;
    const { active_services } = this.state;
    const { services, subject } = panel_args;

    const { max_vol_service_name, max_vol_service_value } = _.chain(services)
      .map(({ name, service_report }) => ({
        max_vol_service_name: name,
        max_vol_service_value: _.chain(delivery_channels_keys)
          .map((key) => _.sumBy(service_report, `${key}_count`))
          .sum()
          .value(),
      }))
      .maxBy("max_vol_service_value")
      .value();
    const {
      max_vol_channel_key,
      max_vol_channel_name,
      max_vol_channel_value,
    } = _.chain(delivery_channels_keys)
      .map((key) => ({
        max_vol_channel_key: key,
        max_vol_channel_name: text_maker(key),
        max_vol_channel_value: _.chain(services)
          .map(({ service_report }) => _.sumBy(service_report, `${key}_count`))
          .sum()
          .value(),
      }))
      .maxBy("max_vol_channel_value")
      .value();

    const services_channel_nivo_data = _.map(delivery_channels_keys, (key) => ({
      id: text_maker(key),
      ..._.chain(services)
        .filter(({ id }) => active_services[id])
        .map((service) => [
          service.name,
          _.sumBy(service.service_report, `${key}_count`) || 0,
        ])
        .fromPairs()
        .value(),
    }));
    const services_channels_column_configs = {
      name: {
        index: 0,
        is_searchable: true,
        header: text_maker("service_name"),
      },
      ..._.chain(delivery_channels_keys)
        .map((key, idx) => [key, { index: idx + 1, header: text_maker(key) }])
        .fromPairs()
        .value(),
    };
    const channel_pct_data = _.chain(delivery_channels_keys)
      .map((key) => ({
        id: key,
        label: text_maker(key),
        value: _.reduce(
          services,
          (sum, service) =>
            sum + (_.sumBy(service.service_report, `${key}_count`) || 0),
          0
        ),
      }))
      .filter("value")
      .value();

    return (
      <div>
        <TM
          className="medium-panel-text"
          k={
            subject.level === "program"
              ? "services_channels_program_text"
              : "services_channels_text"
          }
          args={{
            subject,
            max_vol_service_name,
            max_vol_service_value,
            max_vol_channel_name,
            max_vol_channel_value,
            channel_type:
              max_vol_channel_key === "phone_inquiry"
                ? text_maker("enquiries")
                : text_maker("applications"),
          }}
        />
        {is_a11y_mode ? (
          <DisplayTable
            data={_.map(services, ({ name, service_report }) => ({
              name: name,
              ..._.chain(delivery_channels_keys)
                .map((key) => [key, _.sumBy(service_report, `${key}_count`)])
                .fromPairs()
                .value(),
            }))}
            column_configs={services_channels_column_configs}
          />
        ) : (
          <div className="frow">
            <div
              className="fcol-md-12"
              style={{
                textAlign: "center",
                fontWeight: 700,
                marginTop: "50px",
              }}
            >
              <TM className="medium-panel-text" k="services_channels_title" />
            </div>
            <div className="fcol-md-4">
              <StandardLegend
                items={_.chain(services)
                  .map(({ service_id, name }) => ({
                    id: service_id,
                    label: name,
                    color: colors(name),
                    active: active_services[service_id],
                  }))
                  .sortBy("label")
                  .value()}
                onClick={(id) =>
                  this.setState({
                    active_services: {
                      ...active_services,
                      [id]: !active_services[id],
                    },
                  })
                }
                Controls={
                  <SelectAllControl
                    SelectAllOnClick={() =>
                      this.setState({
                        active_services: _.chain(services)
                          .map(({ service_id }) => [service_id, true])
                          .fromPairs()
                          .value(),
                      })
                    }
                    SelectNoneOnClick={() =>
                      this.setState({ active_services: {} })
                    }
                  />
                }
              />
            </div>
            <div className="fcol-md-8">
              <WrappedNivoBar
                data={services_channel_nivo_data}
                custom_table={
                  <DisplayTable
                    data={_.chain(services)
                      .filter(({ id }) => active_services[id])
                      .map(({ name, service_report }) => ({
                        name: name,
                        ..._.chain(delivery_channels_keys)
                          .map((key) => [
                            key,
                            _.sumBy(service_report, `${key}_count`),
                          ])
                          .fromPairs()
                          .value(),
                      }))
                      .value()}
                    column_configs={services_channels_column_configs}
                  />
                }
                is_money={false}
                keys={_.map(services, "name")}
                indexBy={"id"}
                colorBy={(d) => colors(d.id)}
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
        {is_a11y_mode ? (
          <DisplayTable
            data={channel_pct_data}
            column_configs={{
              label: {
                index: 0,
                is_searchable: true,
                header: text_maker("services_channels_title"),
              },
              value: {
                index: 1,
                header: text_maker("value"),
              },
            }}
          />
        ) : (
          <HeightClippedGraph clipHeight={300}>
            <div style={{ marginTop: "50px" }} className="fcol-md-12">
              <div style={{ textAlign: "center" }}>
                <TM
                  style={{ fontWeight: 700 }}
                  className="medium-panel-text"
                  k="services_channels_title"
                />
              </div>
              <WrappedNivoPie
                data={channel_pct_data}
                is_money={false}
                display_horizontal={true}
              />
            </div>
          </HeightClippedGraph>
        )}
      </div>
    );
  }
}

export const declare_services_channels_panel = () =>
  declare_panel({
    panel_key: "services_channels",
    levels: ["dept", "program"],
    panel_config_func: (level, panel_key) => ({
      requires_services: true,
      calculate: (subject) => ({
        subject,
        services:
          level === "dept"
            ? Service.get_by_dept(subject.id)
            : Service.get_by_prog(subject.id),
      }),
      footnotes: false,
      render({ calculations, sources }) {
        const { panel_args } = calculations;
        return (
          <InfographicPanel
            title={text_maker("services_channels_title")}
            sources={sources}
          >
            <ServicesChannelsPanel panel_args={panel_args} />
          </InfographicPanel>
        );
      },
    }),
  });
