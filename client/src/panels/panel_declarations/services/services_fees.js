import text from "./services.yaml";
import { Service } from "../../../models/services.js";

import {
  create_text_maker_component,
  InfographicPanel,
  declare_panel,
  WrappedNivoPie,
  util_components,
} from "../shared.js";

const { DisplayTable } = util_components;
const { text_maker, TM } = create_text_maker_component(text);

const ServicesFeesPanel = ({ panel_args }) => {
  const { services, subject } = panel_args;
  const service_charges_fees = _.countBy(services, "collects_fees");
  const data = [
    {
      id: "fees",
      label: text_maker("service_charges_fees"),
      value: service_charges_fees.true || 0,
    },
    {
      id: "no_fees",
      label: text_maker("service_does_not_charge_fees"),
      value: service_charges_fees.false || 0,
    },
  ];
  return (
    <div>
      <TM
        k="services_fees_text"
        args={{
          subject_name: subject.name,
          services_count: services.length,
          charge_fees_count: service_charges_fees.true || 0,
        }}
        className="medium_panel_text"
      />
      {window.is_a11y_mode ? (
        <DisplayTable
          data={data}
          column_configs={{
            label: {
              index: 0,
              header: text_maker("services_fees"),
            },
            value: {
              index: 1,
              header: text_maker("value"),
            },
          }}
        />
      ) : (
        <WrappedNivoPie data={data} is_money={false} />
      )}
    </div>
  );
};

export const declare_services_fees_panel = () =>
  declare_panel({
    panel_key: "services_fees",
    levels: ["gov", "dept", "program"],
    panel_config_func: (level, panel_key) => ({
      requires_services: true,
      calculate: (subject) => {
        const services = {
          dept: Service.get_by_dept(subject.id),
          program: Service.get_by_prog(subject.id),
          gov: Service.get_all(),
        };
        return {
          subject,
          services: services[level],
        };
      },
      footnotes: false,
      render({ calculations, sources }) {
        const { panel_args } = calculations;
        return (
          <InfographicPanel
            title={text_maker("services_fees")}
            sources={sources}
          >
            <ServicesFeesPanel panel_args={panel_args} />
          </InfographicPanel>
        );
      },
    }),
  });
