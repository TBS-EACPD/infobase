import { sum } from "d3-array";
import { scaleOrdinal } from "d3-scale";
import _ from "lodash";
import React, { useMemo } from "react";

import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import {
  DisplayTable,
  GraphOverlay,
  LeafSpinner,
  SelectAllControl,
} from "src/components/index";

import { calculate_spend_by_so_hist_from_finance_data } from "src/models/finances/sobj_calculations";
import { useOrgSobjsFinanceData } from "src/models/finances/useOrgSobjsFinanceData";

import { run_template } from "src/models/text";
import { year_templates } from "src/models/years";

import {
  newIBLightCategoryColors,
  newIBDarkCategoryColors,
} from "src/core/color_schemes";

import { is_a11y_mode } from "src/core/injected_build_constants";

import { StandardLegend } from "src/charts/legends/index";

import { WrappedNivoLine } from "src/charts/wrapped_nivo/index";

import { toggle_list } from "src/general_utils";

import { text_maker, TM } from "./sobj_text_provider";

const { std_years } = year_templates;
const years = _.map(std_years, run_template);

const get_custom_table = (data, active_sobjs) => {
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
          formatter: "compact2_written",
        },
      ])
      .fromPairs()
      .value(),
  };
  return (
    <DisplayTable data={custom_table_data} column_configs={column_configs} />
  );
};

class SobjLine extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active_sobjs: [_.first(props.data).label],
    };
    this.colors = scaleOrdinal().range(
      _.concat(newIBLightCategoryColors, newIBDarkCategoryColors)
    );
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
      }))
    );

    const graph_series = _.chain(data)
      .filter(({ label }) => _.includes(active_sobjs, label))
      .map(({ label, data }) => [label, data])
      .fromPairs()
      .value();

    const raw_data = _.flatMap(graph_series, (value) => value);

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

    const get_line_graph = (() => {
      const is_data_empty = _.isEmpty(spending_data) && _.isEmpty(raw_data);
      const max_y = _.chain(data)
        .map((row) => _.max(row.data))
        .max()
        .value();
      const empty_data_nivo_props = is_data_empty && {
        data: [
          {
            id: "none",
            data: _.map(years, (year) => ({
              x: year,
              y: max_y,
            })),
          },
        ],
        raw_data: [max_y],
        enablePoints: false,
        lineWidth: 0,
        isInteractive: false,
      };

      const nivo_props = {
        data: spending_data.reverse(),
        raw_data: raw_data,
        margin: {
          top: 10,
          right: 30,
          bottom: 90,
          left: 70,
        },
        graph_height: "500px",
        colors: (d) => colors(d.id),
        custom_table: get_custom_table(data, active_sobjs),
        ...empty_data_nivo_props,
      };

      return (
        <GraphOverlay>
          <WrappedNivoLine {...nivo_props} />
        </GraphOverlay>
      );
    })();

    return (
      <div className="row">
        <div className="col-12 col-lg-4">
          <StandardLegend
            legendListProps={{
              items: legend_items,
              onClick: (id) => {
                !(
                  spending_data.length === 1 &&
                  spending_data.map((o) => o.id).includes(id)
                ) &&
                  this.setState({
                    active_sobjs: toggle_list(active_sobjs, id),
                  });
              },
            }}
            Controls={
              <SelectAllControl
                key="SelectAllControl"
                SelectAllOnClick={() =>
                  this.setState({ active_sobjs: all_labels })
                }
                SelectNoneOnClick={() => this.setState({ active_sobjs: [] })}
              />
            }
          />
        </div>
        <div
          className="col-12 col-lg-8"
          style={{ position: "relative", marginTop: "10px" }}
        >
          {get_line_graph}
        </div>
      </div>
    );
  }
}

const SpendBySoHistContainer = (props) => {
  const { subject } = props;
  const { loading, finance_data } = useOrgSobjsFinanceData(subject);

  const calculations = useMemo(() => {
    if (loading) {
      return null;
    }
    return calculate_spend_by_so_hist_from_finance_data(subject, finance_data);
  }, [loading, subject, finance_data]);

  if (loading) {
    return <LeafSpinner config_name="subroute" />;
  }

  if (!calculations) {
    return null;
  }

  const { data, text_calculations } = calculations;
  const graph_content = is_a11y_mode ? (
    get_custom_table(data, _.map(data, "label"))
  ) : (
    <SobjLine data={data} />
  );

  return (
    <InfographicPanel
      {...props}
      title={text_maker("dept_fin_spend_by_so_hist_title")}
    >
      <div className="medium-panel-text">
        <TM k="dept_fin_spend_by_so_hist_text" args={text_calculations} />
      </div>
      <div>{graph_content}</div>
    </InfographicPanel>
  );
};

export const declare_spend_by_so_hist_panel = () =>
  declare_panel({
    panel_key: "spend_by_so_hist",
    subject_types: ["dept"],
    panel_config_func: () => ({
      get_dataset_keys: () => ["org_standard_objects"],
      get_topic_keys: ({ derived_topic_keys }) => {
        return [...derived_topic_keys, "5YEAR_TREND", "AVG_SOBJ"];
      },
      get_title: () => text_maker("dept_fin_spend_by_so_hist_title"),
      calculate: () => true,
      render: (props) => <SpendBySoHistContainer {...props} />,
    }),
  });
