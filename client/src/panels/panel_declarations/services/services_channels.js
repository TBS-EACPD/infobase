import _ from "lodash";
import React, { useEffect, useState } from "react";
//import {HeightClippedGraph}
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import {
  DisplayTable,
  create_text_maker_component,
  LeafSpinner,
  Select,
} from "src/components/index";

import {
  useServiceSummaryGov,
  useServiceSummaryOrg,
  useServiceSummaryProgram,
} from "src/models/services/queries";

import { infobase_colors } from "src/core/color_schemes";
import { formats } from "src/core/format";
import { is_a11y_mode } from "src/core/injected_build_constants";

import { StandardLegend } from "src/charts/legends";

import { WrappedNivoPie, WrappedNivoBar } from "src/charts/wrapped_nivo/index";
import { textColor } from "src/style_constants/index";

import { application_channels_keys } from "./shared";

import text from "./services.yaml";

const colors = infobase_colors();
const { text_maker, TM } = create_text_maker_component(text);
const channels = _.map(application_channels_keys, text_maker);
const pct_formatter = formats.percentage1;

const application_channels_by_year_tooltip = (items, tooltip_formatter) => {
  const item = items[0];
  const item_pct =
    item.value /
    _.chain(item.data).omit("year").map().filter(_.isNumber).sum().value();

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
  const useSummaryServices = {
    gov: useServiceSummaryGov,
    dept: useServiceSummaryOrg,
    program: useServiceSummaryProgram,
  }[subject.subject_type];
  const { loading, data } = useSummaryServices({ id: subject.id });
  const [active_channels, set_active_channels] = useState(
    _.chain(channels)
      .map((channel) => [channel, true])
      .fromPairs()
      .value()
  );
  const [active_year, set_active_year] = useState("");
  useEffect(() => {
    if (data) {
      set_active_year(data.service_general_stats.report_years[0]);
    }
  }, [data]);

  if (loading) {
    return <LeafSpinner config_name="subroute" />;
  }

  const {
    service_general_stats: { number_of_services, report_years },
    service_channels_summary,
  } = data;
  const application_channels_by_year_data = _.chain(service_channels_summary)
    .map((summary) => ({
      ...summary,
      year: formats.year_to_fiscal_year_raw(summary.year),
    }))
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
    ({ year }) => year === report_years[0]
  );

  const channel_pct_data = _.chain(service_channels_summary)
    .filter(({ year }) => year === active_year)
    .map(({ channel_id, channel_value }) => ({
      id: channel_id,
      label: text_maker(channel_id),
      value: channel_value,
    }))
    .value();
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
          most_recent_year: report_years[0],
          pct_of_online_applications:
            number_of_online_applications / number_of_applications,
        }}
      />
      <div className="row">
        <div className="col-12 col-lg-4">
          {!is_a11y_mode && (
            <StandardLegend
              title={text_maker("application_channels")}
              legendListProps={{
                items: legend_items,
                onClick: (key) =>
                  set_active_channels({
                    ...active_channels,
                    [key]: !active_channels[key],
                  }),
              }}
            />
          )}
        </div>
        <div className="col-12 col-lg-8">
          <WrappedNivoBar
            data={application_channels_by_year_data}
            margin={{
              top: 50,
              right: 40,
              bottom: 50,
              left: 80,
            }}
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
          data={_.map(channel_pct_data, ({ label, value }) => ({
            label,
            value,
          }))}
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
        //<HeightClippedGraph clipHeight={300}>
          <div style={{ marginTop: "50px" }} className="col-12 col-lg-12">
            <div style={{ textAlign: "center" }}>
              <TM
                style={{ fontWeight: 700 }}
                className="medium-panel-text"
                k="application_breakdown_by_channel"
              />
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Select
                id="services_channels_select"
                title={text_maker("select_period")}
                selected={active_year}
                options={_.map(report_years, (year) => ({
                  id: year,
                  display: formats.year_to_fiscal_year_raw(year),
                }))}
                onSelect={(year) => set_active_year(year)}
              />
            </div>
            <WrappedNivoPie
              data={channel_pct_data}
              is_money={false}
              display_horizontal={true}
            />
          </div>
        //</HeightClippedGraph>
      )}
    </div>
  );
};

export const declare_services_channels_panel = () =>
  declare_panel({
    panel_key: "services_channels",
    subject_types: ["gov", "dept", "program"],
    panel_config_func: () => ({
      get_title: () => text_maker("services_channels_title"),
      get_dataset_keys: () => ["service_inventory"],
      render({ title, subject, sources, datasets }) {
        return (
          <InfographicPanel title={title} sources={sources} datasets={datasets}>
            <ServicesChannelsPanel subject={subject} />
          </InfographicPanel>
        );
      },
    }),
  });
