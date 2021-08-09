import _ from "lodash";
import React, { useState } from "react";

import { HeightClippedGraph } from "src/panels/panel_declarations/common_panel_components";
import { declare_panel } from "src/panels/panel_declarations/common_panel_utils";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";

import {
  DisplayTable,
  create_text_maker_component,
  LeafSpinner,
} from "src/components/index";

import { useSummaryServices } from "src/models/populate_services";

import { run_template } from "src/models/text";
import { year_templates } from "src/models/years";

import { textColor } from "src/core/color_defs";
import { infobase_colors } from "src/core/color_schemes";
import { formats } from "src/core/format";
import { is_a11y_mode } from "src/core/injected_build_constants";

import { StandardLegend } from "src/charts/legends";

import { WrappedNivoPie, WrappedNivoBar } from "src/charts/wrapped_nivo/index";

import { application_channels_keys } from "./shared";

import text from "./services.yaml";

const colors = infobase_colors();
const { text_maker, TM } = create_text_maker_component(text);
const channels = _.map(application_channels_keys, text_maker);
const { services_years } = year_templates;
const most_recent_year = _.chain(services_years) //SI TODO how to get most recent year better?
  .map(run_template)
  .takeRight()
  .split("-")
  .value()[0];
const application_channels_by_year_tooltip = (items, tooltip_formatter) => {
  const item = items[0];
  const item_pct =
    item.value / _.chain(item.data).map(_.toNumber).sum().value();
  const pct_formatter = formats.percentage1;

  return (
    <div
      className="auth-exp-planned-spend-tooltip"
      style={{ color: textColor }}
    >
      <table className="auth-exp-planned-spend-tooltip__table">
        <tbody>
          <tr>
            <td>
              <div
                style={{
                  backgroundColor: item.color,
                  height: "12px",
                  width: "12px",
                }}
              />
            </td>
            <td>{item.id}</td>
            <td
              dangerouslySetInnerHTML={{
                __html: `${tooltip_formatter(item.value)} (${pct_formatter(
                  item_pct
                )})`,
              }}
            />
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const ServicesChannelsPanel = ({ subject }) => {
  const { loading, data } = useSummaryServices({
    subject,
    query_fragment: `
    service_general_stats {
      number_of_services
    }
    service_channels_summary {
      subject_id
      year
      channel_id
      channel_value
    }`,
  });
  const [active_channels, set_active_channels] = useState(
    _.chain(channels)
      .map((channel) => [channel, true])
      .fromPairs()
      .value()
  );

  if (loading) {
    return <LeafSpinner config_name="inline_panel" />;
  }
  const {
    service_general_stats: { number_of_services },
    service_channels_summary,
  } = data;
  const application_channels_by_year_data = _.chain(service_channels_summary)
    .groupBy("year")
    .map((summary, year) => ({
      year,
      ..._.chain(active_channels)
        .map(
          (_active, channel) =>
            _active && [
              channel,
              _.find(summary, (row) => text_maker(row.channel_id) === channel)
                .channel_value,
            ]
        )
        .fromPairs()
        .value(),
    }))
    .value();
  const legend_items = _.map(channels, (key) => ({
    id: key,
    label: key,
    active: active_channels[key],
    color: colors(key),
  }));
  const most_recent_report_summary = _.filter(
    service_channels_summary,
    ({ year }) => year === most_recent_year
  );

  const channel_pct_data = _.map(
    most_recent_report_summary,
    ({ channel_id, channel_value }) => ({
      id: channel_id,
      label: text_maker(channel_id),
      value: channel_value,
    })
  );
  const number_of_applications = _.sumBy(
    most_recent_report_summary,
    "channel_value"
  );
  const number_of_online_applications = _.find(most_recent_report_summary, {
    channel_id: "online_application_count",
  }).channel_value;

  return (
    <div>
      <TM
        className="medium-panel-text"
        k="services_channels_text"
        args={{
          number_of_applications,
          number_of_services,
          subject,
          number_of_online_applications,
          pct_of_online_applications:
            number_of_online_applications / number_of_applications,
        }}
      />
      <div className="row">
        <div className="col-12 col-lg-4">
          <StandardLegend
            title="Application channels" //SI_TODO
            legendListProps={{
              items: legend_items,
              onClick: (key) =>
                set_active_channels({
                  ...active_channels,
                  [key]: !active_channels[key],
                }),
            }}
          />
        </div>
        <div className="col-12 col-lg-8">
          <WrappedNivoBar
            data={application_channels_by_year_data}
            keys={channels}
            tooltip={application_channels_by_year_tooltip}
            colors={(d) => colors(d.id)}
            is_money={false}
            indexBy="year"
          />
        </div>
      </div>
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
          <div style={{ marginTop: "50px" }} className="col-12 col-lg-12">
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
};

export const declare_services_channels_panel = () =>
  declare_panel({
    panel_key: "services_channels",
    levels: ["gov", "dept", "program"],
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
