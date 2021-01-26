import _ from "lodash";
import React, { Fragment } from "react";
import MediaQuery from "react-responsive";

import d3 from "src/core/d3-bundle.js";
import { is_a11y_mode } from "src/core/injected_build_constants.js";

import { DisplayTable } from "../../../components";
import { Service } from "../../../models/services.js";

import {
  create_text_maker_component,
  InfographicPanel,
  declare_panel,
  WrappedNivoHBar,
  TspanLineWrapper,
  formatter,
  newIBLightCategoryColors,
} from "../shared.js";

import { delivery_channels_keys } from "./shared.js";

import text from "./services.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const colors = d3.scaleOrdinal().range(_.at(newIBLightCategoryColors, [0]));
const total_volume = text_maker("applications_and_calls");
const volume_formatter = (val) =>
  formatter("compact", val, { raw: true, noMoney: true });

const Top10ServicesApplicationVolumePanel = ({ panel_args }) => {
  const { data, subject } = panel_args;
  const column_configs = {
    id: {
      index: 0,
      header: text_maker("service_name"),
      is_searchable: true,
      formatter: (id) => (
        <a href={`#dept/${subject.id}/service-panels/${id}`}>
          {Service.lookup(id).name}
        </a>
      ),
      raw_formatter: (id) => Service.lookup(id).name,
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
      data={[...data].reverse()}
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
          highest_service_name: Service.lookup(_.last(data).id).name,
          highest_service_value: _.last(data)[total_volume],
          num_of_services: data.length,
        }}
      />
      {is_a11y_mode ? (
        table_content
      ) : (
        <Fragment>
          <MediaQuery minWidth={992}>
            <WrappedNivoHBar
              indexBy={"id"}
              custom_table={table_content}
              keys={[total_volume]}
              isInteractive={true}
              enableLabel={true}
              labelSkipWidth={30}
              label={(d) => volume_formatter(d.value)}
              data={data}
              is_money={false}
              colorBy={(d) => colors(d.id)}
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
                    key={tick.key}
                    transform={`translate(${tick.x - 10},${tick.y})`}
                  >
                    <a href={`#dept/${subject.id}/service-panels/${tick.key}`}>
                      <text
                        textAnchor="end"
                        dominantBaseline="end"
                        style={{
                          ...tick.theme.axis.ticks.text,
                        }}
                      >
                        <TspanLineWrapper
                          text={Service.lookup(tick.key).name}
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
        const data = _.chain(panel_args.services)
          .map(({ id, service_report }) => ({
            id,
            [total_volume]: _.reduce(
              delivery_channels_keys,
              (sum, key) => sum + _.sumBy(service_report, `${key}_count`) || 0,
              0
            ),
          }))
          .filter(total_volume)
          .sortBy(total_volume)
          .takeRight(10)
          .value();

        return (
          <InfographicPanel
            title={text_maker("top10_services_volume_title", {
              num_of_services: data.length,
            })}
            sources={sources}
          >
            <Top10ServicesApplicationVolumePanel
              panel_args={{ ...panel_args, data }}
            />
          </InfographicPanel>
        );
      },
    }),
  });
