import { scaleOrdinal } from "d3-scale";
import _ from "lodash";
import React, { Fragment } from "react";

import { TspanLineWrapper } from "src/panels/panel_declarations/common_panel_components";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import {
  DisplayTable,
  create_text_maker_component,
  LeafSpinner,
} from "src/components/index";

import {
  useServiceSummaryGov,
  useServiceSummaryOrg,
  useServiceSummaryProgram,
} from "src/models/services/services_queries";

import { is_a11y_mode } from "src/core/injected_build_constants";

import { StandardLegend } from "src/charts/legends/index";
import { WrappedNivoHBar } from "src/charts/wrapped_nivo/index";
import {
  secondaryColor,
  highlightOrangeColor,
  separatorColor,
} from "src/style_constants/index";

import text from "./services.yaml";

const { text_maker, TM } = create_text_maker_component(text);
const can_online = text_maker("can_online");
const cannot_online = text_maker("cannot_online");
const not_applicable = text_maker("not_applicable");

const colors = scaleOrdinal().range([
  secondaryColor,
  highlightOrangeColor,
  separatorColor,
]);

const ServicesDigitalStatusPanel = ({ subject }) => {
  const useSummaryServices = {
    gov: useServiceSummaryGov,
    dept: useServiceSummaryOrg,
    program: useServiceSummaryProgram,
  }[subject.subject_type];
  const { loading, data } = useSummaryServices({ id: subject.id });

  if (loading) {
    return <LeafSpinner config_name="subroute" />;
  }

  const {
    service_general_stats: {
      number_of_services,
      number_of_online_enabled_services,
      report_years,
    },
    service_digital_status_summary,
  } = data;
  const processed_data = _.map(service_digital_status_summary, (row) => ({
    key_desc: text_maker(row.key_desc),
    [can_online]: row.can_online,
    [cannot_online]: row.cannot_online,
    [not_applicable]: row.not_applicable,
  }));

  return (
    <div>
      <TM
        className="medium-panel-text"
        k={
          subject.subject_type === "program"
            ? "services_digital_status_prog_text"
            : "services_digital_status_text"
        }
        args={{
          number_of_services,
          most_recent_year: report_years[0],
          subject_name: subject.name,
          number_of_online_enabled_services,
          pct_of_online_services:
            number_of_online_enabled_services / number_of_services,
        }}
      />
      {is_a11y_mode ? (
        <DisplayTable
          data={processed_data}
          column_configs={{
            key_desc: {
              index: 0,
              is_searchable: true,
              header: text_maker("client_interaction_point"),
            },
            [can_online]: {
              index: 1,
              header: can_online,
            },
            [cannot_online]: {
              index: 2,
              header: cannot_online,
            },
            [not_applicable]: {
              index: 3,
              header: not_applicable,
            },
          }}
        />
      ) : (
        <Fragment>
          <StandardLegend
            legendListProps={{
              items: _.map(
                [can_online, cannot_online, not_applicable],
                (key) => ({
                  id: key,
                  label: key,
                  color: colors(key),
                })
              ),
              checkBoxProps: { isSolidBox: true },
            }}
          />
          <WrappedNivoHBar
            data={processed_data}
            is_money={false}
            indexBy={"key_desc"}
            keys={[can_online, cannot_online, not_applicable]}
            colors={(d) => colors(d.id)}
            enableGridX={false}
            left_axis={{
              renderTick: (tick) => (
                <g
                  key={tick.tickIndex}
                  transform={`translate(${tick.x},${tick.y})`}
                >
                  <line
                    x1="0"
                    x2="-5"
                    y1="0"
                    y2="0"
                    style={{ strokeWidth: 1, stroke: "rgb(119 119 119)" }}
                  ></line>
                  <text
                    dominantBaseline={"central"}
                    textAnchor={"end"}
                    transform="translate(-10,-15) rotate(0)"
                    style={{
                      fontFamily: "sans-serif",
                      fontSize: "11px",
                      fill: "rgb(51, 51, 51)",
                    }}
                  >
                    <TspanLineWrapper text={tick.value} width={30} />
                  </text>
                </g>
              ),
            }}
            bttm_axis={{
              renderTick: (tick) =>
                tick.value % 1 === 0 && (
                  <g
                    key={tick.tickIndex}
                    transform={`translate(${tick.x},${tick.y + 3})`}
                  >
                    <line
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="7"
                      transform={`translate(0,-20)`}
                      style={{ stroke: "rgb(119, 119, 119)", strokeWidth: 1 }}
                    />
                    <text
                      transform={`translate(-${
                        4 * _.toString(tick.value).length
                      },0)`}
                    >
                      {tick.value}
                    </text>
                  </g>
                ),
            }}
            margin={{
              top: 20,
              right: 10,
              bottom: 50,
              left: 190,
            }}
          />
        </Fragment>
      )}
    </div>
  );
};

export const declare_services_digital_status_panel = () =>
  declare_panel({
    panel_key: "services_digital_status",
    subject_types: ["gov", "dept", "program"],
    panel_config_func: () => ({
      get_title: () => text_maker("services_digital_status"),
      calculate: ({ subject }) => {
        return {
          subject,
        };
      },
      get_dataset_keys: () => ["service_inventory"],
      render({ title, subject, sources, datasets }) {
        return (
          <InfographicPanel title={title} sources={sources} datasets={datasets}>
            <ServicesDigitalStatusPanel subject={subject} />
          </InfographicPanel>
        );
      },
    }),
  });
