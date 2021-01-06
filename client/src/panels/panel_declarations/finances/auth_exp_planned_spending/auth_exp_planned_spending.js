import { scaleOrdinal } from "d3-scale";
import _ from "lodash";
import React, { Fragment } from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils.js";
import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel.js";

import {
  HeightClipper,
  create_text_maker_component,
  Details,
  GraphOverlay,
} from "src/components/index.js";

import FootNote from "src/models/footnotes/footnotes.js";
import { run_template } from "src/models/text.js";
import {
  year_templates,
  actual_to_planned_gap_year,
} from "src/models/years.js";

import {
  tertiaryColor,
  textColor,
  highlightColor,
} from "src/core/color_defs.ts";
import { newIBCategoryColors } from "src/core/color_schemes.ts";
import { is_a11y_mode } from "src/core/injected_build_constants.ts";

import { StandardLegend, SelectAllControl } from "src/charts/legends/index.js";
import { WrappedNivoLine } from "src/charts/wrapped_nivo/index.js";

import text from "./auth_exp_planned_spending.yaml";
import "./auth_exp_planned_spending.scss";

const { std_years, planning_years, estimates_years } = year_templates;
const { text_maker, TM } = create_text_maker_component(text);
const colors = scaleOrdinal().range(newIBCategoryColors);

const auth_cols = _.map(std_years, (yr) => `${yr}auth`);
const exp_cols = _.map(std_years, (yr) => `${yr}exp`);
const flat_auth_exp_years = _.flatMap(["exp", "auth", "unlapsed"], (type) =>
  _.map(std_years, (yr) => `${yr}${type}`)
);

const include_verbose_gap_year_explanation = false;

const calculate_lapse = (auth, exp, unlapsed, is_pct = false) => {
  const lapse = auth - exp - unlapsed;
  return is_pct ? lapse / auth || 0 : lapse;
};
const get_auth_exp_diff = ([larger_data_point, smaller_data_point]) =>
  Math.abs(larger_data_point.data.y - smaller_data_point.data.y);
const auth_exp_planned_spending_tooltip = ({ slice }, tooltip_formatter) => {
  const null_filtered_slice_data = _.filter(
    slice.points,
    ({ data }) => !_.isNull(data.y)
  );

  return (
    <div
      className="auth-exp-planned-spend-tooltip"
      style={{ color: textColor }}
    >
      <table className="auth-exp-planned-spend-tooltip__table">
        <tbody>
          {null_filtered_slice_data.map((tooltip_item) => (
            <tr key={tooltip_item.serieId}>
              <td>
                <div
                  style={{
                    backgroundColor: tooltip_item.serieColor,
                    height: "12px",
                    width: "12px",
                  }}
                />
              </td>
              <td>{tooltip_item.serieId}</td>
              <td
                dangerouslySetInnerHTML={{
                  __html: tooltip_formatter(tooltip_item.data.y),
                }}
              />
            </tr>
          ))}
          {null_filtered_slice_data.length > 1 ? (
            <tr>
              <td />
              <td>{text_maker("difference")}</td>
              <td
                style={{
                  color: highlightColor,
                }}
                dangerouslySetInnerHTML={{
                  __html: tooltip_formatter(
                    get_auth_exp_diff(null_filtered_slice_data)
                  ),
                }}
              />
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
};
class AuthExpPlannedSpendingGraph extends React.Component {
  constructor(props) {
    super(props);

    const active_series = _.chain(props.data_series)
      .map(({ key, values }) => [key, _.some(values)])
      .fromPairs()
      .value();

    this.state = { active_series };
  }
  render() {
    const { data_series, gap_year } = this.props;
    const { active_series } = this.state;

    const has_multiple_active_series =
      _.chain(active_series).values().compact().value().length > 1;

    const legend_items = _.map(data_series, ({ key, label }) => ({
      id: label,
      label: label,
      active: active_series[key],
      color: colors(label),
    }));

    const graph_data = _.chain(data_series)
      .filter(({ key }) => active_series[key])
      .flatMap(({ key, label, years, values }) => [
        gap_year &&
          key === "planned_spending" &&
          has_multiple_active_series && {
            id: "gap-year",
            data: [
              {
                x: gap_year,
                y: null,
              },
            ],
          },
        {
          id: label,
          data: _.chain(years)
            .zip(values)
            .map(([year, value]) => ({
              x: year,
              y: value,
            }))
            .value(),
        },
      ])
      .compact()
      .value();

    const should_mark_gap_year =
      gap_year &&
      active_series.budgetary_expenditures &&
      !active_series.authorities && // authorities always span the gap year, so don't mark it when displaying them
      active_series.planned_spending;

    const nivo_props = {
      data: graph_data,
      raw_data: _.flatMap(data_series, "values"),
      colors: (d) => colors(d.id),
      magnify_glass_translateX: 80,
      magnify_glass_translateY: 70,
      tooltip: auth_exp_planned_spending_tooltip,
      margin: {
        top: 10,
        right: 30,
        bottom: 40,
        left: 100,
      },
      table_ordered_column_keys: _.map(
        ["authorities", "budgetary_expenditures", "planned_spending"],
        (key) => text_maker(key)
      ),
      ...(should_mark_gap_year && {
        markers: [
          {
            axis: "x",
            value: gap_year,
            lineStyle: {
              stroke: tertiaryColor,
              strokeWidth: 2,
              strokeDasharray: "3, 3",
            },
          },
        ],
      }),
    };

    return (
      <Fragment>
        <div style={{ padding: "10px 25px 0px 97px" }}>
          {!is_a11y_mode && (
            <StandardLegend
              isHorizontal={true}
              items={legend_items}
              onClick={(label) => {
                const key_corresponding_to_label = _.find(data_series, {
                  label,
                }).key;

                this.setState({
                  active_series: {
                    ...active_series,
                    [key_corresponding_to_label]:
                      !active_series[key_corresponding_to_label] ||
                      !has_multiple_active_series,
                  },
                });
              }}
            />
          )}
        </div>

        <GraphOverlay>
          <WrappedNivoLine {...nivo_props} />
        </GraphOverlay>
      </Fragment>
    );
  }
}
class LapseByVotesGraph extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      is_showing_lapse_pct: false,
      active_votes: this.get_active_votes(
        ({ votestattype }) =>
          props.subject.level === "gov" ||
          votestattype === 1 ||
          votestattype === 2 ||
          votestattype === 3
      ),
    };
  }
  get_active_votes = (func) =>
    _.chain(this.props.queried_votes)
      .map((vote_row) => [vote_row.desc, func(vote_row)])
      .fromPairs()
      .value();

  render() {
    const { subject, queried_votes, additional_info } = this.props;
    const { active_votes, is_showing_lapse_pct } = this.state;
    const filtered_votes = _.reject(
      queried_votes,
      ({ desc }) => !active_votes[desc]
    );

    const get_lapse_raw_data = (is_pct, votes = filtered_votes) =>
      _.flatMap(votes, (vote_row) =>
        _.map(std_years, (yr) =>
          calculate_lapse(
            vote_row[`${yr}auth`],
            vote_row[`${yr}exp`],
            vote_row[`${yr}unlapsed`],
            is_pct
          )
        )
      );
    const lapsed_by_votes_sum = _.sum(get_lapse_raw_data(false, queried_votes));
    const avg_lapsed_by_votes_pct = _.chain(queried_votes)
      .reduce(
        (result, vote_row) => ({
          ..._.chain(flat_auth_exp_years)
            .map((yr) => [yr, result[yr] + vote_row[yr]])
            .fromPairs()
            .value(),
        }),
        _.chain(flat_auth_exp_years)
          .map((yr) => [yr, 0])
          .fromPairs()
          .value()
      )
      .thru((vote) =>
        _.map(std_years, (yr) => {
          const lapse_pct =
            calculate_lapse(
              vote[`${yr}auth`],
              vote[`${yr}exp`],
              vote[`${yr}unlapsed`]
            ) / vote[`${yr}auth`];
          return _.isNaN(lapse_pct) ? 0 : lapse_pct;
        })
      )
      .mean()
      .value();

    const nivo_pct_props = is_showing_lapse_pct && {
      is_money: false,
      left_axis: { format: formats.smart_percentage2_raw },
      text_formatter: formats.smart_percentage2,
    };

    const lapse_infograph = (
      <div style={{ padding: "5px" }} className="frow">
        <TM
          className="medium-panel-text"
          k={
            subject.is("gov")
              ? "gov_lapse_by_votes_text"
              : "dept_lapse_by_votes_text"
          }
          args={{
            subject,
            avg_lapsed_by_votes: lapsed_by_votes_sum / std_years.length,
            num_of_votes: queried_votes.length,
            avg_lapsed_by_votes_pct,
            gov_avg_lapsed_by_votes_pct:
              additional_info.gov_avg_lapsed_by_votes_pct,
          }}
        />
        {!subject.is("gov") && (
          <div className="fcol-md-4">
            <StandardLegend
              items={_.map(queried_votes, ({ desc }) => ({
                id: desc,
                label: desc,
                active: active_votes[desc],
                color: colors(desc),
              }))}
              onClick={(vote_desc) =>
                this.setState({
                  active_votes: {
                    ...active_votes,
                    [vote_desc]: !active_votes[vote_desc],
                  },
                })
              }
              Controls={[
                <SelectAllControl
                  key="SelectAllControl"
                  SelectAllOnClick={() =>
                    this.setState({
                      active_votes: this.get_active_votes(() => true),
                    })
                  }
                  SelectNoneOnClick={() =>
                    this.setState({
                      active_votes: this.get_active_votes(() => false),
                    })
                  }
                />,
                <button
                  key="LapseToggleControl"
                  onClick={() =>
                    this.setState({
                      is_showing_lapse_pct: !is_showing_lapse_pct,
                    })
                  }
                  className="btn-ib-primary"
                >
                  Show lapsed authority in {is_showing_lapse_pct ? "$" : "%"}
                </button>,
              ]}
            />
          </div>
        )}
        <div className={`fcol-md-${subject.is("gov") ? 12 : 8}`}>
          <WrappedNivoLine
            data={_.chain(filtered_votes)
              .map((vote_row) => ({
                id: vote_row.desc,
                data: _.map(std_years, (yr) => ({
                  x: run_template(yr),
                  y: calculate_lapse(
                    vote_row[`${yr}auth`],
                    vote_row[`${yr}exp`],
                    vote_row[`${yr}unlapsed`],
                    is_showing_lapse_pct
                  ),
                })),
              }))
              .reverse()
              .value()}
            raw_data={get_lapse_raw_data(is_showing_lapse_pct)}
            colorBy={(d) => colors(d.id)}
            margin={{
              top: 10,
              right: 30,
              bottom: 50,
              left: 70,
            }}
            custom_table={
              <SmartDisplayTable
                unsorted_initial={true}
                column_configs={{
                  id: {
                    index: 0,
                    header: text_maker("vote"),
                  },
                  ..._.chain(std_years)
                    .map((yr, i) => [
                      run_template(yr),
                      {
                        index: i + 1,
                        header: run_template(yr),
                        is_summable: !is_showing_lapse_pct,
                        formatter: is_showing_lapse_pct
                          ? "smart_percentage2"
                          : "compact2_written",
                      },
                    ])
                    .fromPairs()
                    .value(),
                }}
                data={_.map(filtered_votes, (vote_row) => ({
                  id: vote_row.desc,
                  ..._.chain(std_years)
                    .map((yr) => [
                      run_template(yr),
                      calculate_lapse(
                        vote_row[`${yr}auth`],
                        vote_row[`${yr}exp`],
                        vote_row[`${yr}unlapsed`],
                        is_showing_lapse_pct
                      ),
                    ])
                    .fromPairs()
                    .value(),
                }))}
              />
            }
            {...nivo_pct_props}
          />
        </div>
      </div>
    );

    return (
      <div>
        <TM
          el="h4"
          k={subject.is("gov") ? "aggregated_lapse_by_votes" : "lapse_by_votes"}
          args={{ lapse_unit: is_showing_lapse_pct ? "%" : "$" }}
          style={{ textAlign: "center" }}
        />
        <HeightClipper clipHeight={200}>{lapse_infograph}</HeightClipper>
      </div>
    );
  }
}
const render = function ({ calculations, footnotes, sources, glossary_keys }) {
  const { panel_args, subject } = calculations;
  const { data_series, additional_info, queried_votes } = panel_args;

  const final_info = {
    ...additional_info,
    dept: subject,
  };
  footnotes = _.concat(
    new FootNote({
      subject,
      text: text_maker("actual_spending_footnote"),
      topic_keys: ["EXP"],
    }),
    footnotes
  );

  return (
    <InfographicPanel
      containerAlign={subject.has_planned_spending ? "top" : "middle"}
      title={text_maker("auth_exp_planned_spending_title", final_info)}
      {...{ footnotes, sources, glossary_keys }}
    >
      <div className="frow">
        <div className="fcol-md-4">
          <TM
            className="medium-panel-text"
            k={`${subject.level}_auth_exp_planned_spending_body`}
            args={final_info}
          />
          {include_verbose_gap_year_explanation && additional_info.gap_year && (
            <div className="auth-gap-details">
              <Details
                summary_content={
                  <TM k={"gap_explain_title"} args={final_info} />
                }
                content={
                  <TM
                    k={`${subject.level}_gap_explain_body`}
                    args={final_info}
                  />
                }
              />
            </div>
          )}
        </div>
        <div className="fcol-md-8">
          <AuthExpPlannedSpendingGraph
            data_series={data_series}
            gap_year={additional_info.gap_year}
          />
        </div>
      </div>
      <div className="panel-separator" />
      <LapseByVotesGraph
        subject={subject}
        queried_votes={queried_votes}
        additional_info={additional_info}
      />
    </InfographicPanel>
  );
};

const calculate = function (subject, options) {
  const { orgVoteStatPa, programSpending, orgVoteStatEstimates } = this.tables;

  const query_subject = subject.is("gov") ? undefined : subject;
  const gov_queried_subject = orgVoteStatPa.q();
  const queried_subject = orgVoteStatPa.q(query_subject);

  const exp_values = queried_subject.sum(exp_cols, { as_object: false });

  const history_years_written = _.map(std_years, run_template);
  const future_auth_year_templates = _.takeRightWhile(
    estimates_years,
    (est_year) => !_.includes(history_years_written, run_template(est_year))
  );

  const historical_auth_values = queried_subject.sum(auth_cols, {
    as_object: false,
  });
  const future_auth_values = _.map(
    future_auth_year_templates,
    (future_auth_year_template) =>
      orgVoteStatEstimates
        .q(query_subject)
        .sum(`${future_auth_year_template}_estimates`, { as_object: false })
  );

  const auth_values = _.concat(historical_auth_values, future_auth_values);

  const planned_spending_values = programSpending
    .q(query_subject)
    .sum(planning_years, { as_object: false });

  const data_series = _.chain([
    {
      key: "budgetary_expenditures",
      untrimmed_year_templates: std_years,
      untrimmed_values: exp_values,
    },
    {
      key: "authorities",
      untrimmed_year_templates: _.concat(std_years, future_auth_year_templates),
      untrimmed_values: auth_values,
    },
    subject.has_planned_spending && {
      key: "planned_spending",
      untrimmed_year_templates: planning_years,
      untrimmed_values: planned_spending_values,
      year_templates: planning_years,
      values: planned_spending_values,
    },
  ])
    .compact()
    .map((series) => {
      const { year_templates, values } = (() => {
        if (series.year_templates && series.values) {
          return series;
        } else {
          const [trimmed_year_templates, trimmed_values] = _.chain(
            series.untrimmed_year_templates
          )
            .zip(series.untrimmed_values)
            .dropWhile(([year_template, value]) => !value)
            .unzip()
            .value();

          return {
            year_templates: trimmed_year_templates,
            values: trimmed_values,
          };
        }
      })();

      return {
        ...series,

        year_templates,
        values,

        years: _.map(year_templates, run_template),
        label: text_maker(series.key),
      };
    })
    .value();

  const last_shared_index = _.min([exp_values.length, auth_values.length]) - 1;

  const hist_unspent_avg_pct =
    _.reduce(
      exp_values,
      (result, value, i) => result + auth_values[i] - value,
      0
    ) /
    _.reduce(
      auth_values,
      (result, value, index) =>
        index <= last_shared_index ? result + value : result,
      0
    );

  const unspent_last_year =
    auth_values[last_shared_index] - exp_values[last_shared_index];

  const get_five_year_auth_average = (auth_or_exp) =>
    _.chain(std_years)
      .map((year) => orgVoteStatPa.q(query_subject).sum([year + auth_or_exp]))
      .sum()
      .divide(std_years.length)
      .value();

  const gov_stat_filtered_votes = _.reject(
    gov_queried_subject.data,
    ({ votenum }) => votenum === "S"
  );
  const gov_aggregated_votes = _.reduce(
    gov_stat_filtered_votes,
    (result, vote_row) => ({
      ..._.chain(flat_auth_exp_years)
        .map((yr) => [yr, result[yr] + vote_row[yr]])
        .fromPairs()
        .value(),
    }),
    _.chain(flat_auth_exp_years)
      .map((yr) => [yr, 0])
      .fromPairs()
      .value()
  );
  const queried_votes = subject.is("gov")
    ? [
        {
          desc: text_maker("aggregated_lapse_by_votes"),
          ...gov_aggregated_votes,
        },
      ]
    : _.reject(queried_subject.data, ({ votenum }) => votenum === "S");

  const gov_avg_lapsed_by_votes_pct = _.chain(std_years)
    .map(
      (yr) =>
        calculate_lapse(
          gov_aggregated_votes[`${yr}auth`],
          gov_aggregated_votes[`${yr}exp`],
          gov_aggregated_votes[`${yr}unlapsed`]
        ) / gov_aggregated_votes[`${yr}auth`]
    )
    .mean()
    .value();

  const additional_info = {
    five_year_auth_average: get_five_year_auth_average("auth"),
    five_year_exp_average: get_five_year_auth_average("exp"),
    has_planned_spending: subject.has_planned_spending,
    last_planned_spending: _.last(planned_spending_values),
    last_planned_year: run_template(_.last(planning_years)),
    plan_change: _.last(planned_spending_values) - _.last(exp_values),
    last_history_year: run_template(_.last(std_years)),
    gap_year:
      (subject.has_planned_spending && actual_to_planned_gap_year) || null,
    hist_avg_tot_pct: hist_unspent_avg_pct,
    last_year_lapse_amt: unspent_last_year || 0,
    last_year_lapse_pct:
      (unspent_last_year || 0) / auth_values[last_shared_index],
    gov_avg_lapsed_by_votes_pct,
  };

  return {
    data_series,
    additional_info,
    queried_votes,
  };
};

export const declare_auth_exp_planned_spending_panel = () =>
  declare_panel({
    panel_key: "auth_exp_planned_spending",
    levels: ["gov", "dept"],
    panel_config_func: (level, panel_key) => ({
      depends_on: ["orgVoteStatPa", "programSpending", "orgVoteStatEstimates"],
      glossary_keys: ["BUD_EXP", "NB_EXP"],
      title: (subject) =>
        text_maker("auth_exp_planned_spending_title", {
          has_planned_spending: subject.has_planned_spending,
        }),
      calculate,
      render,
    }),
  });
