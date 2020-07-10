import text from "./services.yaml";
import { Service } from "../../../models/services.js";

import {
  create_text_maker_component,
  InfographicPanel,
  declare_panel,
  NivoResponsivePie,
} from "../shared.js";

const { text_maker, TM } = create_text_maker_component(text);

const ServicesFeesPanel = ({ panel_args }) => {
  const { services, subject } = panel_args;
  const service_charges_fees = _.countBy(services, "collects_fees");
  return (
    <div>
      <TM
        k="services_fees_text"
        args={{
          subject_name: subject.name,
          charge_fees_percentage:
            service_charges_fees.true / services.length || 0,
        }}
        className="medium_panel_text"
      />
      <NivoResponsivePie
        data={[
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
        ]}
        is_money={false}
      />
    </div>
  );
};

export const declare_services_fees_panel = () =>
  declare_panel({
    panel_key: "dept_services_fees",
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
            title={text_maker("services_fees")}
            sources={sources}
          >
            <ServicesFeesPanel panel_args={panel_args} />
          </InfographicPanel>
        );
      },
    }),
  });
