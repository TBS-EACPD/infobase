import { sum } from "d3-array";
import { scaleOrdinal } from "d3-scale";
import _ from "lodash";
import React, { useMemo } from "react";

import {
  HeightClippedGraph,
  TspanLineWrapper,
} from "src/panels/panel_declarations/common_panel_components";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import {
  create_text_maker_component,
  Select,
  DisplayTable,
  GraphOverlay,
  LeafSpinner,
  SelectAllControl,
} from "src/components/index";

import { calculate_detailed_program_spending_split_from_finance_data } from "src/models/finances/detailed_program_spending_split_calculations";
import { useDetailedProgramSpendingSplitFinanceData } from "src/models/finances/useDetailedProgramSpendingSplitFinanceData";

import { businessConstants } from "src/models/businessConstants";

import { run_template } from "src/models/text";
import { year_templates } from "src/models/years";

import {
  newIBLightCategoryColors,
  newIBDarkCategoryColors,
  infobase_colors,
} from "src/core/color_schemes";
import { formats } from "src/core/format";

import { is_a11y_mode } from "src/core/injected_build_constants";

import { StandardLegend } from "src/charts/legends/index";

import { WrappedNivoBar, WrappedNivoHBar } from "src/charts/wrapped_nivo/index";

import { toggle_list } from "src/general_utils";
import { infographic_href_template } from "src/infographic/infographic_href_template";
import { highlightColor, textColor } from "src/style_constants/index";

import text from "./detailed_program_spending_split.yaml";

const { std_years } = year_templates;

const { sos } = businessConstants;

const { text_maker, TM } = create_text_maker_component(text);

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

    const colors = scaleOrdinal().range(
      _.concat(newIBLightCategoryColors, newIBDarkCategoryColors)
    );

    const custom_table_data = _.chain(data)
      .filter(({ id }) => _.includes(selected, id))
      .map(({ label, data }) => ({
        label: label,
        ..._.chain().zip(ticks, data).fromPairs().value(),
      }))
      .value();

    // merge programs with the same name; limitation of nivo being keyed by label while we have programs with reused names
    const filtered_data_merged_by_program_name = _.chain(data)
      .filter(({ id }) => _.includes(selected, id))
      .groupBy("label")
      .mapValues((programs) =>
        _.chain(programs)
          .map("data")
          .thru((data_rows) => _.zip(...data_rows))
          .map(_.sum)
          .value()
      )
      .value();

    const graph_data = _.map(ticks, (year, year_index) => ({
      year,
      ..._.mapValues(
        filtered_data_merged_by_program_name,
        (data) => data[year_index]
      ),
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

    if (is_a11y_mode) {
      return (
        <DisplayTable
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
          className="text-center font-xlarge"
        >
          <strong>
            <TM k="historical_prog_title" />
          </strong>
        </div>
        <div className="row">
          <div className="col-12 col-lg-4" style={{ width: "100%" }}>
            <StandardLegend
              legendListProps={{
                items: _.chain(data)
                  .sortBy(({ data }) => _.last(data) || 0)
                  .reverse()
                  .map(({ label, id }) => ({
                    label,
                    active: _.includes(selected, id),
                    id,
                    color: colors(label),
                  }))
                  .value(),
                onClick: (id) => {
                  !(selected.length === 1 && selected.includes(id)) &&
                    this.setState({
                      selected: toggle_list(selected, id),
                    });
                },
              }}
              Controls={
                <SelectAllControl
                  key="SelectAllControl"
                  SelectAllOnClick={() =>
                    this.setState({ selected: _.map(data, "id") })
                  }
                  SelectNoneOnClick={() => this.setState({ selected: [] })}
                />
              }
            />
          </div>
          <div className="col-12 col-lg-8">
            <GraphOverlay>
              <WrappedNivoBar
                data={graph_data}
                keys={Object.keys(filtered_data_merged_by_program_name)}
                indexBy="year"
                colors={(d) => colors(d.id)}
                margin={{
                  top: 50,
                  right: 20,
                  bottom: 50,
                  left: 70,
                }}
                custom_table={
                  <DisplayTable
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

    if (is_a11y_mode) {
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
        <DisplayTable data={a11y_table_data} column_configs={column_configs} />
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
    const divHeight = _.chain([1000 * (graph_ready_data.length / 30) * 2, 100]) // 100 is the minimum graph height
      .max()
      .thru((maxVal) => [maxVal, 1200]) // 1200 is the max graph height
      .min()
      .value();

    const markers = _.map(graph_ready_data, ({ label, total }) => ({
      axis: "y",
      value: label,
      lineStyle: { strokeWidth: 0 },
      textStyle: {
        fill: total < 0 ? highlightColor : textColor,
        fontSize: "11px",
      },
      legend: formatter(total),
      legendOffsetX: -60,
      legendOffsetY: Math.max(
        -(divHeight / (3.3 * graph_ready_data.length)),
        -18
      ), // Math.max so that there would be a set value for when the graph has one bar/data point
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
          className="text-center font-xlarge"
        >
          <strong>
            <TM k="so_spend_by_prog" />
          </strong>
        </div>
        <div className="row">
          <div className="col-12 col-lg-3" style={{ width: "100%" }}>
            <label htmlFor="select_so">
              <TM k="filter_by_so" />
            </label>
            <Select
              id={"select_so"}
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
                width: "100%",
              }}
              className="form-control"
            />
            {legend_items && (
              <StandardLegend
                legendListProps={{
                  items: legend_items,
                  checkBoxProps: { isSolidBox: true },
                }}
              />
            )}
          </div>
          <div className="col-12 col-lg-9" style={{ width: "100%" }}>
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
                colors={(d) => colors(d.id)}
                bttm_axis={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickValues: 6,
                  tickRotation: -20,
                  format: (d) => formatter(d),
                }}
                left_axis={{
                  tickSize: 5,
                  tickPadding: 5,
                  renderTick: (tick) => (
                    <g
                      key={tick.tickIndex}
                      transform={`translate(${tick.x - 5},${tick.y + 1.5})`}
                    >
                      <a
                        href={
                          programs_by_name[tick.value]
                            ? infographic_href_template(
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
                            fontSize: "11px",
                          }}
                        >
                          <TspanLineWrapper text={tick.value} width={40} />
                        </text>
                      </a>
                    </g>
                  ),
                }}
                markers={markers}
                padding={0.3}
              />
            </GraphOverlay>
          </div>
        </div>
      </div>
    );
  }
}

const DetailedProgramSpendingSplitContainer = (props) => {
  const { subject, title, footnotes, sources, datasets } = props;
  const { loading, finance_data } =
    useDetailedProgramSpendingSplitFinanceData(subject);

  const calculations = useMemo(() => {
    if (loading) {
      return null;
    }
    return calculate_detailed_program_spending_split_from_finance_data(
      subject,
      finance_data,
      { text_maker }
    );
  }, [loading, subject, finance_data]);

  if (loading) {
    return <LeafSpinner config_name="subroute" />;
  }

  if (!calculations) {
    return null;
  }

  const {
    text_calculations,
    flat_data,
    higher_level_mapping,
    top_3_so_nums,
    processed_spending_data,
    program_footnotes,
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
      allowOverflow={true}
      {...{
        title,
        sources,
        datasets,
        footnotes: [...footnotes, ...program_footnotes],
      }}
    >
      <div className="medium-panel-text">
        <TM
          k={"dept_historical_program_spending_text"}
          args={text_calculations}
        />
      </div>
      <div>
        <div>
          <HistoricalProgramBars
            data={_.map(processed_spending_data, ({ label, data }, ix) => ({
              label,
              data,
              id: `${ix}-${label}`,
            }))}
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
};

export const declare_detailed_program_spending_split_panel = () =>
  declare_panel({
    panel_key: "detailed_program_spending_split",
    subject_types: ["dept"],
    panel_config_func: () => ({
      get_dataset_keys: () => ["program_standard_objects", "program_spending"],
      get_title: () => text_maker("detailed_program_spending_split_title"),
      calculate: () => true,
      render: (props) => <DetailedProgramSpendingSplitContainer {...props} />,
    }),
  });
