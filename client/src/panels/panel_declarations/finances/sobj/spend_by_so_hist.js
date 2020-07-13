import {
  businessConstants,
  year_templates,
  util_components,
  InfographicPanel,
  StandardLegend,
  SelectAllControl,
  A11yTable,
  run_template,
  NivoResponsiveLine,
  newIBLightCategoryColors,
  newIBDarkCategoryColors,
  declare_panel,
} from "../../shared.js";
import { text_maker, TM } from "./sobj_text_provider.js";
import { fill } from "lodash";

const { sos } = businessConstants;
const { std_years } = year_templates;
const { Format, DisplayTable } = util_components;

class SobjLine extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active_sobjs: [_.first(props.data).label],
    };
    this.colors = d3
      .scaleOrdinal()
      .range(_.concat(newIBLightCategoryColors, newIBDarkCategoryColors));
  }
  render() {
    const { data } = this.props;
    const { active_sobjs } = this.state;
    const { colors } = this;

    const all_labels = _.map(data, "label");
    const legend_items = _.concat(
      _.map(data, ({ label }) => ({
        label,
        id: label,
        active: _.includes(active_sobjs, label),
        color: colors(label),
      })),
      {
        label: "none",
        id: "none",
        active: true,
        color: "black",
      }
    );

    const graph_series = _.chain(data)
      .filter(({ label }) => _.includes(active_sobjs, label))
      .map(({ label, data }) => [label, data])
      .fromPairs()
      .value();

    const raw_data = _.flatMap(graph_series, (value) => value);

    const years = _.map(std_years, run_template);
    const spending_data = _.map(
      graph_series,
      (spending_array, spending_label) => ({
        id: spending_label,
        data: spending_array.map((spending_value, year_index) => ({
          x: years[year_index],
          y: spending_value,
        })),
      })
    );
    const custom_table_data = _.chain(data)
      .filter(({ label }) => _.includes(active_sobjs, label))
      .map(({ label, data }) => ({
        label: label,
        ..._.chain().zip(years, data).fromPairs().value(),
      }))
      .value();
    const column_configs = {
      label: {
        index: 0,
        header: text_maker("sos"),
        is_searchable: true,
      },
      ..._.chain(years)
        .map((year, idx) => [
          year,
          {
            index: idx + 1,
            header: year,
            is_summable: true,
            formatter: "dollar",
          },
        ])
        .fromPairs()
        .value(),
    };

    const get_line_graph = (() => {
      if (_.isEmpty(spending_data) && _.isEmpty(raw_data)) {
        const max_y = _.max(_.map(data, (obj) => _.max(obj.data)));
        const filler_data = [
          {
            id: "none",
            data: _.map(years, (year) => ({
              x: year,
              y: max_y,
            })),
          },
        ];
        console.log(filler_data);

        return (
          <NivoResponsiveLine
            data={filler_data}
            raw_data={[max_y]}
            enableDots={false}
            lineWidth={0}
            margin={{
              top: 10,
              right: 30,
              bottom: 90,
              left: 70,
            }}
            graph_height="500px"
            colorBy={(d) => colors(d.id)}
            custom_table={
              <DisplayTable
                data={custom_table_data}
                column_configs={column_configs}
              />
            }
          />
        );
      } else {
        return (
          <NivoResponsiveLine
            data={spending_data.reverse()}
            raw_data={raw_data}
            margin={{
              top: 10,
              right: 30,
              bottom: 90,
              left: 70,
            }}
            graph_height="500px"
            colorBy={(d) => colors(d.id)}
            custom_table={
              <DisplayTable
                data={custom_table_data}
                column_configs={column_configs}
              />
            }
          />
        );
      }
    })();

    return (
      <div className="frow">
        <div className="fcol-md-4">
          <StandardLegend
            items={legend_items}
            onClick={(id) => {
              !(
                spending_data.length === 1 &&
                spending_data.map((o) => o.id).includes(id)
              ) &&
                this.setState({
                  active_sobjs: _.toggle_list(active_sobjs, id),
                });
            }}
            Controls={
              <SelectAllControl
                SelectAllOnClick={() =>
                  this.setState({ active_sobjs: all_labels })
                }
                SelectNoneOnClick={() => this.setState({ active_sobjs: [] })}
              />
            }
          />
        </div>
        <div
          className="fcol-md-8"
          style={{ position: "relative", marginTop: "10px" }}
        >
          {get_line_graph}
        </div>
      </div>
    );
  }
}

export const declare_spend_by_so_hist_panel = () =>
  declare_panel({
    panel_key: "spend_by_so_hist",
    levels: ["dept"],
    panel_config_func: (level, panel_key) => ({
      depends_on: ["orgSobjs"],
      footnotes: ["SOBJ", "EXP"],
      info_deps: ["orgSobjs_dept_info", "orgSobjs_gov_info"],
      calculate(subject, info) {
        const { orgSobjs } = this.tables;
        return {
          data: _.chain(sos)
            .sortBy((sobj) => sobj.so_num)
            .map((sobj) => ({
              label: sobj.text,
              data: std_years.map(
                (year) => orgSobjs.so_num(year, subject)[sobj.so_num]
              ),
            }))
            .filter((d) => d3.sum(d.data))
            .value(),
          ticks: _.map(std_years, run_template),
        };
      },
      render({ calculations, footnotes, sources }) {
        const { panel_args, info } = calculations;
        const { ticks, data } = panel_args;

        const graph_content = (() => {
          if (window.is_a11y_mode) {
            return (
              <A11yTable
                data={_.map(data, ({ label, data }) => ({
                  label,
                  /* eslint-disable react/jsx-key */
                  data: data.map((amt) => (
                    <Format type="compact1_written" content={amt} />
                  )),
                }))}
                label_col_header={text_maker("so")}
                data_col_headers={ticks}
              />
            );
          } else {
            return <SobjLine data={data} />;
          }
        })();

        return (
          <InfographicPanel
            title={text_maker("dept_fin_spend_by_so_hist_title")}
            {...{ sources, footnotes }}
          >
            <div className="medium_panel_text">
              <TM k="dept_fin_spend_by_so_hist_text" args={info} />
            </div>
            <div>{graph_content}</div>
          </InfographicPanel>
        );
      },
    }),
  });
