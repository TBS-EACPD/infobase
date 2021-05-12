import classNames from "classnames";
import _ from "lodash";
import React, { Fragment } from "react";

import { run_template, create_text_maker } from "src/models/text";

import treemap_text from "./TreeMap.yaml";
import "./TreeMap.scss";

const text_maker = create_text_maker([treemap_text]);

const all_years = [
  "pa_last_year_5",
  "pa_last_year_4",
  "pa_last_year_3",
  "pa_last_year_2",
  "pa_last_year",
  "planning_year_1",
  "planning_year_2",
  "planning_year_3",
];

const all_year_changes = [
  "pa_last_year_5:pa_last_year_4",
  "pa_last_year_4:pa_last_year_3",
  "pa_last_year_3:pa_last_year_2",
  "pa_last_year_2:pa_last_year",
];

const year_to_year_changes = {
  pa_last_year_5: "pa_last_year_5:pa_last_year_4",
  pa_last_year_4: "pa_last_year_4:pa_last_year_3",
  pa_last_year_3: "pa_last_year_3:pa_last_year_2",
  pa_last_year_2: "pa_last_year_2:pa_last_year",
  pa_last_year: "pa_last_year",
  planning_year_1: "pa_last_year",
  planning_year_2: "pa_last_year",
  planning_year_3: "pa_last_year",
};

const year_changes = {
  drf: all_year_changes,
  drf_ftes: all_year_changes,
  tp: all_year_changes,
  vote_stat: all_year_changes.slice(0, 4),
  so: all_year_changes.slice(2, 4),
};

const years = {
  drf: all_years,
  drf_ftes: all_years,
  tp: all_years.slice(0, 5),
  vote_stat: all_years.slice(0, 5),
  so: all_years.slice(2, 5),
};

const size_controls = [
  { id: "drf", display: text_maker("DRF_spending") },
  { id: "drf_ftes", display: text_maker("treemap_fte") },
  { id: "tp", display: text_maker("TP") },
  { id: "vote_stat", display: text_maker("EVS") },
  { id: "so", display: text_maker("SO") },
];
const color_controls = [
  { id: "spending", display: text_maker("spending") },
  { id: "ftes", display: text_maker("fte") },
];

const gc_type_controls = [
  { id: "All", display: text_maker("all") },
  { id: "g", display: text_maker("grants") },
  { id: "c", display: text_maker("contributions") },
];

const vs_type_controls = [
  { id: "All", display: text_maker("all") },
  { id: "1", display: text_maker("vstype1") },
  { id: "2", display: text_maker("vstype2") },
  { id: "3", display: text_maker("vstype3") },
  //{ id: "4", display: text_maker("vstype4") },
  //{ id: "5", display: text_maker("vstype5") },
  //{ id: "6", display: text_maker("vstype6") },
  //{ id: "9", display: text_maker("vstype9") }, // Other
  { id: "999", display: text_maker("treemap_vstype999") },
];

const so_type_controls = [
  { id: "All", display: text_maker("all") },
  { id: "1", display: text_maker("op_spending") },
  { id: "2", display: text_maker("capital_spending") },
  { id: "10", display: text_maker("SOBJ10") },
  { id: "11", display: text_maker("SOBJ11") },
  { id: "12", display: text_maker("SOBJ12") },
  { id: "3", display: text_maker("revenues") },
];

function create_new_path(cur_params, new_param, new_val) {
  let new_perspective = cur_params.perspective; // default
  let new_color_var = cur_params.color_var;
  let new_filter_var = cur_params.filter_var;
  let new_year = cur_params.year;
  let new_get_changes = cur_params.get_changes || "";
  switch (new_param) {
    case "perspective":
      new_perspective = new_val;
      new_filter_var = "All";
      if (new_val === "drf_ftes") new_color_var = "ftes";
      if (new_val !== "drf" && new_val !== "drf_ftes")
        new_color_var = "spending";
      break;
    case "color_var":
      new_color_var = new_val;
      break;
    case "filter_var":
      new_filter_var = new_val;
      break;
    case "year":
      new_year = new_val;
      break;
    case "get_changes":
      new_val ? (new_get_changes = new_val) : (new_get_changes = "");
      new_val
        ? (new_year = year_to_year_changes[cur_params.year])
        : (new_year = cur_params.year.split(":")[0]);
      break;
  }
  const new_path = `/treemap/${new_perspective}/${new_color_var}/${new_filter_var}/${new_year}/${new_get_changes}`;
  return new_path;
}

export class TreeMapControls extends React.Component {
  constructor() {
    super();
  }

  handle_click(key, value) {
    const {
      perspective,
      color_var,
      year,
      filter_var,
      get_changes,
      location,
      history,
    } = this.props;
    const new_path = create_new_path(
      { perspective, color_var, year, get_changes, filter_var },
      key,
      value
    );
    if (location.pathname !== new_path) {
      history.push(new_path);
    }
  }

  render() {
    const {
      perspective,
      color_var,
      year,
      filter_var,
      get_changes,
    } = this.props;
    return (
      <div className="treemap-controls">
        <TreeMapLabeledBox label={text_maker("treemap_display_value_label")}>
          <div className="cent">
            <TreeMapRadioButtons
              options={_.map(size_controls, ({ id, display }) => ({
                id,
                display,
                active: id === perspective,
              }))}
              onChange={(id) => {
                this.handle_click("perspective", id);
              }}
            />
          </div>
        </TreeMapLabeledBox>
        <TreeMapLabeledBox label={text_maker("year_format")}>
          <div className="cent">
            <TreeMapRadioButtons
              options={[
                {
                  id: "single_year",
                  active: !get_changes,
                  display: text_maker("single_year"),
                },
                {
                  id: "year_changes",
                  active: get_changes,
                  display: text_maker("year_changes"),
                },
              ]}
              onChange={(id) => {
                this.handle_click("get_changes", id === "year_changes");
              }}
            />
          </div>
        </TreeMapLabeledBox>
        <TreeMapLabeledBox label={text_maker("year")}>
          <div className="cent">
            <TreeMapRadioButtons
              options={
                get_changes
                  ? _.map(year_changes[perspective], (id) => ({
                      id,
                      display: `${run_template(
                        "{{" + id.split(":")[0] + "}}"
                      )} ${text_maker("to")} ${run_template(
                        "{{" + id.split(":")[1] + "}}"
                      )}`,
                      active: id === year,
                    }))
                  : _.map(years[perspective], (id) => ({
                      id,
                      display: run_template("{{" + id + "}}"),
                      active: id === year,
                    }))
              }
              onChange={(id) => {
                this.handle_click("year", id);
              }}
            />
          </div>
        </TreeMapLabeledBox>
        {perspective === "tp" && (
          <TreeMapLabeledBox label={text_maker("treemap_gc_type_filter")}>
            <div className="cent">
              <TreeMapRadioButtons
                options={_.map(gc_type_controls, ({ id, display }) => ({
                  id,
                  display,
                  active: (!filter_var && id === "All") || id === filter_var,
                }))}
                onChange={(id) => {
                  this.handle_click("filter_var", id);
                }}
              />
            </div>
          </TreeMapLabeledBox>
        )}
        {(perspective === "drf" || perspective === "drf_ftes") && (
          <TreeMapLabeledBox label={text_maker("treemap_color_by_label")}>
            <div className="cent">
              <TreeMapRadioButtons
                options={_.map(color_controls, ({ id, display }) => ({
                  id,
                  display,
                  active: id === color_var,
                }))}
                onChange={(id) => {
                  this.handle_click("color_var", id);
                }}
              />
            </div>
          </TreeMapLabeledBox>
        )}
        {perspective === "vote_stat" && (
          <TreeMapLabeledBox label={text_maker("treemap_vstype_filter")}>
            <div className="cent">
              <Fragment>
                <TreeMapRadioButtons
                  options={_.map(vs_type_controls, ({ id, display }) => ({
                    id,
                    display,
                    active: (!filter_var && id === "All") || id === filter_var,
                  }))}
                  onChange={(id) => {
                    this.handle_click("filter_var", id);
                  }}
                />
              </Fragment>
            </div>
          </TreeMapLabeledBox>
        )}
        {perspective === "so" && (
          <TreeMapLabeledBox label={text_maker("treemap_so_filter")}>
            <div className="cent">
              <TreeMapRadioButtons
                options={_.map(so_type_controls, ({ id, display }) => ({
                  id,
                  display,
                  active: (!filter_var && id === "All") || id === filter_var,
                }))}
                onChange={(id) => {
                  this.handle_click("filter_var", id);
                }}
              />
            </div>
          </TreeMapLabeledBox>
        )}
      </div>
    );
  }
}

class TreeMapLabeledBox extends React.Component {
  render() {
    const { label, children } = this.props;

    return (
      <div className="treemap-labeled-box">
        <div className="treemap-labeled-box-label ">
          <div className="treemap-labeled-box-label-text ">{label}</div>
        </div>
        <div className="treemap-labeled-box-content">{children}</div>
      </div>
    );
  }
}

const TreeMapRadioButtons = ({ options, onChange }) => (
  <div className="treemap-options">
    {options.map(({ display, id, active }) => (
      <button
        key={id}
        aria-pressed={!!active}
        className={classNames(
          "treemap-options__option",
          active && "treemap-options__option--active"
        )}
        onClick={() => {
          onChange(id);
        }}
      >
        {display}
      </button>
    ))}
  </div>
);
