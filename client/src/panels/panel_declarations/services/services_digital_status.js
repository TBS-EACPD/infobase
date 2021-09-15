import { scaleOrdinal } from "d3-scale";
import _ from "lodash";
import React, { Fragment } from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";

import {
  DisplayTable,
  create_text_maker_component,
  LeafSpinner,
} from "src/components/index";

import { useSummaryServices } from "src/models/populate_services";

import { is_a11y_mode, lang } from "src/core/injected_build_constants";

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
  const { loading, data } = useSummaryServices({
    subject,
    query_fragment: `
    service_general_stats{
      id
      number_of_services
    }
    service_digital_status_summary {
      id
      key_desc
      key
      can_online
      cannot_online
      not_applicable
    }`,
  });
  if (loading) {
    return <LeafSpinner config_name="inline_panel" />;
  }
  const {
    service_general_stats: { number_of_services },
    service_digital_status_summary,
  } = data;
  const processed_data = _.map(service_digital_status_summary, (row) => ({
    ...row,
    key_desc: text_maker(row.key_desc),
    [can_online]: row.can_online,
    [cannot_online]: row.cannot_online,
    [not_applicable]: row.not_applicable,
  }));

  const most_digital_component = _.maxBy(processed_data, can_online);
  const least_digital_component = _.minBy(processed_data, can_online);
  const nivo_lang_props = {
    en: {
      margin: {
        top: 20,
        right: 10,
        bottom: 50,
        left: 210,
      },
    },
    fr: {
      left_axis: {
        tickRotation: 45,
      },
      margin: {
        top: 170,
        right: 10,
        bottom: 50,
        left: 235,
      },
    },
  };

  return (
    <div>
      <TM
        className="medium-panel-text"
        k={
          most_digital_component.key === least_digital_component.key
            ? "service_digital_status_most_and_least_same_text"
            : subject.level === "program"
            ? "services_digital_status_prog_text"
            : "services_digital_status_text"
        }
        args={{
          is_most_and_least_same:
            most_digital_component.key === least_digital_component.key,
          num_of_services: number_of_services,
          subject_name: subject.name,
          most_digital_name: text_maker(most_digital_component.key),
          most_digital_pct:
            most_digital_component[can_online] / number_of_services,
          least_digital_name: text_maker(least_digital_component.key),
          least_digital_pct:
            least_digital_component[can_online] / number_of_services,
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
            bttm_axis={{
              renderTick: (tick) =>
                tick.value % 1 === 0 && (
                  <g
                    key={tick.tickIndex}
                    transform={`translate(${tick.x - 3.5},${tick.y + 12})`}
                  >
                    <text>{tick.value}</text>
                  </g>
                ),
            }}
            {...nivo_lang_props[lang]}
          />
        </Fragment>
      )}
    </div>
  );
};

export const declare_services_digital_status_panel = () =>
  declare_panel({
    panel_key: "services_digital_status",
    levels: ["gov", "dept", "program"],
    panel_config_func: (level, panel_key) => ({
      title: text_maker("services_digital_status"),
      calculate: (subject) => {
        return {
          subject,
        };
      },
      footnotes: false,
      render({ title, calculations, sources }) {
        const { subject } = calculations;
        return (
          <InfographicPanel title={title} sources={sources}>
            <ServicesDigitalStatusPanel subject={subject} />
          </InfographicPanel>
        );
      },
    }),
  });
