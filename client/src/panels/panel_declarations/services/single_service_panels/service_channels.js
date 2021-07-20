import _ from "lodash";
import React from "react";

import text from "src/panels/panel_declarations/services/services.yaml";
import { delivery_channels_keys } from "src/panels/panel_declarations/services/shared";

import { create_text_maker_component, Panel } from "src/components/index";

import { infobase_colors } from "src/core/color_schemes";

import { WrappedNivoBar } from "src/charts/wrapped_nivo/index";

const { text_maker, TM } = create_text_maker_component(text);

export class ServiceChannels extends React.Component {
  render() {
    const { service } = this.props;
    const colors = infobase_colors();
    const { max_channel_key, max_value } = _.reduce(
      delivery_channels_keys,
      (max_data, key) => {
        const key_count = `${key}_count`;
        const max_object_for_key = _.maxBy(service.service_report, key_count);
        const max_value_for_key = max_object_for_key
          ? max_object_for_key[key_count]
          : 0;
        return max_value_for_key > max_data.max_value
          ? {
              max_channel_key: key,
              max_value: max_value_for_key,
            }
          : max_data;
      },
      { max_channel_key: "", max_value: 0 }
    );
    const filtered_keys = _.filter(delivery_channels_keys, (key) =>
      _.reduce(
        service.service_report,
        (previous_is_not_null, report) =>
          previous_is_not_null || !_.isNull(report[`${key}_count`]),
        false
      )
    );
    const data = _.map(service.service_report, (report) => ({
      id: `${report.service_id}_${report.year}`,
      label: report.year,
      ..._.chain(filtered_keys)
        .map((key) => [text_maker(key), report[`${key}_count`]])
        .fromPairs()
        .value(),
    }));

    return (
      <Panel title={text_maker("single_service_channels_title")}>
        <TM
          k="service_channels_text"
          className="medium-panel-text"
          args={{
            max_channel_key: max_channel_key ? text_maker(max_channel_key) : "",
            max_value: max_value,
          }}
        />
        <WrappedNivoBar
          data={data}
          indexBy="label"
          keys={_.map(delivery_channels_keys, (key) => text_maker(key))}
          is_money={false}
          colors={(d) => colors(d.id)}
          margin={{
            right: 10,
            left: 50,
            top: 0,
            bottom: 50,
          }}
          bttm_axis={{
            tickValues: 6,
          }}
        />
      </Panel>
    );
  }
}
