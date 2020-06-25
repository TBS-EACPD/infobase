import text from "./provided_services_list.yaml";
import { Service } from "../../../models/services.js";

import {
  create_text_maker_component,
  InfographicPanel,
  declare_panel,
} from "../shared.js";

const { text_maker, TM } = create_text_maker_component(text);

const ProvidedServicesListPanel = ({ panel_args }) => {
  return (
    <div>
      <TM
        k="list_of_provided_services_desc"
        args={{
          subject_name: panel_args.subject.name,
          num_of_services: panel_args.services.length,
        }}
      />
      {_.map(panel_args.services, ({ name, id, org_id }) => (
        <a key={id} href={`#dept/${org_id}/service-panels/${id}`}>
          {name}
        </a>
      ))}
    </div>
  );
};

export const declare_provided_services_list_panel = () =>
  declare_panel({
    panel_key: "dept_provided_services_list",
    levels: ["dept"],
    panel_config_func: (level, panel_key) => ({
      requires_services: true,
      calculate: (subject) => {
        const services =
          level === "dept"
            ? Service.get_by_dept(subject.id)
            : Service.get_all();
        return { subject, services };
      },
      footnotes: false,
      render({ calculations, sources }) {
        const { panel_args } = calculations;
        return (
          <InfographicPanel
            title={text_maker("list_of_provided_services_title")}
            sources={sources}
          >
            <ProvidedServicesListPanel panel_args={panel_args} />
          </InfographicPanel>
        );
      },
    }),
  });
