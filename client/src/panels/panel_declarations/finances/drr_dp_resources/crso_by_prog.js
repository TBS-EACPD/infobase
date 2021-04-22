import { sum } from "d3-array";
import _ from "lodash";
import React from "react";

import {
  get_planned_fte_source_link,
  get_planned_spending_source_link,
  declare_panel,
} from "src/panels/panel_declarations/common_panel_utils.js";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel.js";

import { create_text_maker_component } from "src/components/index.js";

import { run_template } from "src/models/text.js";
import { year_templates } from "src/models/years.js";

import { infobase_colors } from "src/core/color_schemes.js";
import { is_a11y_mode } from "src/core/injected_build_constants";

import { StandardLegend } from "src/charts/legends/index.js";

import { WrappedNivoBar } from "src/charts/wrapped_nivo/index.js";

import { toggle_list } from "src/general_utils.js";

import text from "./crso_by_prog.yaml";

const { planning_years } = year_templates;
const { text_maker, TM } = create_text_maker_component(text);

const render_resource_type = (is_fte) => ({
  title,
  calculations,
  footnotes,
}) => {
  const { panel_args, subject } = calculations;

  const sources = [
    is_fte
      ? get_planned_fte_source_link(subject)
      : get_planned_spending_source_link(subject),
  ];

  const { exp_data, fte_data } = panel_args;

  //use hacky side-effects to create colors for all programs, so that these colours are consitent accross the fte/$ panel
  const all_program_names = _.chain(exp_data).map("label").uniq().value();
  const colors = infobase_colors();
  _.each(all_program_names, (name) => colors(name));

  const first_year_program_count = _.chain(exp_data)
    .zip(fte_data)
    .filter(
      ([{ data: exp_data }, { data: fte_data }]) =>
        exp_data[0] !== 0 || fte_data[0] !== 0
    )
    .value().length;

  const text = (
    <TM
      k="crso_by_prog_exp_or_ftes"
      args={{
        subject,
        first_year_program_count,
        is_fte: is_fte,
        ...panel_args,
      }}
    />
  );

  return (
    <InfographicPanel {...{ title, sources, footnotes }}>
      <PlannedProgramResources
        programs={_.sortBy(
          is_fte ? fte_data : exp_data,
          ({ data }) => -sum(data)
        )}
        colors={colors}
        text={text}
        is_fte={is_fte}
      />
    </InfographicPanel>
  );
};

class PlannedProgramResources extends React.Component {
  constructor(props) {
    super(props);
    const program_labels = _.map(props.programs, "label");
    this.state = {
      active_programs: is_a11y_mode
        ? program_labels
        : _.take(program_labels, 3),
    };
  }
  render() {
    const { text, programs, colors, is_fte } = this.props;

    const ticks = _.map(planning_years, run_template);

    const { active_programs } = this.state;

    const graph_data = _.chain(programs)
      .filter(({ label }) => _.includes(active_programs, label))
      .map(({ label, data }) => [label, data])
      .fromPairs()
      .value();

    //have to have an empty string in key to make sure
    //that negative bars will be displayed
    const data_by_year = _.map(ticks, (year, year_index) => ({
      year,
      ..._.chain(graph_data)
        .map((data, label) => [label, data[year_index]])
        .fromPairs()
        .value(),
    }));

    return (
      <div>
        <div className="medium-panel-text mrgn-bttm-lg">{text}</div>
        <div className="row">
          {!is_a11y_mode && (
            <div className="col-12 col-lg-4" style={{ width: "100%" }}>
              <StandardLegend
                items={_.map(programs, ({ label }) => ({
                  label,
                  id: label,
                  active: _.includes(active_programs, label),
                  color: colors(label),
                }))}
                onClick={(id) => {
                  !(
                    active_programs.length === 1 && active_programs.includes(id)
                  ) &&
                    this.setState({
                      active_programs: toggle_list(active_programs, id),
                    });
                }}
              />
            </div>
          )}
          <div className="col-12 col-lg-8">
            <WrappedNivoBar
              data={data_by_year}
              keys={Object.keys(graph_data)}
              indexBy="year"
              colors={(d) => colors(d.id)}
              is_money={!is_fte}
            />
          </div>
        </div>
      </div>
    );
  }
}

const get_calculate_func = (is_fte) => {
  return function (subject) {
    if (subject.is_dead) {
      return false;
    }

    const { programSpending, programFtes } = this.tables;

    const total_exp = _.sumBy(planning_years, (col) =>
      programSpending.q(subject).sum(col)
    );
    const total_fte = _.sumBy(planning_years, (col) =>
      programFtes.q(subject).sum(col)
    );

    const should_bail = is_fte ? total_fte === 0 : total_exp === 0;
    if (should_bail) {
      return false;
    }

    /* 
      Both exp and fte data is returned in either case so the render can ensure consistency in the association of colour to program names
      across the two panels
    */
    const exp_data = _.map(programSpending.q(subject).data, (row) => ({
      label: row.prgm,
      data: planning_years.map((col) => row[col]),
    }));
    const fte_data = _.map(programFtes.q(subject).data, (row) => ({
      label: row.prgm,
      data: planning_years.map((col) => row[col]),
    }));

    const relevant_data = is_fte ? fte_data : exp_data;
    const first_year_top_2_programs = _.chain(relevant_data)
      .sortBy(({ data }) => _.first(data))
      .takeRight(2)
      .reverse()
      .value();

    return {
      fte_data,
      exp_data,
      ..._.chain(first_year_top_2_programs)
        .flatMap(({ label, data }, ix) => [
          [`first_year_top_${ix + 1}_name`, label],
          [`first_year_top_${ix + 1}_value`, _.first(data)],
        ])
        .fromPairs()
        .value(),
    };
  };
};

export const declare_crso_by_prog_fte_panel = () =>
  declare_panel({
    panel_key: "crso_by_prog_fte",
    levels: ["crso"],
    panel_config_func: (level, panel_key) => ({
      footnotes: ["PLANNED_EXP"],
      depends_on: ["programSpending", "programFtes"],
      title: text_maker("crso_by_prog_fte_title"),
      calculate: get_calculate_func(true),
      render: render_resource_type(true),
    }),
  });
export const declare_crso_by_prog_exp_panel = () =>
  declare_panel({
    panel_key: "crso_by_prog_exp",
    levels: ["crso"],
    panel_config_func: (level, panel_key) => ({
      footnotes: ["PLANNED_EXP"],
      depends_on: ["programSpending", "programFtes"],
      title: text_maker("crso_by_prog_exp_title"),
      calculate: get_calculate_func(false),
      render: render_resource_type(false),
    }),
  });
