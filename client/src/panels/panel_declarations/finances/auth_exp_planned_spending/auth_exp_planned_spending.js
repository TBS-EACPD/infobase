import { scaleOrdinal } from "d3-scale";
import _ from "lodash";
import React, { Fragment, useMemo } from "react";

import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import {
  HeightClipper,
  create_text_maker_component,
  Details,
  GraphOverlay,
  RadioButtons,
  DisplayTable,
  SelectAllControl,
  LeafSpinner,
} from "src/components/index";

import { calculate_auth_exp_planned_spending_from_finance_data } from "src/models/finances/auth_exp_planned_spending_calculations";
import {
  calculate_lapse,
  flat_auth_exp_years,
} from "src/models/finances/auth_exp_utils";
import { useAuthExpPlannedSpendingFinanceData } from "src/models/finances/useAuthExpPlannedSpendingFinanceData";
import { create_footnote } from "src/models/footnotes/footnotes";
import { run_template } from "src/models/text";
import { year_templates } from "src/models/years";

import { newIBCategoryColors } from "src/core/color_schemes";
import { formats } from "src/core/format";
import { is_a11y_mode } from "src/core/injected_build_constants";

import { StandardLegend } from "src/charts/legends/index";
import { WrappedNivoLine } from "src/charts/wrapped_nivo/index";
import {
  tertiaryColor,
  textColor,
  highlightColor,
} from "src/style_constants/index";

import text from "./auth_exp_planned_spending.yaml";
import "./auth_exp_planned_spending.scss";

const { std_years } = year_templates;
const { text_maker, TM } = create_text_maker_component(text);
const colors = scaleOrdinal().range(newIBCategoryColors);

const include_verbose_gap_year_explanation = false;
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
      active_series.budgetary_expenditures && // authorities always span the gap year, so don't mark it when displaying them
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
              legendListProps={{
                isHorizontal: true,
                items: legend_items,
                onClick: (label) => {
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
                },
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
      active_votes: this.get_active_votes(({ votestattype }) =>
        _.includes([1, 2, 3, 5], votestattype)
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
            subject.subject_type === "gov"
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
        <div
          className="fcol-md-12"
          style={{ marginBottom: "10px", textAlign: "center" }}
        >
          <RadioButtons
            options={[
              {
                id: "lapse_by_dollar",
                active: !is_showing_lapse_pct,
                display: `${text_maker("show_lapsed_authorities_in")} $`,
              },
              {
                id: "lapse_by_pct",
                active: is_showing_lapse_pct,
                display: `${text_maker("show_lapsed_authorities_in")} %`,
              },
            ]}
            onChange={(id) =>
              this.setState({ is_showing_lapse_pct: id === "lapse_by_pct" })
            }
          />
        </div>

        <div className="fcol-md-3">
          <StandardLegend
            legendListProps={{
              items: _.map(queried_votes, ({ desc }) => ({
                id: desc,
                label: desc,
                active: active_votes[desc],
                color: colors(desc),
              })),
              onClick: (vote_desc) =>
                this.setState({
                  active_votes: {
                    ...active_votes,
                    [vote_desc]: !active_votes[vote_desc],
                  },
                }),
            }}
            Controls={
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
              />
            }
          />
        </div>
        <div className="fcol-md-9">
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
            colors={(d) => colors(d.id)}
            margin={{
              top: 10,
              right: 30,
              bottom: 50,
              left: 70,
            }}
            custom_table={
              <DisplayTable
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
          k={
            subject.subject_type === "gov"
              ? "lapse_by_vote_type"
              : "lapse_by_votes"
          }
          args={{ lapse_unit: is_showing_lapse_pct ? "%" : "$" }}
          style={{ textAlign: "center" }}
        />
        <HeightClipper clipHeight={200}>{lapse_infograph}</HeightClipper>
      </div>
    );
  }
}
const render = function ({
  subject,
  calculations,
  footnotes,
  sources,
  datasets,
  glossary_keys,
}) {
  const { data_series, additional_info, queried_votes, is_special_warrants } =
    calculations;

  const final_info = {
    ...additional_info,
    dept: subject,
  };
  footnotes = _.concat(
    create_footnote({
      id: text_maker("actual_spending_footnote"),
      subject_type: subject.subject_type,
      subject_id: subject.id,
      text: text_maker("actual_spending_footnote"),
      topic_keys: ["EXP"],
    }),
    footnotes
  );

  return (
    <InfographicPanel
      containerAlign={subject.has_planned_spending ? "top" : "middle"}
      title={text_maker("auth_exp_planned_spending_title", final_info)}
      {...{ footnotes, sources, datasets, glossary_keys }}
    >
      <div className="frow middle-xs">
        <div className="fcol-xs-12 fcol-md-4">
          <TM
            className="medium-panel-text"
            k={`${subject.subject_type}_auth_exp_planned_spending_body`}
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
                    k={`${subject.subject_type}_gap_explain_body`}
                    args={final_info}
                  />
                }
              />
            </div>
          )}
          {is_special_warrants && (
            <div>
              <TM
                className="medium-panel-text"
                k="auth_special_warrants_note"
              />
            </div>
          )}
        </div>
        <div className="fcol-xs-12 fcol-md-8">
          <AuthExpPlannedSpendingGraph
            data_series={data_series}
            gap_year={additional_info.gap_year}
          />
        </div>
      </div>
      {!_.isEmpty(queried_votes) && (
        <Fragment>
          <div className="panel-separator" />
          <LapseByVotesGraph
            subject={subject}
            queried_votes={queried_votes}
            additional_info={additional_info}
          />
        </Fragment>
      )}
    </InfographicPanel>
  );
};

const AuthExpPlannedSpendingContainer = (props) => {
  const { subject } = props;
  const { loading, finance_data } =
    useAuthExpPlannedSpendingFinanceData(subject);

  const calculations = useMemo(() => {
    if (loading) {
      return null;
    }
    return calculate_auth_exp_planned_spending_from_finance_data(
      subject,
      finance_data,
      { text_maker }
    );
  }, [loading, subject, finance_data]);

  if (loading) {
    return <LeafSpinner config_name="subroute" />;
  }

  if (!calculations) {
    return null;
  }

  return render({ ...props, calculations });
};

export const declare_auth_exp_planned_spending_panel = () =>
  declare_panel({
    panel_key: "auth_exp_planned_spending",
    subject_types: ["gov", "dept"],
    panel_config_func: () => ({
      get_dataset_keys: () => [
        "org_vote_stat",
        "program_spending",
        "tabled_estimates",
      ],
      get_topic_keys: ({ derived_topic_keys }) => {
        return [...derived_topic_keys, "5YEAR_TREND", "AVG_AUTH_EXP"];
      },
      glossary_keys: ["BUD_EXP", "NB_EXP"],
      get_title: ({ subject }) =>
        text_maker("auth_exp_planned_spending_title", {
          has_planned_spending: subject.has_planned_spending,
        }),
      calculate: () => true,
      render: (props) => <AuthExpPlannedSpendingContainer {...props} />,
    }),
  });
