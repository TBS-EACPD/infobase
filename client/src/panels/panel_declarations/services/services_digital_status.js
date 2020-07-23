import text from "./services.yaml";
import { Service } from "../../../models/services.js";

import {
  create_text_maker_component,
  InfographicPanel,
  declare_panel,
  WrappedNivoPie,
} from "../shared.js";
import { digital_status_keys } from "./shared.js";

const { text_maker, TM } = create_text_maker_component(text);

const ServicesDigitalStatusPanel = ({ panel_args }) => {
  const services = panel_args.services;
  const total_online_digital_statuses = _.reduce(
    digital_status_keys,
    (sum, key) => {
      const current_count = _.countBy(services, `${key}_status`).true || 0;
      return sum + current_count;
    },
    0
  );
  const data = _.map(digital_status_keys, (key) => {
    const current_status_count = _.countBy(services, `${key}_status`).true || 0;
    return {
      label: text_maker(`${key}_desc`),
      id: key,
      value: current_status_count,
    };
  });
  return (
    <div>
      <TM
        className="medium_panel_text"
        k="services_digital_status_text"
        args={{
          subject_name: panel_args.subject.name,
          total_online_digital_status_percentage:
            total_online_digital_statuses / (services.length * 6),
        }}
      />
      <WrappedNivoPie data={data} is_money={false} />
    </div>
  );
};

export const declare_services_digital_status_panel = () =>
  declare_panel({
    panel_key: "dept_services_digital_status",
    levels: ["dept"],
    panel_config_func: (level, panel_key) => ({
      requires_services: true,
      calculate: (subject) => ({
        subject,
        services: Service.get_by_dept(subject.id),
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
