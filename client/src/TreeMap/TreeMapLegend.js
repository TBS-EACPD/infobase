import _ from "lodash";
import React, { Fragment } from "react";

import { create_text_maker } from "src/models/text.js";

import { backgroundColor } from "src/core/color_defs.ts";

import { formats } from "src/core/format.ts";

import treemap_text from "./TreeMap.yaml";
import "./TreeMap.scss";

const text_maker = create_text_maker([treemap_text]);

const size_controls = {
  drf: text_maker("expenditures_lower"),
  drf_ftes: text_maker("fte"),
  tp: text_maker("SOBJ10_lower"),
  vote_stat: text_maker("expenditures_lower"),
  so: text_maker("expenditures_lower"),
};

const proportional_block = () => (
  <svg width="70" height="70">
    <g transform="translate(5,5)">
      <rect
        className="mutLegendBG"
        fill="white"
        stroke="black"
        strokeWidth="2"
        width="60"
        height="60"
      />
      <rect
        className="mutLegendBG"
        fill="white"
        stroke="black"
        strokeWidth="2"
        width="30"
        height="30"
      />
      <text
        className="breakLabels"
        x="25"
        y="25"
        style={{ textAnchor: "end", display: "block" }}
      >
        {`${formats.big_int_raw(25)}`}
      </text>
      <text
        className="breakLabels"
        x="55"
        y="55"
        style={{ textAnchor: "end", display: "block" }}
      >
        {`${formats.big_int_raw(100)}`}
      </text>
    </g>
  </svg>
);

const legend_block = (val, col, ix) => (
  <g
    key={ix}
    className="legendCells"
    transform={`translate(${ix * 60 + 10},5)`}
  >
    <rect
      className="breakRect"
      height="25"
      width="60"
      fill={col}
      stroke="black"
    />
    {val && (
      <text
        className="breakLabels"
        x="0"
        y="40"
        style={{ textAnchor: "middle", display: "block" }}
      >
        {val}
      </text>
    )}
  </g>
);

export class TreeMapLegend extends React.Component {
  constructor() {
    super();
  }
  render() {
    const { perspective, legend_cols, legend_measure_text } = this.props;
    return (
      <Fragment>
        <div
          className="row"
          style={{ marginLeft: "0px", marginRight: "0px", width: "100%" }}
        >
          <div className="col-md-5">
            <div
              className="row"
              style={{ marginLeft: "0px", marginRight: "0px" }}
            >
              <div
                className="col-md-4"
                style={{ textAlign: "center", paddingRight: "0px" }}
              >
                {proportional_block()}
              </div>
              <div className="col-md-8">
                {`${text_maker("treemap_legend_text")} ${
                  size_controls[perspective]
                }.`}
              </div>
            </div>
          </div>
          <div className="col-md-7">
            <div style={{ textAlign: "center" }}>
              <svg width={`${legend_cols.length * 60 + 10}`} height="50">
                <g className="mutLegendGroup" transform="translate(0,0)">
                  <rect
                    className="mutLegendBG"
                    fill={backgroundColor}
                    stroke="none"
                    width="500"
                    height="50"
                  />
                  {_.map(legend_cols, (o, ix) => {
                    return legend_block(o.val, o.col, ix);
                  })}
                </g>
              </svg>
            </div>
            <div style={{ textAlign: "center" }}>
              <span style={{ paddingTop: "40px", paddingBottom: "40px" }}>
                {legend_measure_text}
              </span>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}
