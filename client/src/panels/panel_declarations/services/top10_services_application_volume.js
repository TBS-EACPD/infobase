import text from "./services.yaml";
import { Service } from "../../../models/services.js";
import { application_channels_keys } from "./shared.js";
import {
  create_text_maker_component,
  InfographicPanel,
  declare_panel,
} from "../shared.js";
import { DisplayTable } from "../../../components";

const { text_maker, TM } = create_text_maker_component(text);

const Top10ServicesApplicationVolumePanel = ({ panel_args }) => {
  const { services, subject } = panel_args;
  const data = _.chain(services)
    .map(({ id, service_report }) => ({
      id,
      total_volume: _.reduce(
        application_channels_keys,
        (sum, key) => sum + _.sumBy(service_report, `${key}_count`) || 0,
        0
      ),
    }))
    .sortBy("total_volume")
    .reverse()
    .take(10)
    .value();
  const column_configs = {
    id: {
      index: 0,
      header: text_maker("service_name"),
      is_searchable: true,
      formatter: (id) => (
        <a href={`#dept/${subject.id}/service-panels/${id}`}>
          {Service.lookup(id).name}
        </a>
      ),
      raw_formatter: (id) => Service.lookup(id).name,
    },
    total_volume: {
      index: 1,
      header: text_maker("applications_and_calls"),
      is_summable: true,
      formatter: "big_int",
    },
  };
  return (
    <div>
      <TM
        className="medium_panel_text"
        k="top10_services_volume_text"
        args={{
          highest_service_name: Service.lookup(data[0].id).name,
          highest_service_value: data[0].total_volume,
        }}
      />
      <DisplayTable
        unsorted_initial={true}
        data={data}
        column_configs={column_configs}
      />
    </div>
  );
};

export const declare_top10_services_application_volume_panel = () =>
  declare_panel({
    panel_key: "top10_services_application_volume",
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
            title={text_maker("top10_services_volume_title")}
            sources={sources}
          >
            <Top10ServicesApplicationVolumePanel panel_args={panel_args} />
          </InfographicPanel>
        );
      },
    }),
  });
