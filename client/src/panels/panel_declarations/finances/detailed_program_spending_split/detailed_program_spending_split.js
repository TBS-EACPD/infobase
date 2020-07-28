import { SmartDisplayTable, GraphOverlay } from "../../../../components";
import {
  WrappedNivoBar,
  WrappedNivoHBar,
  Subject,
  formats,
  run_template,
  util_components,
  infograph_href_template,
  year_templates,
  StandardLegend,
  SelectAllControl,
  businessConstants,
  InfographicPanel,
  FootNote,
  newIBLightCategoryColors,
  newIBDarkCategoryColors,
  declare_panel,
  TspanLineWrapper,
  HeightClippedGraph,
} from "../../shared.js";

import text from "./detailed_program_spending_split.yaml";

const { std_years } = year_templates;

const { create_text_maker_component, Select } = util_components;

const { sos } = businessConstants;

const { text_maker, TM } = create_text_maker_component(text);

const footnote_topics = ["PROG", "SOBJ"];

class HistoricalProgramBars extends React.Component {
  constructor(props) {
    super(props);
    const { data } = this.props;

    //start by picking the 3 largest programs that existed in pa_last_year
    const active_last_year_progs = _.chain(data)
      .sortBy(({ data }) => _.last(data) || 0)
      .takeRight(3)
      .map("id")
      .value();

    this.state = {
      selected: active_last_year_progs,
    };
  }
  render() {
    const { data } = this.props;
    const ticks = std_years.map((yr) => run_template(yr));
    const { selected } = this.state;

    const colors = d3
      .scaleOrdinal()
      .range(_.concat(newIBLightCategoryColors, newIBDarkCategoryColors));
    const all_keys = _.map(data, "id");

    const custom_table_data = _.chain(data)
      .filter(({ id }) => _.includes(selected, id))
      .map(({ label, data }) => ({
        label: label,
        ..._.chain().zip(ticks, data).fromPairs().value(),
      }))
      .value();

    const processed_data = _.chain(data)
      .filter(({ id }) => _.includes(selected, id))
      .map(({ label, data }) => [label, data])
      .fromPairs()
      .value();

    //have to have an empty string in key to make sure
    //that negative bars will be displayed
    const graph_data = _.map(ticks, (year, year_index) => ({
      year,
      ..._.chain(processed_data)
        .map((data, label) => [label, data[year_index]])
        .fromPairs()
        .value(),
    }));
    const column_configs = {
      label: {
        index: 0,
        header: text_maker("program"),
        is_searchable: true,
      },
      ..._.chain(ticks)
        .map((tick, idx) => [
          tick,
          {
            index: idx + 1,
            header: tick,
            is_summable: true,
            formatter: "compact2_written",
          },
        ])
        .fromPairs()
        .value(),
    };

    if (window.is_a11y_mode) {
      return (
        <SmartDisplayTable
          column_configs={column_configs}
          data={_.map(data, ({ label, data }) => ({
            label,
            ..._.chain().zip(ticks, data).fromPairs().value(),
          }))}
        />
      );
    }

    return (
      <div>
        <div className="panel-separator" />
        <div
          style={{ paddingBottom: "10px" }}
          className="center-text font-xlarge"
        >
          <strong>
            <TM k="historical_prog_title" />
          </strong>
        </div>
        <div className="frow">
          <div className="fcol-md-4" style={{ width: "100%" }}>
            <StandardLegend
              items={_.chain(data)
                .sortBy(({ data }) => _.last(data) || 0)
                .reverse()
                .map(({ label, id }) => ({
                  label,
                  active: _.includes(selected, id),
                  id,
                  color: colors(label),
                }))
                .value()}
              onClick={(id) => {
                !(selected.length === 1 && selected.includes(id)) &&
                  this.setState({
                    selected: _.toggle_list(selected, id),
                  });
              }}
              Controls={
                <SelectAllControl
                  SelectAllOnClick={() => this.setState({ selected: all_keys })}
                  SelectNoneOnClick={() => this.setState({ selected: [] })}
                />
              }
            />
          </div>
          <div className="fcol-md-8">
            <GraphOverlay>
              <WrappedNivoBar
                data={graph_data}
                keys={Object.keys(processed_data)}
                indexBy="year"
                colorBy={(d) => colors(d.id)}
                margin={{
                  top: 50,
                  right: 20,
                  bottom: 50,
                  left: 70,
                }}
                custom_table={
                  <SmartDisplayTable
                    column_configs={column_configs}
                    data={custom_table_data}
                  />
                }
              />
            </GraphOverlay>
          </div>
        </div>
      </div>
    );
  }
}

class DetailedProgramSplit extends React.Component {
  constructor() {
    super();
    this.state = {
      selected_program: text_maker("all"),
    };
  }

  render() {
    const { flat_data, arrangements, top_3_so_nums } = this.props;
    const { selected_program } = this.state;

    const colors = infobase_colors();
    const formatter = formats.compact1_raw;

    const { mapping } = _.find(arrangements, { id: selected_program });

    if (window.is_a11y_mode) {
      const a11y_table_data = _.map(
        flat_data,
        ({ so_label, program, value }) => ({
          program_name: program.name,
          so_label,
          value,
        })
      );
      const column_configs = {
        program_name: {
          index: 0,
          is_searchable: true,
          header: text_maker("program"),
        },
        so_label: {
          index: 1,
          header: text_maker("so"),
        },
        value: {
          index: 2,
          header: `${run_template("{{pa_last_year}}")} ${text_maker(
            "expenditures"
          )}`,
          formatter: "compact2_written",
        },
      };
      return (
        <SmartDisplayTable
          data={a11y_table_data}
          column_configs={column_configs}
        />
      );
    }

    const legend_items =
      selected_program === text_maker("all") &&
      _.chain([
        ..._.map(top_3_so_nums, (num) => sos[num].text),
        text_maker("other_sos"),
        text_maker("revenues"),
      ])
        .map((label) => ({
          label,
          active: true,
          id: label,
          color: colors(label),
        }))
        .sortBy(({ label }) => label === text_maker("other_sos"))
        .value();

    const so_label_list =
      selected_program === text_maker("all")
        ? _.map(legend_items, "label")
        : [selected_program];

    const graph_ready_data = _.chain(flat_data)
      .mapValues((row) => ({ ...row, so_label: mapping(row.so_num) }))
      .filter(
        (row) => row.value !== 0 && _.includes(so_label_list, row.so_label)
      )
      .groupBy((row) => row.program.name)
      .map((group) => ({
        label: _.first(group).program.name,

        ..._.chain(group)
          .groupBy("so_label")
          .map((so_label_rows, so_label) => [
            so_label,
            _.reduce(so_label_rows, (memo, row) => memo + row.value, 0),
          ])
          .fromPairs()
          .value(),

        total: _.reduce(group, (memo, row) => memo + row.value, 0),
      }))
      .sortBy("total")
      .value();

    // Increase height of the graph region for y-axis labels to have sufficient room
    // This is required to corretly display the labels when too many programs are present
    const divHeight = 650 * (graph_ready_data.length / 30) * 2;

    const markers = _.map(graph_ready_data, ({ label, total }) => ({
      axis: "y",
      value: label,
      lineStyle: { strokeWidth: 0 },
      textStyle: {
        fill:
          total < 0
            ? window.infobase_color_constants.highlightColor
            : window.infobase_color_constants.textColor,
        fontSize: "11px",
      },
      legend: formatter(total),
      legendOffsetX: -60,
      legendOffsetY: -(divHeight / (graph_ready_data.length * 2)),
    }));

    const programs_by_name = _.chain(flat_data)
      .map(({ program }) => [program.name, program])
      .fromPairs()
      .value();

    return (
      <div>
        <div className="panel-separator" />
        <div
          style={{ paddingBottom: "10px" }}
          className="center-text font-xlarge"
        >
          <strong>
            <TM k="so_spend_by_prog" />
          </strong>
        </div>
        <div className="frow">
          <div className="fcol-md-3" style={{ width: "100%" }}>
            <label>
              <TM k="filter_by_so" />
              <Select
                selected={selected_program}
                options={_.map(arrangements, ({ id, label }) => ({
                  id,
                  display: label,
                }))}
                onSelect={(id) => {
                  this.setState({
                    selected_program: id,
                  });
                }}
                style={{
                  display: "block",
                  margin: "10px auto",
                }}
                className="form-control"
              />
            </label>
            {legend_items && (
              <StandardLegend
                items={legend_items}
                LegendCheckBoxProps={{ isSolidBox: true }}
              />
            )}
          </div>
          <div className="fcol-md-9" style={{ width: "100%" }}>
            <GraphOverlay>
              <WrappedNivoHBar
                data={graph_ready_data}
                indexBy="label"
                keys={so_label_list}
                margin={{
                  top: 10,
                  right: 70,
                  bottom: 30,
                  left: 215,
                }}
                graph_height={divHeight}
                colorBy={(d) => colors(d.id)}
                bttm_axis={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickValues: 6,
                  format: (d) => formatter(d),
                }}
                left_axis={{
                  tickSize: 5,
                  tickPadding: 5,
                  renderTick: (tick) => (
                    <g
                      key={tick.key}
                      transform={`translate(${tick.x - 5},${tick.y + 1.5})`}
                    >
                      <a
                        href={
                          programs_by_name[tick.value]
                            ? infograph_href_template(
                                programs_by_name[tick.value]
                              )
                            : null
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <text
                          textAnchor="end"
                          dominantBaseline="end"
                          style={{
                            ...tick.theme.axis.ticks.text,
                          }}
                        >
                          <TspanLineWrapper text={tick.value} width={40} />
                        </text>
                      </a>
                    </g>
                  ),
                }}
                markers={markers}
                padding={0.05}
              />
            </GraphOverlay>
          </div>
        </div>
      </div>
    );
  }
}

export const declare_detailed_program_spending_split_panel = () =>
  declare_panel({
    panel_key: "detailed_program_spending_split",
    levels: ["dept"],
    panel_config_func: (level, panel_key) => ({
      depends_on: ["programSobjs", "programSpending"],

      footnotes: footnote_topics,
      calculate(subject, options) {
        const { programSobjs, programSpending } = this.tables;

        const table_data = programSobjs.q(subject).data;

        if (_.isEmpty(table_data)) {
          return false;
        }

        const flat_data = _.map(table_data, (row) => ({
          program: Subject.Program.get_from_activity_code(
            row.dept,
            row.activity_code
          ),
          so_num: row.so_num,
          so_label: row.so,
          value: row["{{pa_last_year}}"],
        }));

        const top_3_so_nums = _.chain(flat_data)
          .compact()
          .groupBy("so_num")
          .toPairs()
          .map(([so_num, group]) => ({
            so_num: +so_num,
            sum: d3.sum(group, _.property("value")),
          }))
          .sortBy("sum")
          .reverse()
          .map("so_num")
          .take(3)
          .value();

        //maps so_nums to new so_labels
        const higher_level_mapping = (so_num) => {
          if (+so_num > 19) {
            return text_maker("revenues");
          } else if (_.includes(top_3_so_nums, +so_num)) {
            return sos[+so_num].text;
          } else {
            return text_maker("other_sos");
          }
        };

        const exp_cols = _.map(std_years, (yr) => yr + "exp");
        const filtered_prog_spending_data = _.filter(
          programSpending.q(subject).data,
          (row) => d3.sum(exp_cols, (col) => row[col]) !== 0
        );

        const top_2_prgms = _.chain(filtered_prog_spending_data)
          .sortBy((row) => row["{{pa_last_year}}exp"])
          .takeRight(2)
          .reverse()
          .value();

        const top_1_prgm_five_yr_avg = _.chain(exp_cols)
          .sumBy((col) => top_2_prgms[0][col])
          .divide(exp_cols.length)
          .value();

        const processed_spending_data = _.chain(filtered_prog_spending_data)
          .map((row) => ({
            label: row.prgm,
            data: exp_cols.map((col) => row[col]),
            active: false,
          }))
          .sortBy((x) => -d3.sum(x.data))
          .value();

        const text_calculations = {
          subject,
          dept_num_of_progs: filtered_prog_spending_data.length,
          top_1_prgm_name: top_2_prgms[0].prgm,
          top_1_prgm_amt: top_2_prgms[0]["{{pa_last_year}}exp"],
          top_2_prgm_name: top_2_prgms[1].prgm,
          top_2_prgm_amt: top_2_prgms[1]["{{pa_last_year}}exp"],
          top_1_prgm_five_yr_avg: top_1_prgm_five_yr_avg,
        };

        const program_footnotes = _.chain(flat_data)
          .map(({ program }) => program)
          .uniqBy((program) => program.activity_code)
          .flatMap((program) =>
            FootNote.get_for_subject(program, [...footnote_topics, "EXP"])
          )
          .filter()
          .value();

        return {
          text_calculations,
          top_3_so_nums,
          flat_data,
          higher_level_mapping,
          processed_spending_data,
          program_footnotes,
        };
      },

      render({ calculations, footnotes, sources }) {
        const {
          panel_args: {
            text_calculations,
            flat_data,
            higher_level_mapping,
            top_3_so_nums,
            processed_spending_data,
            program_footnotes,
          },
        } = calculations;

        const filter_to_specific_so = (so_num) => (test_so_num) =>
          test_so_num === so_num ? sos[+so_num].text : null;

        const arrangements = [
          {
            label: text_maker("all"),
            id: text_maker("all"),
            mapping: (so_num) => higher_level_mapping(so_num),
          },
        ].concat(
          _.chain(flat_data)
            .map("so_num")
            .uniqBy()
            .map((so_num) => ({
              id: sos[so_num].text,
              label: sos[so_num].text,
              mapping: filter_to_specific_so(so_num),
            }))
            .sortBy("label")
            .value()
        );

        return (
          <InfographicPanel
            title={text_maker("detailed_program_spending_split_title")}
            {...{ sources, footnotes: [...footnotes, ...program_footnotes] }}
          >
            <div className="medium_panel_text">
              <TM
                k={"dept_historical_program_spending_text"}
                args={text_calculations}
              />
            </div>
            <div>
              <div>
                <HistoricalProgramBars
                  data={_.map(
                    processed_spending_data,
                    ({ label, data }, ix) => ({
                      label,
                      data,
                      id: `${ix}-${label}`, //need unique id, program names don't always work!
                    })
                  )}
                />
              </div>
              <div>
                <HeightClippedGraph clipHeight={300}>
                  <DetailedProgramSplit
                    flat_data={flat_data}
                    arrangements={arrangements}
                    top_3_so_nums={top_3_so_nums}
                  />
                </HeightClippedGraph>
              </div>
            </div>
          </InfographicPanel>
        );
      },
    }),
  });
