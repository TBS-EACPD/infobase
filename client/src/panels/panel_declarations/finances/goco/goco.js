import { scaleOrdinal } from "d3-scale";
import _ from "lodash";
import React, { Fragment } from "react";

import { TspanLineWrapper } from "src/panels/panel_declarations/common_panel_components.js";
import { declare_panel } from "src/panels/panel_declarations/common_panel_utils.js";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel.js";

import {
  create_text_maker_component,
  SmartDisplayTable,
} from "src/components/index.js";

import { GraphOverlay } from "src/components/index.js";

import { Subject } from "src/models/subject.js";

import { textColor } from "src/core/color_defs.js";
import { newIBCategoryColors } from "src/core/color_schemes.js";
import { is_a11y_mode } from "src/core/injected_build_constants.js";
import { Table } from "src/core/TableClass.js";

import { StandardLegend } from "src/charts/legends/index.js";
import { get_formatter } from "src/charts/shared.js";
import { WrappedNivoBar } from "src/charts/wrapped_nivo/index.js";

import text from "./goco.yaml";

const { Tag } = Subject;

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
    const {
      child_graph,
      clicked_spending,
      clicked_fte,
      clicked_id,
    } = this.state;
    const programSpending = Table.lookup("programSpending");
    const programFtes = Table.lookup("programFtes");
    const spend_col = "{{pa_last_year}}exp";
    const fte_col = "{{pa_last_year}}";
    const series_labels = [text_maker("spending"), text_maker("ftes")];
    const sa_text = text_maker("spending_area");
    const spending_text = text_maker("spending");
    const ftes_text = text_maker("ftes");

    let graph_content;

    const colors = scaleOrdinal().range(newIBCategoryColors);

    const total_fte_spend = _.reduce(
      Tag.gocos_by_spendarea,
      (result, sa) => {
        result[sa.id] = _.reduce(
          sa.children_tags,
          (child_result, goco) => {
            child_result.total_child_spending =
              child_result.total_child_spending +
              programSpending.q(goco).sum(spend_col);
            child_result.total_child_ftes =
              child_result.total_child_ftes + programFtes.q(goco).sum(fte_col);
            return child_result;
          },
          {
            total_child_spending: 0,
            total_child_ftes: 0,
          }
        );
        result.total_spending =
          result.total_spending + result[sa.id].total_child_spending;
        result.total_ftes = result.total_ftes + result[sa.id].total_child_ftes;
        return result;
      },
      {
        total_spending: 0,
        total_ftes: 0,
      }
    );

    const graph_data = _.chain(Tag.gocos_by_spendarea)
      .map((sa) => {
        const children = _.map(sa.children_tags, (goco) => {
          const actual_spending = programSpending.q(goco).sum(spend_col);
          const actual_ftes = programFtes.q(goco).sum(fte_col);
          return {
            label: goco.name,
            actual_spending: actual_spending || 0,
            actual_ftes: actual_ftes || 0,
            [spending_text]:
              actual_spending / total_fte_spend[sa.id].total_child_spending ||
              0,
            [ftes_text]:
              actual_ftes / total_fte_spend[sa.id].total_child_ftes || 0,
          };
        });
        return {
          label: sa.name,
          actual_spending: total_fte_spend[sa.id].total_child_spending || 0,
          actual_ftes: total_fte_spend[sa.id].total_child_ftes || 0,
          [spending_text]:
            total_fte_spend[sa.id].total_child_spending /
              total_fte_spend.total_spending || 0,
          [ftes_text]:
            total_fte_spend[sa.id].total_child_ftes /
              total_fte_spend.total_ftes || 0,
          children: _.sortBy(children, (d) => -d[spending_text]),
        };
      })
      .sortBy((d) => -d[spending_text])
      .value();

    const spend_table_formatter = get_formatter(true, undefined, true, false);
    const fte_table_formatter = get_formatter(false, undefined, true, false);

    const parent_table_data = _.map(Tag.gocos_by_spendarea, (sa) => ({
      [sa_text]: sa.name,
      [spending_text]: total_fte_spend[sa.id].total_child_spending,
      [ftes_text]: total_fte_spend[sa.id].total_child_ftes,
    }));
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
      <SmartDisplayTable
        data={parent_table_data}
        column_configs={table_column_configs}
      />
    );

    const child_tables = _.map(Tag.gocos_by_spendarea, (sa) => {
      const child_table_data = _.map(sa.children_tags, (goco) => ({
        [sa_text]: goco.name,
        [spending_text]: programSpending.q(goco).sum(spend_col),
        [ftes_text]: programFtes.q(goco).sum(fte_col),
      }));
      return {
        key: sa.name,
        table: (
          <SmartDisplayTable
            data={child_table_data}
            column_configs={table_column_configs}
          />
        ),
      };
    });

    const maxSpending = _.maxBy(graph_data, spending_text);
    const spend_fte_text_data = {
      ...total_fte_spend,
      max_sa: maxSpending.label,
      max_sa_share:
        maxSpending.actual_spending / total_fte_spend.total_spending,
    };

    if (is_a11y_mode) {
      graph_content = (
        <Fragment>
          {custom_table}
          {_.map(child_tables, ({ table, key }) => (
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
        label: (d) => format_value(d),
        label_format: (d) => <tspan y={-10}>{d}</tspan>,
        tooltip: (slice) => (
          <div style={{ color: textColor }}>
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

      const tick_map = _.reduce(
        Tag.gocos_by_spendarea,
        (final_result, sa) => {
          const sa_href_result = _.reduce(
            sa.children_tags,
            (child_result, goco) => {
              child_result[`${goco.name}`] = `#orgs/tag/${goco.id}/infograph`;
              return child_result;
            },
            {}
          );
          return _.assignIn(sa_href_result, final_result);
        },
        {}
      );

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
                _.find(child_tables, ["key", node.indexValue]).table
              }
              onMouseEnter={(child_node, e) =>
                handleHover(child_node, e.target, node.data.children)
              }
              onMouseLeave={(child_node, e) =>
                handleHover(child_node, e.target, node.data.children)
              }
              onClick={(child_node, e) =>
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
              items={legend_items}
              isHorizontal={true}
              LegendCheckBoxProps={{ isSolidBox: true }}
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

function render({ footnotes, sources, glossary_keys }) {
  return (
    <InfographicPanel
      title={text_maker("gocographic_title")}
      {...{ sources, footnotes, glossary_keys }}
    >
      <Goco />
    </InfographicPanel>
  );
}

export const declare_gocographic_panel = () =>
  declare_panel({
    panel_key: "gocographic",
    levels: ["gov"],
    panel_config_func: (level, panel_key) => ({
      depends_on: ["programSpending", "programFtes"],
      footnotes: ["GOCO"],
      glossary_keys: ["GOCO"],
      render,
    }),
  });
