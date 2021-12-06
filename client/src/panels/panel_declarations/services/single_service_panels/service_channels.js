import _ from "lodash";
import React, { Fragment } from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import text from "src/panels/panel_declarations/services/services.yaml";
import { application_channels_keys } from "src/panels/panel_declarations/services/shared";

import { create_text_maker_component } from "src/components/index";

import { infobase_colors } from "src/core/color_schemes";
import { formats } from "src/core/format";

import { is_a11y_mode } from "src/core/injected_build_constants";

import { StandardLegend } from "src/charts/legends/index";
import { WrappedNivoBar } from "src/charts/wrapped_nivo/index";
import { get_source_links } from "src/metadata/data_sources";

const { text_maker, TM } = create_text_maker_component(text);

export class ServiceChannels extends React.Component {
  render() {
    const { service, title, sources } = this.props;

    const most_recent_year = service.report_years[0];
    const most_recent_report = _.find(service.service_report, {
      year: most_recent_year,
    });
    const colors = infobase_colors();
    const { max_channel_key, max_value } = _.reduce(
      application_channels_keys,
      (max_data, key) => {
        const max_value_for_key = most_recent_report[key];
        return max_value_for_key > max_data.max_value
          ? {
              max_channel_key: key,
              max_value: max_value_for_key,
            }
          : max_data;
      },
      { max_channel_key: "", max_value: 0 }
    );
    const filtered_keys = _.filter(application_channels_keys, (key) =>
      _.reduce(
        service.service_report,
        (previous_is_not_null_or_zero, report) =>
          previous_is_not_null_or_zero || report[key],
        false
      )
    );
    const data = _.map(service.service_report, (report) => ({
      id: `${report.service_id}_${report.year}`,
      label: formats.year_to_fiscal_year_raw(report.year),
      ..._.chain(filtered_keys)
        .map((key) => [text_maker(key), 0 + report[key]])
        .fromPairs()
        .value(),
    }));

    return (
      <InfographicPanel title={title} sources={sources}>
        {filtered_keys.length > 0 ? (
          <Fragment>
            <TM k="service_channels_text" className="medium-panel-text" />
            {max_channel_key && (
              <TM
                k={`most_used_${max_channel_key}`}
                className="medium-panel-text"
                args={{
                  max_value,
                  most_recent_year,
                }}
              />
            )}
            {!is_a11y_mode && (
              <StandardLegend
                legendListProps={{
                  items: _.map(filtered_keys, (key) => ({
                    id: key,
                    label: text_maker(key),
                    color: colors(text_maker(key)),
                  })),
                  checkBoxProps: { isSolidBox: true },
                }}
              />
            )}
            <WrappedNivoBar
              data={data}
              indexBy="label"
              keys={_.map(filtered_keys, (key) => text_maker(key))}
              is_money={false}
              colors={(d) => colors(d.id)}
              margin={{
                right: 10,
                left: 75,
                top: 20,
                bottom: 50,
              }}
              bttm_axis={{
                tickValues: 6,
              }}
            />
          </Fragment>
        ) : (
          <TM className="medium-panel-text" k="no_applications" />
        )}
      </InfographicPanel>
    );
  }
}

export const declare_single_service_channels_panel = () =>
  declare_panel({
    panel_key: "single_service_channels",
    subject_types: ["service"],
    panel_config_func: (subject_type, panel_key) => ({
      title: text_maker("single_service_channels_title"),
      footnotes: false,
      source: () => get_source_links(["SERVICES"]),
      render({ title, calculations, sources }) {
        const { subject } = calculations;
        return (
          <ServiceChannels service={subject} title={title} sources={sources} />
        );
      },
    }),
  });
