import { scaleOrdinal } from "d3-scale";
import _ from "lodash";
import React, { Fragment } from "react";

import {
  secondaryColor,
  highlightOrangeColor,
  separatorColor,
} from "src/core/color_defs.js";

import { is_a11y_mode, lang } from "src/core/injected_build_constants.js";

import {
  create_text_maker_component,
  InfographicPanel,
  declare_panel,
  WrappedNivoHBar,
  StandardLegend,
  util_components,
} from "../shared.js";

import { digital_status_keys } from "./shared.js";

import text from "./services.yaml";

const { DisplayTable } = util_components;
const { text_maker, TM } = create_text_maker_component(text);
const can_online = text_maker("can_online");
const cannot_online = text_maker("cannot_online");
const not_applicable = text_maker("not_applicable");

const colors = scaleOrdinal().range([
  secondaryColor,
  highlightOrangeColor,
  separatorColor,
]);

const ServicesDigitalStatusPanel = ({ services, panel_args }) => {
  const { subject } = panel_args;

  const get_current_status_count = (key, value) =>
    _.countBy(services, `${key}_status`)[value] || 0;

  const data = _.chain(digital_status_keys)
    .map((key) => ({
      id: text_maker(`${key}_desc`),
      key,
      [can_online]: get_current_status_count(key, true),
      [cannot_online]: get_current_status_count(key, false),
      [not_applicable]: get_current_status_count(key, null),
    }))
    .sortBy(can_online)
    .value();

  const most_digital_component = _.maxBy(data, can_online);
  const least_digital_component = _.minBy(data, can_online);
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
          num_of_services: services.length,
          subject_name: subject.name,
          most_digital_name: text_maker(most_digital_component.key),
          most_digital_pct:
            most_digital_component[can_online] / services.length,
          least_digital_name: text_maker(least_digital_component.key),
          least_digital_pct:
            least_digital_component[can_online] / services.length,
        }}
      />
      {is_a11y_mode ? (
        <DisplayTable
          data={data}
          column_configs={{
            id: {
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
            items={_.map(
              [can_online, cannot_online, not_applicable],
              (key) => ({
                id: key,
                label: key,
                color: colors(key),
              })
            )}
            isHorizontal
            LegendCheckBoxProps={{ isSolidBox: true }}
          />
          <WrappedNivoHBar
            data={data}
            is_money={false}
            indexBy={"id"}
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
      requires_services: true,
      calculate: (subject) => {
        return {
          subject,
        };
      },
      footnotes: false,
      render({ calculations, data, sources }) {
        const { panel_args } = calculations;
        return (
          <InfographicPanel
            title={text_maker("services_digital_status")}
            sources={sources}
          >
            <ServicesDigitalStatusPanel
              services={data}
              panel_args={panel_args}
            />
          </InfographicPanel>
        );
      },
    }),
  });
