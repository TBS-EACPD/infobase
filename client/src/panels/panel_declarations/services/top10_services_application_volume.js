import { scaleOrdinal } from "d3-scale";
import _ from "lodash";
import React, { Fragment } from "react";
import MediaQuery from "react-responsive";

import { TspanLineWrapper } from "src/panels/panel_declarations/common_panel_components";
import { declare_panel } from "src/panels/panel_declarations/common_panel_utils";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";

import {
  DisplayTable,
  create_text_maker_component,
  SpinnerWrapper,
} from "src/components/index";

import { useSummaryServices } from "src/models/populate_services";

import { newIBLightCategoryColors } from "src/core/color_schemes";
import { formatter } from "src/core/format";
import { is_a11y_mode } from "src/core/injected_build_constants";

import { WrappedNivoHBar } from "src/charts/wrapped_nivo/index";

import text from "./services.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const colors = scaleOrdinal().range(_.at(newIBLightCategoryColors, [0]));
const total_volume = text_maker("applications_and_calls");
const volume_formatter = (val) =>
  formatter("compact", val, { raw: true, noMoney: true });

const Top10ServicesApplicationVolumePanel = ({ subject }) => {
  const { loading, data } = useSummaryServices({
    subject,
    query_fragment: `
    top_services_application_vol_summary {
      id
      service_id
      name
      value
    }`,
  });
  if (loading) {
    return <SpinnerWrapper config_name="inline_panel" />;
  }
  const {
    service_general_stats: { number_of_services },
    top_services_application_vol_summary,
  } = data;
  const processed_data = _.map(top_services_application_vol_summary, (row) => ({
    ...row,
    [total_volume]: row.value,
  }));

  const data_name_lookup = _.chain(processed_data)
    .map(({ service_id, name }) => [service_id, name])
    .fromPairs()
    .value();

  const column_configs = {
    id: {
      index: 0,
      header: text_maker("service_name"),
      is_searchable: true,
      formatter: (id) => (
        <a href={`#dept/${subject.id}/service-panels/${id}`}>
          {data_name_lookup[id]}
        </a>
      ),
      raw_formatter: (id) => data_name_lookup[id],
    },
    [total_volume]: {
      index: 1,
      header: total_volume,
      is_summable: true,
      formatter: "big_int",
    },
  };
  const table_content = (
    <DisplayTable
      data={[...processed_data].reverse()}
      column_configs={column_configs}
      unsorted_initial={true}
    />
  );

  return (
    <div>
      <TM
        className="medium-panel-text"
        k="top10_services_volume_text"
        args={{
          highest_service_name:
            data_name_lookup[_.last(processed_data).service_id],
          highest_service_value: _.last(processed_data)[total_volume],
          num_of_services: number_of_services,
        }}
      />
      {is_a11y_mode ? (
        table_content
      ) : (
        <Fragment>
          <MediaQuery minWidth={992}>
            <WrappedNivoHBar
              indexBy={"service_id"}
              custom_table={table_content}
              keys={[total_volume]}
              isInteractive={true}
              enableLabel={true}
              labelSkipWidth={30}
              label={(d) => volume_formatter(d.value)}
              data={processed_data}
              is_money={false}
              colors={(d) => colors(d.service_id)}
              padding={0.1}
              enableGridY={false}
              enableGridX={false}
              margin={{
                top: 20,
                right: 20,
                bottom: 50,
                left: 370,
              }}
              bttm_axis={{
                tickSize: 5,
                tickValues: 4,
                format: (d) => volume_formatter(d),
              }}
              left_axis={{
                tickSize: 5,
                tickValues: 6,
                renderTick: (tick) => (
                  <g
                    key={tick.tickIndex}
                    transform={`translate(${tick.x - 10},${tick.y})`}
                  >
                    <a
                      href={`#dept/${subject.id}/service-panels/${tick.value}`}
                    >
                      <text
                        style={{ fontSize: "11px" }}
                        textAnchor="end"
                        dominantBaseline="end"
                      >
                        <TspanLineWrapper
                          text={data_name_lookup[tick.value]}
                          width={70}
                        />
                      </text>
                    </a>
                  </g>
                ),
              }}
            />
          </MediaQuery>
          <MediaQuery maxWidth={991}>{table_content}</MediaQuery>
        </Fragment>
      )}
    </div>
  );
};

export const declare_top10_services_application_volume_panel = () =>
  declare_panel({
    panel_key: "top10_services_application_volume",
    levels: ["dept", "program"],
    panel_config_func: (level, panel_key) => ({
      title: text_maker("top10_services_volume_title"),
      footnotes: false,
      render({ title, calculations, sources }) {
        const { subject } = calculations;

        return (
          <InfographicPanel title={title} sources={sources}>
            <Top10ServicesApplicationVolumePanel subject={subject} />
          </InfographicPanel>
        );
      },
    }),
  });
