import _ from "lodash";
import React from "react";
import MediaQuery from "react-responsive";

import {
  get_planned_fte_source_link,
  get_planned_spending_source_link,
  declare_panel,
} from "src/panels/panel_declarations/common_panel_utils";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";

import { create_text_maker_component } from "src/components/index";

import { run_template } from "src/models/text";
import { year_templates, actual_to_planned_gap_year } from "src/models/years";

import { infobase_colors } from "src/core/color_schemes";
import { is_a11y_mode } from "src/core/injected_build_constants";

import { StandardLegend } from "src/charts/legends/index";

import { WrappedNivoBar } from "src/charts/wrapped_nivo/index";

import { toggle_list } from "src/general_utils";
import {
  minExtraLargeDevice,
  maxExtraLargeDevice,
  minLargeDevice,
  maxLargeDevice,
  minMediumDevice,
  maxMediumDevice,
  minSmallDevice,
  maxSmallDevice,
  minExtraSmallDevice,
  maxExtraSmallDevice,
  tertiaryColor,
} from "src/style_constants/index";

import text from "./crso_by_prog.yaml";

const { planning_years, std_years } = year_templates;

const { text_maker, TM } = create_text_maker_component(text);

const render_resource_type =
  (is_fte) =>
  ({ title, calculations, footnotes }) => {
    const { panel_args, subject } = calculations;

    const sources = [
      is_fte
        ? get_planned_fte_source_link(subject)
        : get_planned_spending_source_link(subject),
    ];

    const {
      exp_data,
      fte_data,
      fte_years,
      exp_years,
      exp_gap_year,
      fte_gap_year,
    } = panel_args;

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
          years_with_gap_year={is_fte ? fte_years : exp_years}
          programs={_.sortBy(is_fte ? fte_data : exp_data, "label")}
          colors={colors}
          text={text}
          gap_year={is_fte ? fte_gap_year : exp_gap_year}
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
    const { text, programs, colors, is_fte, years_with_gap_year, gap_year } =
      this.props;
    const ticks = _.map(years_with_gap_year, run_template);

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
    const get_nivo_bar_graph = (gap_year_marker_x_px) => (
      <WrappedNivoBar
        {...{
          ...nivo_props,
          ...(gap_year && {
            markers: [
              {
                axis: "x",
                value: gap_year,
                lineStyle: {
                  stroke: tertiaryColor,
                  transform: `translate(${gap_year_marker_x_px}px, 0px)`,
                  strokeWidth: 2,
                  strokeDasharray: "3, 3",
                },
              },
            ],
          }),
        }}
      />
    );

    const nivo_props = {
      data: data_by_year,
      padding: 0.3,
      keys: Object.keys(graph_data),
      indexBy: "year",
      colors: (d) => colors(d.id),
      is_money: !is_fte,
    };

    return (
      <div>
        <div className="medium-panel-text mrgn-bttm-lg">{text}</div>
        <div className="row">
          {!is_a11y_mode && (
            <div className="col-12 col-lg-4" style={{ width: "100%" }}>
              <StandardLegend
                legendListProps={{
                  items: _.map(programs, ({ label }) => ({
                    label,
                    id: label,
                    active: _.includes(active_programs, label),
                    color: colors(label),
                  })),
                  onClick: (id) => {
                    !(
                      active_programs.length === 1 &&
                      active_programs.includes(id)
                    ) &&
                      this.setState({
                        active_programs: toggle_list(active_programs, id),
                      });
                  },
                }}
              />
            </div>
          )}
          <div className="col-12 col-lg-8">
            <MediaQuery minWidth={minExtraLargeDevice}>
              {get_nivo_bar_graph(34)}
            </MediaQuery>
            <MediaQuery
              minWidth={minLargeDevice}
              maxWidth={maxExtraLargeDevice}
            >
              {get_nivo_bar_graph(27)}
            </MediaQuery>
            <MediaQuery minWidth={minMediumDevice} maxWidth={maxLargeDevice}>
              {get_nivo_bar_graph(31)}
            </MediaQuery>
            <MediaQuery minWidth={minSmallDevice} maxWidth={maxMediumDevice}>
              {get_nivo_bar_graph(22)}
            </MediaQuery>
            <MediaQuery
              minWidth={minExtraSmallDevice}
              maxWidth={maxSmallDevice}
            >
              {get_nivo_bar_graph(17)}
            </MediaQuery>
            <MediaQuery maxWidth={maxExtraSmallDevice}>
              {get_nivo_bar_graph(9)}
            </MediaQuery>
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

    const queried_exp = programSpending.q(subject);
    const queried_fte = programFtes.q(subject);
    const get_valid_years_for_data = (data, years) =>
      _.chain(data)
        .reduce(
          (sum_by_year, row) => {
            _.each(years, (year) => {
              sum_by_year[year] = sum_by_year[year] + row[year];
            });
            return sum_by_year;
          },
          _.chain(years)
            .map((year) => [year, 0])
            .fromPairs()
            .value()
        )
        .pickBy((sum_by_year) => sum_by_year !== 0)
        .keys()
        .value();
    const exp_historical_years = get_valid_years_for_data(
      queried_exp.data,
      _.map(std_years, (year) => `${year}exp`)
    );
    const exp_planning_years = get_valid_years_for_data(
      queried_exp.data,
      planning_years
    );
    const fte_historical_years = get_valid_years_for_data(
      queried_fte.data,
      std_years
    );
    const fte_planning_years = get_valid_years_for_data(
      queried_fte.data,
      planning_years
    );
    const exp_gap_year_exists =
      subject.has_planned_spending &&
      _.includes(exp_historical_years, "{{pa_last_year}}exp") &&
      _.includes(exp_planning_years, "{{planning_year_1}}");
    const fte_gap_year_exists =
      subject.has_planned_spending &&
      _.includes(fte_historical_years, "{{pa_last_year}}") &&
      _.includes(fte_planning_years, "{{planning_year_1}}");

    const exp_gap_year =
      (exp_gap_year_exists && actual_to_planned_gap_year) || null;
    const fte_gap_year =
      (fte_gap_year_exists && actual_to_planned_gap_year) || null;

    const exp_years_with_gap_year = _.chain(exp_historical_years)
      .concat([exp_gap_year], planning_years)
      .compact()
      .value();
    const fte_years_with_gap_year = _.chain(fte_historical_years)
      .concat([fte_gap_year], planning_years)
      .compact()
      .value();

    const total_exp = _.sumBy(exp_years_with_gap_year, (col) =>
      queried_exp.sum(col)
    );
    const total_fte = _.sumBy(fte_years_with_gap_year, (col) =>
      queried_fte.sum(col)
    );

    const should_bail = is_fte ? total_fte === 0 : total_exp === 0;
    if (should_bail) {
      return false;
    }

    /* 
      Both exp and fte data is returned in either case so the render can ensure consistency in the association of colour to program names
      across the two panels
    */
    const exp_data = _.map(queried_exp.data, (row) => ({
      label: row.prgm,
      data: exp_years_with_gap_year.map((col) =>
        _.isUndefined(row[col]) ? null : row[col]
      ),
    }));
    const fte_data = _.map(queried_fte.data, (row) => ({
      label: row.prgm,
      data: fte_years_with_gap_year.map((col) =>
        _.isUndefined(row[col]) ? null : row[col]
      ),
    }));

    const relevant_data = is_fte ? queried_fte.data : queried_exp.data;
    const valid_most_recent_year = is_fte
      ? _.last(fte_historical_years)
      : _.last(exp_historical_years);

    const most_recent_top_2_programs = _.chain(relevant_data)
      .flatMap((program_data) => ({
        prgm: program_data.prgm,
        value: program_data[valid_most_recent_year],
      }))
      .sortBy("value")
      .takeRight(2)
      .reverse()
      .value();
    const first_planning_year_top_2_programs = _.chain(relevant_data)
      .flatMap((program_data) => ({
        prgm: program_data.prgm,
        value: program_data["{{planning_year_1}}"],
      }))
      .sortBy("value")
      .takeRight(2)
      .reverse()
      .value();

    return {
      fte_data,
      exp_data,
      exp_years: _.map(exp_years_with_gap_year, (year) =>
        _.replace(year, "exp", "")
      ),
      fte_years: fte_years_with_gap_year,
      exp_gap_year,
      fte_gap_year,
      most_recent_number_of_programs: _.filter(
        relevant_data,
        valid_most_recent_year
      ).length,
      first_planning_year_number_of_programs: _.filter(
        relevant_data,
        "{{planning_year_1}}"
      ).length,
      ..._.chain(most_recent_top_2_programs)
        .flatMap(({ prgm, value }, ix) => [
          [`most_recent_top_${ix + 1}_name`, prgm],
          [`most_recent_top_${ix + 1}_value`, value],
        ])
        .fromPairs()
        .value(),
      ..._.chain(first_planning_year_top_2_programs)
        .flatMap(({ prgm, value }, ix) => [
          [`first_planning_year_top_${ix + 1}_name`, prgm],
          [`first_planning_year_top_${ix + 1}_value`, value],
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
      footnotes: ["PLANNED_FTE", "FTE"],
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
      footnotes: ["PLANNED_EXP", "EXP"],
      depends_on: ["programSpending", "programFtes"],
      title: text_maker("crso_by_prog_exp_title"),
      calculate: get_calculate_func(false),
      render: render_resource_type(false),
    }),
  });
