import _ from "lodash";
import React from "react";

import text from "src/panels/panel_declarations/services/services.yaml";
import { delivery_channels_keys } from "src/panels/panel_declarations/services/shared.js";

import {
  create_text_maker_component,
  Panel,
  DisplayTable,
} from "src/components/index.js";

import { infobase_colors } from "src/core/color_schemes.ts";
import { is_a11y_mode } from "src/core/injected_build_constants.ts";

import { WrappedNivoHBar } from "src/charts/wrapped_nivo/index.js";

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
        {is_a11y_mode ? (
          <DisplayTable
            data={_.map(filtered_keys, (key) => ({
              label: text_maker(key),
              value: _.sumBy(service.service_report, `${key}_count`),
            }))}
            column_configs={{
              label: {
                index: 0,
                is_searchable: true,
                header: text_maker("single_service_channels_title"),
              },
              value: {
                index: 1,
                header: text_maker("value"),
              },
            }}
          />
        ) : (
          <WrappedNivoHBar
            data={_.map(filtered_keys, (key) => ({
              id: key,
              label: text_maker(key),
              [text_maker(key)]: _.sumBy(
                service.service_report,
                `${key}_count`
              ),
            }))}
            indexBy="label"
            keys={_.map(delivery_channels_keys, (key) => text_maker(key))}
            is_money={false}
            colors={(d) => colors(d.id)}
            margin={{
              right: 10,
              left: 227,
              top: 0,
              bottom: 50,
            }}
            bttm_axis={{
              tickValues: 6,
            }}
          />
        )}
      </Panel>
    );
  }
}
