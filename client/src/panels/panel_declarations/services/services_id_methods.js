import text from "./services.yaml";
import { Service } from "../../../models/services.js";
import {
  create_text_maker_component,
  InfographicPanel,
  declare_panel,
  NivoResponsivePie,
  newIBCategoryColors,
} from "../shared.js";

const { text_maker, TM } = create_text_maker_component(text);

const ServicesIdMethodsPanel = ({ panel_args }) => {
  const services = panel_args.services;
  const colors = d3
    .scaleOrdinal()
    .domain(["uses_identifier", "does_not_identifier"])
    .range(_.take(newIBCategoryColors, 2));

  const sin_id = _.countBy(services, "sin_is_identifier");
  const cra_id = _.countBy(services, "cra_buisnss_number_is_identifier");

  const sin_data = [
    {
      id: "uses_identifier",
      label: text_maker("uses_sin_as_identifier"),
      value: sin_id.true,
    },
    {
      id: "does_not_identifier",
      label: text_maker("does_not_use_sin_as_identifier"),
      value: sin_id.false,
    },
  ];
  const cra_data = [
    {
      id: "uses_identifier",
      label: text_maker("uses_cra_as_identifier"),
      value: cra_id.true,
    },
    {
      id: "does_not_identifier",
      label: text_maker("does_not_use_cra_as_identifier"),
      value: cra_id.false,
    },
  ];

  const nivo_common_props = {
    is_money: false,
    colorBy: (d) => colors(d.id),
  };

  return (
    <div className={"col-container"}>
      <div className="fcol-md-6 p-20">
        <TM className="id-method-text" k="sin_sub_title" el="h4" />
        <NivoResponsivePie
          {...nivo_common_props}
          custom_legend_items={_.map(sin_data, (row) => ({
            ...row,
            color: colors(row.id),
          }))}
          data={sin_data}
        />
      </div>
      <div className="fcol-md-6 p-20">
        <TM className="id-method-text" k="cra_sub_title" el="h4" />
        <NivoResponsivePie
          {...nivo_common_props}
          custom_legend_items={_.map(cra_data, (row) => ({
            ...row,
            color: colors(row.id),
          }))}
          data={cra_data}
        />
      </div>
    </div>
  );
};

export const declare_services_id_methods_panel = () =>
  declare_panel({
    panel_key: "dept_services_id_methods",
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
            title={text_maker("identification_methods")}
            sources={sources}
          >
            <ServicesIdMethodsPanel panel_args={panel_args} />
          </InfographicPanel>
        );
      },
    }),
  });
