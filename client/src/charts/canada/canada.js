import CanadaProvinceChart, {
  getProvinceName,
  getProvinceShortName,
} from "canada-province-chart";
import { color } from "d3-color";
import { interpolateBlues } from "d3-scale-chromatic";
import _ from "lodash";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  create_text_maker_component,
  GraphOverlay,
  Select,
} from "src/components/index";

import { businessConstants } from "src/models/businessConstants";
import { run_template } from "src/models/text";

import { lang } from "src/core/injected_build_constants";

import { StandardLegend } from "src/charts/legends/index";
import { LegendContainer } from "src/charts/legends/LegendContainer";
import { WrappedNivoHBar } from "src/charts/wrapped_nivo/index";
import { useWindowWidth } from "src/general_utils";

import text from "./canada.yaml";

const { text_maker } = create_text_maker_component(text);

const { provinces } = businessConstants;

function applyOpacity(colorStr) {
  // canada-province-chart's fill-color take our provided color and applies a 0.8 opacity.
  // In order to match the color in legend, we need to apply it manually
  return color(colorStr).copy({ opacity: 0.8 }).toString();
}

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
      <LegendContainer title={province_graph_title(prov)}>
        <WrappedNivoHBar
          data={graph_data}
          indexBy="year"
          keys={["value"]}
          enableLabel={true}
          label={(d) => (
            <tspan x={100} y={16}>
              {`${d.data.year}: ${formatter(d.formattedValue)}`}
            </tspan>
          )}
          colors={(_d) => applyOpacity(interpolateBlues(0.5))}
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
      </LegendContainer>
    );
  }
}

function NewCanadaGraph({
  prov_select_callback,
  data,
  selected_year_index,
  graph_args,
}) {
  const { color_scale, formatter } = graph_args;
  const containerRef = useRef();
  const [containerWidth, setContainerWidth] = useState(null);

  const windowWidth = useWindowWidth();

  useEffect(() => {
    setContainerWidth(containerRef?.current?.offsetWidth);
  }, [windowWidth]);

  const [onMouseEnter, onMouseLeave] = useMemo(() => {
    //TODO: fix hacky closure that holds onto province
    let active_prov = false;
    function onMouseEnter(datum, provCode) {
      active_prov = true;
      prov_select_callback(provCode);
    }
    function onMouseLeave() {
      setTimeout(() => {
        if (!active_prov) {
          prov_select_callback(null);
        }
      }, 200);
      active_prov = false;
    }
    return [onMouseEnter, onMouseLeave];
  }, [prov_select_callback]);

  const singleYearData = useMemo(() => {
    const dataForYear = data[selected_year_index];
    return _.chain(dataForYear)
      .map((value, provCode) => ({ value, provCode }))
      .value();
  }, [selected_year_index, data]);

  const colorScale = useCallback(
    (datum, _provCode) => {
      if (!datum?.value) {
        return "#ccc";
      }
      return interpolateBlues(color_scale(datum.value));
    },
    [color_scale]
  );

  const htmlForLabel = useCallback(
    (datum, provCode) => {
      const getName =
        containerWidth > 800
          ? (provCode) => getProvinceName(provCode, lang)
          : (provCode) => getProvinceShortName(provCode, lang);
      if (!datum?.value) {
        return null;
      }
      return `<div>
      <div>${formatter(datum.value)}</div>
      <div>${getName(provCode)}</div>
    </div>`;
    },
    [formatter, containerWidth]
  );

  return (
    <div ref={containerRef}>
      <CanadaProvinceChart
        data={singleYearData}
        colorScale={colorScale}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        htmlForLabel={htmlForLabel}
        lang={lang}
      />
    </div>
  );
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
    const { data, alt_totals_by_year, color_scale, years, formatter } =
      graph_args;
    const legend_items = _.map(
      color_scale.ticks(5).reverse(),
      (tick, idx, ticks) => ({
        label:
          idx > 0
            ? `${formatter(tick)} - ${formatter(ticks[idx - 1])}`
            : `${formatter(tick)}+`,
        active: true,
        id: tick,
        color: applyOpacity(interpolateBlues(color_scale(tick))),
      })
    );
    return (
      <div className="row">
        <div className="col-12 col-lg-3">
          <StandardLegend
            title={text_maker("legend")}
            legendListProps={{
              items: legend_items,
              checkBoxProps: { isSolidBox: true },
            }}
          />
          <CanadaGraphBarLegend
            prov={prov}
            data={data}
            alt_totals_by_year={alt_totals_by_year}
            years={years}
            formatter={formatter}
          />
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
            <NewCanadaGraph
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
