import { select } from "d3-selection";
import _ from "lodash";
import React, { Fragment } from "react";

import ReactDOM from "react-dom";

import {
  create_text_maker_component,
  GraphOverlay,
  Select,
} from "src/components/index.js";

import { businessConstants } from "src/models/businessConstants";
import { run_template } from "src/models/text.js";

import { secondaryColor, tertiaryColor } from "src/core/color_defs.js";

import { StandardLegend } from "src/charts/legends/index.js";
import { WrappedNivoHBar } from "src/charts/wrapped_nivo/index.js";

import { hex_to_rgb } from "src/general_utils.js";

import { CanadaD3Component } from "./CanadaD3Component.js";

import text from "./canada.yaml";

const { text_maker } = create_text_maker_component(text);

const { provinces } = businessConstants;

const get_graph_color = (alpha) => {
  const rgb = hex_to_rgb(secondaryColor);
  return rgb && `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha || 1})`;
};

class CanadaGraphBarLegend extends React.Component {
  constructor() {
    super();
  }
  render() {
    const { prov, alt_totals_by_year, data, years, formatter } = this.props;

    const province_graph_title = (prov) =>
      text_maker("five_year_history", {
        province: prov ? provinces[prov].text : text_maker("global"),
      });

    const graph_data = _.chain(data)
      .map((data, ix) => ({
        year: run_template(years[ix]),
        value: prov
          ? data[prov]
          : alt_totals_by_year?.[ix] || _.chain(data).values().sum().value(),
      }))
      .reverse()
      .value();

    return (
      <Fragment>
        <p className="mrgn-bttm-0 mrgn-tp-0 nav-header centerer">
          {province_graph_title(prov)}
        </p>
        <WrappedNivoHBar
          data={graph_data}
          indexBy="year"
          keys={["value"]}
          enableLabel={true}
          label_format={(d) => (
            <tspan x={100} y={16}>
              {formatter(d)}
            </tspan>
          )}
          label={(d) => `${d.data.year}: ${formatter(d.value)}`}
          colors={(d) => get_graph_color(0.5)}
          margin={{
            top: 40,
            right: 30,
            bottom: 20,
            left: 20,
          }}
          graph_height="200px"
          padding={0.1}
          is_money={false}
          top_axis={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -30,
            tickValues: 4,
            format: (d) => formatter(d),
          }}
          remove_bottom_axis={true}
          remove_left_axis={true}
          add_top_axis={true}
          enableGridX={false}
          enableGridY={false}
          isInteractive={false}
          disable_table_view={true}
        />
      </Fragment>
    );
  }
}

class CanadaGraph extends React.PureComponent {
  constructor() {
    super();
    this.graph_area = React.createRef();
  }
  render() {
    return <div ref={this.graph_area} />;
  }
  componentDidMount() {
    this._render();
  }
  componentDidUpdate() {
    this._render();
  }
  _render() {
    const {
      graph_args,
      prov_select_callback,
      data,
      selected_year_index,
    } = this.props;
    const { color_scale, years, formatter } = graph_args;

    const graph_area_sel = select(
      ReactDOM.findDOMNode(this.graph_area.current)
    );

    const ticks = _.map(years, (y) => `${run_template(y)}`);

    const canada_graph = new CanadaD3Component(graph_area_sel.node(), {
      main_color: get_graph_color(1),
      secondary_color: tertiaryColor,
      selected_year_index,
      data,
      ticks,
      color_scale,
      formatter,
    });

    let active_prov = false;
    canada_graph.dispatch.on("dataMouseEnter", (prov) => {
      active_prov = true;
      prov_select_callback(prov);
    });
    canada_graph.dispatch.on("dataMouseLeave", () => {
      _.delay(() => {
        if (!active_prov) {
          prov_select_callback(null);
        }
      }, 200);
      active_prov = false;
    });

    canada_graph.render();
  }
}

export class Canada extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      prov: null,
      selected_year_index: props.graph_args.years.length - 1,
    };
  }

  prov_select_callback = (selected_prov) => {
    if (selected_prov !== this.state.prov) {
      this.setState({ prov: selected_prov });
    }
  };

  year_select_callbback = (year_index) =>
    this.setState({ selected_year_index: year_index });

  render() {
    const { prov, selected_year_index } = this.state;
    const { graph_args } = this.props;
    const {
      data,
      alt_totals_by_year,
      color_scale,
      years,
      formatter,
    } = graph_args;
    const legend_items = _.map(
      color_scale.ticks(5).reverse(),
      (tick, idx, ticks) => ({
        label:
          idx > 0
            ? `${formatter(tick)} - ${formatter(ticks[idx - 1])}`
            : `${formatter(tick)}+`,
        active: true,
        id: tick,
        color: get_graph_color(color_scale(tick)),
      })
    );
    return (
      <div className="row">
        <div className="col-12 col-lg-3">
          <StandardLegend
            title={text_maker("legend")}
            items={legend_items}
            LegendCheckBoxProps={{ isSolidBox: true }}
          />
          <div
            className="standard-legend-container"
            style={{
              maxHeight: "400px",
              width: "100%",
              overflowY: "hidden",
              marginTop: "10px",
            }}
          >
            <CanadaGraphBarLegend
              prov={prov}
              data={data}
              alt_totals_by_year={alt_totals_by_year}
              years={years}
              formatter={formatter}
            />
          </div>
        </div>
        <div className="col-12 col-lg-9" style={{ position: "relative" }}>
          {years.length > 1 && (
            <div
              style={{
                width: "100%",
                marginBottom: "10px",
                textAlign: "center",
              }}
            >
              <Select
                selected={selected_year_index}
                options={_.map(years, (year, index) => ({
                  id: index,
                  display: run_template(year),
                }))}
                onSelect={this.year_select_callbback}
                title={text_maker("select_year")}
                className={"bold"}
              />
            </div>
          )}
          <GraphOverlay>
            <CanadaGraph
              graph_args={graph_args}
              selected_year_index={selected_year_index}
              data={data}
              prov_select_callback={this.prov_select_callback}
            />
          </GraphOverlay>
        </div>
      </div>
    );
  }
}
