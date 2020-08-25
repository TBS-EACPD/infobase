import text from "./services.yaml";
import { Subject } from "../../../models/subject.js";
import { Service } from "../../../models/services.js";
import MediaQuery from "react-responsive";
import {
  create_text_maker_component,
  InfographicPanel,
  declare_panel,
  WrappedNivoHBar,
  TspanLineWrapper,
  formatter,
  newIBLightCategoryColors,
  infograph_href_template,
} from "../shared.js";
import { DisplayTable } from "../../../components";

const { text_maker, TM } = create_text_maker_component(text);
const Dept = Subject.Dept;

const colors = d3.scaleOrdinal().range(_.at(newIBLightCategoryColors, [0]));

const website_visits_key = "online_inquiry";
const total_volume = text_maker(website_visits_key);
const volume_formatter = (val) =>
  formatter("compact", val, { raw: true, noMoney: true });

const Top10WebsiteVisitsPanel = ({ panel_args }) => {
  const { services, subject } = panel_args;
  const is_gov = subject.level === "gov";
  const get_name = (id) => {
    if (is_gov) {
      const dept = Dept.lookup(id);
      return dept ? dept.name : "";
    } else {
      const srvce = Service.lookup(id);
      return srvce ? srvce.name : "";
    }
  };

  const preprocessed_data = is_gov
    ? _.chain(services)
        .groupBy("org_id")
        .map((org_services, org_id) => ({
          id: org_id,
          [total_volume]: _.sumBy(
            org_services,
            ({ service_report }) =>
              _.sumBy(service_report, `${website_visits_key}_count`) || 0
          ),
        }))
        .value()
    : _.map(services, ({ id, service_report }) => ({
        id,
        [total_volume]:
          _.sumBy(service_report, `${website_visits_key}_count`) || 0,
      }));

  const data = _.chain(preprocessed_data)
    .filter(total_volume)
    .sortBy(total_volume)
    .takeRight(10)
    .value();
  const column_configs = {
    id: {
      index: 0,
      header: is_gov ? text_maker("org") : text_maker("service_name"),
      is_searchable: true,
      formatter: (id) => (
        <a
          href={
            is_gov
              ? infograph_href_template(Dept.lookup(id), "services")
              : `#dept/${subject.id}/service-panels/${id}`
          }
        >
          {get_name(id)}
        </a>
      ),
      raw_formatter: (id) => get_name(id),
    },
    [total_volume]: {
      index: 1,
      header: total_volume,
      is_summable: true,
      formatter: "big_int",
    },
  };
  return _.isEmpty(data) ? (
    <TM k="no_data" el="h2" />
  ) : (
    <div>
      <TM
        className="medium_panel_text"
        k={`top10_${subject.level}_website_visits_text`}
        args={{
          highest_volume_name: get_name(_.last(data).id),
          highest_volume_value: _.last(data)[total_volume],
        }}
      />
      <MediaQuery minWidth={992}>
        <WrappedNivoHBar
          indexBy={"id"}
          custom_table={
            <DisplayTable
              data={[...data].reverse()}
              column_configs={column_configs}
              unsorted_initial={true}
            />
          }
          keys={[total_volume]}
          isInteractive={true}
          enableLabel={true}
          labelSkipWidth={30}
          label={(d) => volume_formatter(d.value)}
          data={data}
          is_money={false}
          colorBy={(d) => colors(d.id)}
          padding={0.1}
          enableGridY={false}
          enableGridX={false}
          margin={{
            top: 20,
            right: 20,
            bottom: 50,
            left: 370,
          }}
          bttm_axis={{
            tickSize: 5,
            tickValues: 4,
            format: (d) => volume_formatter(d),
          }}
          left_axis={{
            tickSize: 5,
            tickValues: 6,
            renderTick: (tick) => (
              <g
                key={tick.key}
                transform={`translate(${tick.x - 10},${tick.y})`}
              >
                <a
                  href={
                    is_gov
                      ? infograph_href_template(
                          Dept.lookup(tick.key),
                          "services"
                        )
                      : `#dept/${subject.id}/service-panels/${tick.key}`
                  }
                >
                  <text
                    textAnchor="end"
                    dominantBaseline="end"
                    style={{
                      ...tick.theme.axis.ticks.text,
                    }}
                  >
                    <TspanLineWrapper text={get_name(tick.key)} width={70} />
                  </text>
                </a>
              </g>
            ),
          }}
        />
      </MediaQuery>
      <MediaQuery maxWidth={991}>
        <DisplayTable
          data={[...data].reverse()}
          column_configs={column_configs}
          unsorted_initial={true}
        />
      </MediaQuery>
    </div>
  );
};

export const declare_top10_website_visits_panel = () =>
  declare_panel({
    panel_key: "top10_website_visits",
    levels: ["gov", "dept"],
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
            title={text_maker("top10_website_visits_title")}
            sources={sources}
          >
            <Top10WebsiteVisitsPanel panel_args={panel_args} />
          </InfographicPanel>
        );
      },
    }),
  });
