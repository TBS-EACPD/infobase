import text from "./services.yaml";
import { Service } from "../../../models/services.js";

import {
  create_text_maker_component,
  InfographicPanel,
  declare_panel,
  WrappedNivoPie,
} from "../shared.js";

const { text_maker, TM } = create_text_maker_component(text);

const ServicesTypesPanel = ({ panel_args }) => {
  const { services, subject } = panel_args;
  const data = _.chain(services)
    .flatMap("service_type")
    .countBy()
    .map((value, type) => ({
      id: type,
      label: type,
      value,
    }))
    .value();
  const max_type = _.maxBy(data, "value");

  return (
    <div>
      <TM
        args={{
          num_of_types: data.length,
          subject,
          max_type: max_type.label,
          max_type_pct: max_type.value / services.length,
        }}
        className="medium_panel_text"
        k="services_types_desc"
      />
      <WrappedNivoPie data={data} is_money={false} />
    </div>
  );
};

export const declare_services_types_panel = () =>
  declare_panel({
    panel_key: "services_types",
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
            title={text_maker("services_types")}
            sources={sources}
          >
            <ServicesTypesPanel panel_args={panel_args} />
          </InfographicPanel>
        );
      },
    }),
  });
