import { scaleOrdinal } from "d3-scale";
import _ from "lodash";
import React, { Fragment } from "react";
import MediaQuery from "react-responsive";

import { TspanLineWrapper } from "src/panels/panel_declarations/common_panel_components.js";
import { declare_panel } from "src/panels/panel_declarations/common_panel_utils.js";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel.js";

import {
  DisplayTable,
  create_text_maker_component,
} from "src/components/index.js";

import { useServices } from "src/models/populate_services.js";
import { Subject } from "src/models/subject.js";

import { newIBLightCategoryColors } from "src/core/color_schemes.ts";
import { formatter } from "src/core/format.ts";
import { is_a11y_mode } from "src/core/injected_build_constants.ts";

import { WrappedNivoHBar } from "src/charts/wrapped_nivo/index.js";

import { infograph_href_template } from "src/link_utils.js";

import text from "./services.yaml";

const { text_maker, TM } = create_text_maker_component(text);
const Dept = Subject.Dept;

const colors = scaleOrdinal().range(_.at(newIBLightCategoryColors, [0]));

const website_visits_key = "online_inquiry";
const total_volume = text_maker(website_visits_key);
const volume_formatter = (val) =>
  formatter("compact", val, { raw: true, noMoney: true });

const Top10WebsiteVisitsPanel = ({ panel_args }) => {
  const { subject } = panel_args;
  const is_gov = subject.level === "gov";
  const { loading, data } = useServices({
    id: subject.id,
    service_fragments: `service_report{
      ${website_visits_key}_count
    }`,
  });
  if (loading) {
    return <span>loading</span>;
  }
  const preprocessed_data = is_gov
    ? _.chain(data)
        .groupBy("org_id")
        .map((org_services, org_id) => {
          const dept = Dept.lookup(org_id);
          return {
            id: org_id,
            name: dept ? dept.name : "",
            [total_volume]: _.sumBy(
              org_services,
              ({ service_report }) =>
                _.sumBy(service_report, `${website_visits_key}_count`) || 0
            ),
          };
        })
        .value()
    : _.map(data, ({ id, name, service_report }) => ({
        id,
        name,
        [total_volume]:
          _.sumBy(service_report, `${website_visits_key}_count`) || 0,
      }));

  const processed_data = _.chain(preprocessed_data)
    .filter(total_volume)
    .sortBy(total_volume)
    .takeRight(10)
    .value();

  const data_name_lookup = _.chain(processed_data)
    .map(({ id, name }) => [id, name])
    .fromPairs()
    .value();

  const column_configs = {
    id: {
      index: 0,
      header: is_gov ? text_maker("org") : text_maker("service_name"),
      is_searchable: true,
      formatter: (id) => (
        <a
          href={
            is_gov
              ? infograph_href_template(Dept.lookup(id), "services")
              : `#dept/${subject.id}/service-panels/${id}`
          }
        >
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

  return _.isEmpty(processed_data) ? (
    <TM k="no_data" el="h2" />
  ) : (
    <div>
      <TM
        className="medium-panel-text"
        k={
          is_gov
            ? "top10_gov_website_visits_text"
            : "top10_services_website_visits_text"
        }
        args={{
          highest_volume_name: data_name_lookup[_.last(processed_data).id],
          highest_volume_value: _.last(processed_data)[total_volume],
          num_of_services: processed_data.length,
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
              data={processed_data}
              is_money={false}
              colors={(d) => colors(d.id)}
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
                      href={
                        is_gov
                          ? infograph_href_template(
                              Dept.lookup(tick.value),
                              "services"
                            )
                          : `#dept/${subject.id}/service-panels/${tick.value}`
                      }
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

export const declare_top10_website_visits_panel = () =>
  declare_panel({
    panel_key: "top10_website_visits",
    levels: ["gov", "dept", "program"],
    panel_config_func: (level, panel_key) => ({
      requires_services: true,
      title: (subject) =>
        text_maker(
          subject.level === "gov"
            ? "top10_gov_website_visits"
            : "top10_services_website_visits"
        ),
      calculate: (subject) => {
        return {
          subject,
        };
      },
      footnotes: false,
      render({ title, calculations, sources }) {
        const { panel_args } = calculations;

        return (
          <InfographicPanel title={title} sources={sources}>
            <Top10WebsiteVisitsPanel panel_args={{ ...panel_args }} />
          </InfographicPanel>
        );
      },
    }),
  });
