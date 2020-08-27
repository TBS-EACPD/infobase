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
          max_type_count: max_type.value,
          num_of_services: services.length,
        }}
        className="medium_panel_text"
        k="services_types_desc"
      />
      {is_a11y_mode ? (
        <DisplayTable
          data={data}
          column_configs={{
            label: {
              index: 0,
              header: text_maker("service_types"),
              is_searchable: true,
            },
            value: {
              index: 1,
              header: text_maker("value"),
            },
          }}
        />
      ) : (
        <WrappedNivoPie data={data} include_percent={false} is_money={false} />
      )}
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
            title={text_maker("service_types")}
            sources={sources}
          >
            <ServicesTypesPanel panel_args={panel_args} />
          </InfographicPanel>
        );
      },
    }),
  });
