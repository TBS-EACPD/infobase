import { scaleOrdinal } from "d3-scale";
import _ from "lodash";
import React, { Fragment, useMemo } from "react";

import { TspanLineWrapper } from "src/panels/panel_declarations/common_panel_components";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import {
  create_text_maker_component,
  DisplayTable,
  GraphOverlay,
  LeafSpinner,
} from "src/components/index";

import { calculate_gocographic_from_finance_data } from "src/models/finances/goco_calculations";
import { useWelcomeMatFinanceData } from "src/models/finances/useWelcomeMatFinanceData";

import { newIBCategoryColors } from "src/core/color_schemes";
import { get_formatter } from "src/core/format";
import { is_a11y_mode } from "src/core/injected_build_constants";

import { StandardLegend } from "src/charts/legends/index";
import { WrappedNivoBar } from "src/charts/wrapped_nivo/index";
import { textColor, backgroundColor } from "src/style_constants/index";

import text from "./goco.yaml";

const { text_maker, TM } = create_text_maker_component(text);

class Goco extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      child_graph: false,
      clicked_spending: false,
      clicked_fte: false,
      clicked_id: false,
    };
  }
  render() {
    const { child_graph, clicked_spending, clicked_fte, clicked_id } =
      this.state;
    const {
      graph_data,
      spend_fte_text_data,
      tick_map,
      parent_table_data,
      child_tables,
      spending_text,
      ftes_text,
    } = this.props.calculations;

    const series_labels = [spending_text, ftes_text];
    const sa_text = text_maker("spending_area");

    let graph_content;

    const colors = scaleOrdinal().range(newIBCategoryColors);

    const spend_table_formatter = get_formatter(true, undefined, true, false);
    const fte_table_formatter = get_formatter(false, undefined, true, false);

    const table_column_configs = {
      [sa_text]: {
        index: 0,
        header: sa_text,
        is_searchable: true,
      },
      [spending_text]: {
        index: 1,
        header: spending_text,
        formatter: (value) => spend_table_formatter(value),
      },
      [ftes_text]: {
        index: 2,
        header: ftes_text,
        formatter: (value) => fte_table_formatter(value),
      },
    };

    const custom_table = (
      <DisplayTable
        data={parent_table_data}
        column_configs={table_column_configs}
      />
    );

    const child_tables_with_display = _.map(child_tables, ({ key, data }) => ({
      key,
      table: <DisplayTable data={data} column_configs={table_column_configs} />,
    }));

    if (is_a11y_mode) {
      graph_content = (
        <Fragment>
          {custom_table}
          {_.map(child_tables_with_display, ({ table, key }) => (
            <Fragment key={key}>
              <span style={{ fontWeight: 700 }}>{key}</span>
              {table}
            </Fragment>
          ))}
        </Fragment>
      );
    } else {
      const legend_items = _.map(series_labels, (label) => {
        return {
          id: label,
          label: label,
          color: colors(label),
        };
      });

      const format_value = (d) => {
        const is_spending = d.id === spending_text;

        const value = is_spending ? d.data.actual_spending : d.data.actual_ftes;
        return get_formatter(is_spending)(value || 0);
      };

      const nivo_default_props = {
        indexBy: "label",
        animate: false,
        remove_left_axis: true,
        enableLabel: true,
        enableGridX: false,
        enableGridY: false,
        label: (d) => <tspan y={-10}>{format_value(d)}</tspan>,
        tooltip: (slice) => (
          <div
            style={{
              color: textColor,
              padding: "5px",
              backgroundColor: backgroundColor,
              borderRadius: "10px",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {slice.map((tooltip_item) => (
                  <tr key={tooltip_item.id}>
                    <td className="nivo-tooltip__icon">
                      <div
                        style={{
                          height: "12px",
                          width: "12px",
                          backgroundColor: tooltip_item.color,
                        }}
                      />
                    </td>
                    <td className="nivo-tooltip__label">{tooltip_item.id}</td>
                    <td
                      className="nivo-tooltip__value"
                      dangerouslySetInnerHTML={{
                        __html: format_value(tooltip_item),
                      }}
                    />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ),
        padding: 0.1,
        colors: (d) => colors(d.id),
        keys: series_labels,
        groupMode: "grouped",
        width: 200,
        height: 400,
        margin: {
          top: 20,
          right: 0,
          bottom: 45,
          left: 0,
        },
      };

      const toggleOpacity = (element) => {
        const current_opacity = element.style.opacity;
        element.style.opacity =
          current_opacity === "1" || !current_opacity ? 0.4 : 1;
      };

      const generate_index_map = (data) => {
        let hoverIndex = 0;
        const hover_index_spending = _.map(data, (row) => {
          if (row[spending_text] > 0) {
            return hoverIndex++;
          }
        });
        const hover_index_ftes = _.map(data, (row) => {
          if (row[ftes_text] > 0) {
            return hoverIndex++;
          }
        });
        return _.zipObject(
          _.map(data, "label"),
          _.zip(hover_index_spending, hover_index_ftes)
        );
      };

      const handleHover = (node, targetElement, data) => {
        targetElement.style.cursor = "pointer";
        const allGroupedElements = targetElement.parentNode.parentNode;
        const childrenGroupedElements = _.map(
          _.drop(allGroupedElements.childNodes),
          _.identity
        );

        const hover_index_map = generate_index_map(data);

        const target_spending =
          childrenGroupedElements[hover_index_map[node.indexValue][0]];
        const target_fte =
          childrenGroupedElements[hover_index_map[node.indexValue][1]];
        if (
          !_.isEqual(target_spending, clicked_spending) &&
          !_.isEqual(target_fte, clicked_fte)
        ) {
          target_spending && toggleOpacity(target_spending);
          target_fte && toggleOpacity(target_fte);
          _.forEach(
            allGroupedElements.parentNode.querySelectorAll("text"),
            (textElement) => {
              const currentText = textElement.textContent.replace(/\s+/g, "");
              const target_text = node.indexValue.replace(/\s+/g, "");
              const spending_text =
                target_spending &&
                target_spending
                  .getElementsByTagName("text")[0]
                  .textContent.replace(/\s+/g, "");
              const fte_text =
                target_fte &&
                target_fte
                  .getElementsByTagName("text")[0]
                  .textContent.replace(/\s+/g, "");
              if (
                currentText === target_text ||
                currentText === spending_text ||
                currentText === fte_text
              ) {
                toggleOpacity(textElement);
                return;
              }
            }
          );
        }
      };

      const handleClick = (node, targetElement, data) => {
        const allGroupedElements = targetElement.parentNode.parentNode;
        const childrenGroupedElements = _.map(
          _.drop(allGroupedElements.childNodes),
          _.identity
        );

        const click_index_map = generate_index_map(data);
        const target_spending =
          childrenGroupedElements[click_index_map[node.indexValue][0]];
        const target_fte =
          childrenGroupedElements[click_index_map[node.indexValue][1]];

        _.forEach(childrenGroupedElements, (element) => {
          element.style.opacity = 0.4;
        });
        _.forEach(
          allGroupedElements.parentNode.querySelectorAll("text"),
          (textElement) => {
            const currentText = textElement.textContent.replace(/\s+/g, "");
            const target_text = node.indexValue.replace(/\s+/g, "");

            const spending_text =
              target_spending &&
              target_spending
                .getElementsByTagName("text")[0]
                .textContent.replace(/\s+/g, "");
            const fte_text =
              target_fte &&
              target_fte
                .getElementsByTagName("text")[0]
                .textContent.replace(/\s+/g, "");
            textElement.style.opacity =
              currentText === target_text ||
              currentText === spending_text ||
              currentText === fte_text
                ? 1
                : 0.4;
          }
        );
        target_spending && toggleOpacity(target_spending);
        target_fte && toggleOpacity(target_fte);

        const child_graph = (
          <Fragment>
            <h3 style={{ textAlign: "center" }}>{node.indexValue}</h3>
            <WrappedNivoBar
              {...nivo_default_props}
              data={node.data.children}
              custom_table={
                _.find(child_tables_with_display, ["key", node.indexValue])
                  .table
              }
              onMouseEnter={(child_node, e) =>
                handleHover(child_node, e.target, node.data.children)
              }
              onMouseLeave={(child_node, e) =>
                handleHover(child_node, e.target, node.data.children)
              }
              onClick={(child_node) =>
                window.open(tick_map[child_node.indexValue], "_blank")
              }
              graph_height="500px"
              bttm_axis={{
                renderTick: (tick) => {
                  return (
                    <g
                      key={tick.tickIndex}
                      transform={`translate(${tick.x},${tick.y + 16})`}
                    >
                      <a
                        href={tick_map[tick.value]}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <text
                          textAnchor="middle"
                          dominantBaseline="middle"
                          style={{
                            fontSize: "12px",
                          }}
                        >
                          <TspanLineWrapper text={tick.value} width={20} />
                        </text>
                      </a>
                    </g>
                  );
                },
              }}
            />
          </Fragment>
        );
        this.setState({
          child_graph: child_graph,
          clicked_spending: target_spending,
          clicked_fte: target_fte,
          clicked_id: node.indexValue,
        });
      };

      graph_content = (
        <Fragment>
          <div
            className="centerer mrgn-bttm-md"
            style={{ padding: "10px 25px 10px 25px" }}
          >
            <StandardLegend
              legendListProps={{
                items: legend_items,
                isHorizontal: true,
                checkBoxProps: { isSolidBox: true },
              }}
            />
          </div>
          <div>
            <GraphOverlay>
              <WrappedNivoBar
                {...nivo_default_props}
                data={graph_data}
                custom_table={custom_table}
                onMouseEnter={(node, e) =>
                  handleHover(node, e.target, graph_data)
                }
                onMouseLeave={(node, e) =>
                  handleHover(node, e.target, graph_data)
                }
                onClick={(node, e) => handleClick(node, e.target, graph_data)}
                bttm_axis={{
                  renderTick: (tick) => {
                    return (
                      <g
                        key={tick.tickIndex}
                        transform={`translate(${tick.x},${tick.y + 16})`}
                      >
                        <text
                          textAnchor="middle"
                          dominantBaseline="middle"
                          style={{
                            fontSize: "12px",
                            opacity:
                              !clicked_id || clicked_id === tick.value
                                ? 1
                                : 0.4,
                          }}
                        >
                          <TspanLineWrapper text={tick.value} width={15} />
                        </text>
                      </g>
                    );
                  },
                }}
              />
            </GraphOverlay>
          </div>
        </Fragment>
      );
    }
    return (
      <Fragment>
        <div className="medium-panel-text">
          <TM k="goco_intro_text" args={spend_fte_text_data} />
        </div>
        {graph_content}
        {child_graph && <div style={{ paddingBottom: 30 }}>{child_graph}</div>}
      </Fragment>
    );
  }
}

const GocographicContainer = (props) => {
  const { subject } = props;
  const { loading, finance_data } = useWelcomeMatFinanceData(subject);

  const spending_text = text_maker("spending");
  const ftes_text = text_maker("ftes");
  const sa_text = text_maker("spending_area");

  const calculations = useMemo(() => {
    if (loading) {
      return null;
    }
    return calculate_gocographic_from_finance_data(finance_data, {
      spending_text,
      ftes_text,
      sa_text,
    });
  }, [loading, finance_data, spending_text, ftes_text, sa_text]);

  if (loading) {
    return <LeafSpinner config_name="subroute" />;
  }

  if (!calculations) {
    return null;
  }

  return (
    <InfographicPanel {...props}>
      <Goco calculations={calculations} />
    </InfographicPanel>
  );
};

export const declare_gocographic_panel = () =>
  declare_panel({
    panel_key: "gocographic",
    subject_types: ["gov"],
    panel_config_func: () => ({
      get_dataset_keys: () => ["program_spending", "program_ftes"],
      get_title: () => text_maker("gocographic_title"),
      glossary_keys: ["GOCO"],
      calculate: () => true,
      render: (props) => <GocographicContainer {...props} />,
    }),
  });
