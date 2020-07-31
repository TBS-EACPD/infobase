import text from "./services.yaml";
import { Service } from "../../../models/services.js";

import {
  create_text_maker_component,
  InfographicPanel,
  declare_panel,
  WrappedNivoHBar,
  StandardLegend,
} from "../shared.js";
import { digital_status_keys } from "./shared.js";

const { text_maker, TM } = create_text_maker_component(text);
const can_online = text_maker("can_online");
const cannot_online = text_maker("cannot_online");
const not_applicable = text_maker("not_applicable");

const colors = d3
  .scaleOrdinal()
  .range([
    window.infobase_color_constants.secondaryColor,
    window.infobase_color_constants.highlightOrangeColor,
    window.infobase_color_constants.separatorColor,
  ]);

const ServicesDigitalStatusPanel = ({ panel_args }) => {
  const services = panel_args.services;

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

  return (
    <div>
      <TM
        className="medium_panel_text"
        k="services_digital_status_text"
        args={{
          num_of_services: services.length,
          subject_name: panel_args.subject.name,
          most_digital_name: text_maker(most_digital_component.key),
          most_digital_pct:
            most_digital_component[can_online] / services.length,
          least_digital_name: text_maker(least_digital_component.key),
          least_digital_pct:
            least_digital_component[can_online] / services.length,
        }}
      />
      <StandardLegend
        items={_.map([can_online, cannot_online, not_applicable], (key) => ({
          id: key,
          label: key,
          color: colors(key),
        }))}
        isHorizontal
        LegendCheckBoxProps={{ isSolidBox: true }}
      />
      <WrappedNivoHBar
        data={data}
        is_money={false}
        indexBy={"id"}
        keys={[can_online, cannot_online, not_applicable]}
        margin={{
          top: 20,
          right: 10,
          bottom: 50,
          left: 210,
        }}
        colorBy={(d) => colors(d.id)}
      />
    </div>
  );
};

export const declare_services_digital_status_panel = () =>
  declare_panel({
    panel_key: "dept_services_digital_status",
    levels: ["dept", "gov"],
    panel_config_func: (level, panel_key) => ({
      requires_services: true,
      calculate: (subject) => ({
        subject,
        services:
          level === "dept"
            ? Service.get_by_dept(subject.id)
            : Service.get_all(),
      }),
      footnotes: false,
      render({ calculations, sources }) {
        const { panel_args } = calculations;
        return (
          <InfographicPanel
            title={text_maker("services_digital_status")}
            sources={sources}
          >
            <ServicesDigitalStatusPanel panel_args={panel_args} />
          </InfographicPanel>
        );
      },
    }),
  });
