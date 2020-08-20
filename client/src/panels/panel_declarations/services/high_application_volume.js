import text from "./services.yaml";
import { Service } from "../../../models/services.js";
import { Subject } from "../../../models/subject.js";
import { application_channels_keys } from "./shared.js";
import {
  create_text_maker_component,
  InfographicPanel,
  declare_panel,
  HeightClippedGraph,
} from "../shared.js";
import { DisplayTable } from "../../../components";
const { Dept } = Subject;

const { text_maker, TM } = create_text_maker_component(text);

const HighApplicationVolumePanel = ({ panel_args }) => {
  const { services } = panel_args;

  const data = _.chain(services)
    .groupBy("org_id")
    .map((org_services, org_id) => ({
      org_id,
      total_volume: _.sumBy(org_services, (service) =>
        _.reduce(
          application_channels_keys,
          (sum, key) =>
            sum + _.sumBy(service.service_report, `${key}_count`) || 0,
          0
        )
      ),
    }))
    // 45,000+ volume is considered "high volume"
    .reject(({ total_volume }) => total_volume <= 45000)
    .sortBy("total_volume")
    .reverse()
    .value();

  const column_configs = {
    org_id: {
      index: 0,
      header: text_maker("org"),
      is_searchable: true,
      formatter: (org_id) => (
        <a href={`#orgs/dept/${org_id}/infograph/services`}>
          {Dept.lookup(org_id).name}
        </a>
      ),
      raw_formatter: (org_id) => Dept.lookup(org_id).name,
    },
    total_volume: {
      index: 1,
      header: text_maker("applications_and_calls"),
      is_summable: true,
      formatter: "big_int",
    },
  };
  return (
    <HeightClippedGraph clipHeight={600}>
      <TM
        className="medium_panel_text"
        k="high_application_volume_text"
        args={{
          num_of_high_volume_depts: data.length,
          highest_volume_dept: Dept.lookup(data[0].org_id).name,
          highest_volume_value: data[0].total_volume,
        }}
      />
      <DisplayTable
        unsorted_initial={true}
        data={data}
        column_configs={column_configs}
      />
    </HeightClippedGraph>
  );
};

export const declare_high_application_volume_panel = () =>
  declare_panel({
    panel_key: "high_application_volume",
    levels: ["gov"],
    panel_config_func: (level, panel_key) => ({
      requires_services: true,
      calculate: () => ({
        services: Service.get_all(),
      }),
      footnotes: false,
      render({ calculations, sources }) {
        const { panel_args } = calculations;
        return (
          <InfographicPanel
            title={text_maker("high_application_volume_title")}
            sources={sources}
          >
            <HighApplicationVolumePanel panel_args={panel_args} />
          </InfographicPanel>
        );
      },
    }),
  });
