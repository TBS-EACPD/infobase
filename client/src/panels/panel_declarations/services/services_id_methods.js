import text from "./provided_services_list.yaml";
import { Service } from "../../../models/services.js";

import {
  create_text_maker_component,
  InfographicPanel,
  declare_panel,
  NivoResponsiveBar,
} from "../shared.js";

const { text_maker, TM } = create_text_maker_component(text);
//TODO WIP
const ServicesIdMethodsPanel = ({ panel_args }) => {
  const data_keys = ["sin_is_identifier", "cra_buisnss_number_is_identifier"];
  const label_keys = ["uses_this_id", "doesnt_use_id"];
  const colors = infobase_colors();

  return <div>TODO</div>;
};

export const declare_services_id_methods_panel = () =>
  declare_panel({
    panel_key: "dept_services_id_methods",
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
          <InfographicPanel title={"ID METHODS TODO"} sources={sources}>
            <ServicesIdMethodsPanel panel_args={panel_args} />
          </InfographicPanel>
        );
      },
    }),
  });
