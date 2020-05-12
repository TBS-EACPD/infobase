import { Fragment } from "react";
import text from "./auth_exp_prog_spending.yaml";
import {
  run_template,
  year_templates,
  actual_to_planned_gap_year,
  StandardLegend,
  A11yTable,
  StdPanel,
  Col,
  create_text_maker_component,
  NivoResponsiveLine,
  newIBCategoryColors,
  util_components,
  declare_panel,
} from "../../shared.js";

const { Details } = util_components;

const { std_years, planning_years, estimates_years } = year_templates;
const { text_maker, TM } = create_text_maker_component(text);

const auth_cols = _.map(std_years, (yr) => `${yr}auth`);
const exp_cols = _.map(std_years, (yr) => `${yr}exp`);

const text_keys_by_level = {
  dept: "dept_auth_exp_prog_spending_body",
  gov: "gov_auth_exp_prog_spending_body",
};

const calculate = function (subject, info, options) {
  const { orgVoteStatPa, programSpending, orgVoteStatEstimates } = this.tables;

  const query_subject = subject.is("gov") ? undefined : subject;

  const qEst = orgVoteStatEstimates.q(query_subject);
  // wonky code below is to figure out how many extra estimates years we need, 1 or 2
  const est_extra_years =
    run_template("{{pa_last_year}}") === run_template("{{est_last_year}}")
      ? qEst.sum("{{est_in_year}}_estimates", { as_object: false })
      : run_template("{{pa_last_year}}") === run_template("{{est_last_year_2}}")
      ? [
          qEst.sum("{{est_last_year}}_estimates", { as_object: false }),
          qEst.sum("{{est_in_year}}_estimates", { as_object: false }),
        ]
      : [];

  const qAuthExp = orgVoteStatPa.q(query_subject);
  const auth = _.concat(
    qAuthExp.sum(auth_cols, { as_object: false }),
    est_extra_years
  );
  const exp = qAuthExp.sum(exp_cols, { as_object: false });

  const qProgSpending = programSpending.q(query_subject);
  const progSpending = subject.has_planned_spending
    ? qProgSpending.sum(planning_years, { as_object: false })
    : null;

  return { exp, auth, progSpending };
};

class AuthExpProgSpending extends React.Component {
  constructor(props) {
    super(props);
    const active_series = [
      text_maker("budgetary_expenditures"),
      text_maker("authorities"),
    ];
    if (props.calculations.subject.has_planned_spending) {
      active_series.push(text_maker("planned_spending"));
    }
    this.state = { active_series: active_series };
  }

  render() {
    const { calculations, footnotes, sources, glossary_keys } = this.props;
    const { active_series } = this.state;
    const { info, panel_args, subject } = calculations;
    const { exp, auth, progSpending } = panel_args;

    const series_labels = [
      text_maker("budgetary_expenditures"),
      text_maker("authorities"),
      subject.has_planned_spending ? text_maker("planned_spending") : null,
    ];

    const colors = d3.scaleOrdinal().range(newIBCategoryColors);
    const raw_data = _.concat(exp, auth, progSpending);

    const auth_ticks = _.chain(_.map(std_years, run_template))
      .concat(_.map(estimates_years, run_template))
      .uniq()
      .value();
    const exp_ticks = _.map(std_years, run_template);
    const plan_ticks = _.map(planning_years, run_template);

    const gap_year =
      (subject.has_planned_spending && actual_to_planned_gap_year) || null;

    const additional_info = {
      last_history_year: _.last(auth_ticks),
      last_planned_year: _.last(plan_ticks),
      gap_year: gap_year,
      plan_change:
        info[`${subject.level}_exp_planning_year_3`] -
        info[`${subject.level}_auth_average`],
      hist_avg_tot_pct: _.isEqual(exp, auth)
        ? 0
        : info[`${subject.level}_hist_avg_tot_pct`],
      last_year_lapse_amt:
        info[`${subject.level}_auth_pa_last_year`] -
          info[`${subject.level}_exp_pa_last_year`] || 0,
      last_year_lapse_pct:
        (info[`${subject.level}_auth_pa_last_year`] -
          info[`${subject.level}_exp_pa_last_year`] || 0) /
        info[`${subject.level}_auth_pa_last_year`],
    };

    let graph_content;
    if (window.is_a11y_mode) {
      const all_ticks = _.chain(auth_ticks)
        .concat(exp_ticks, plan_ticks)
        .uniq()
        .value();

      const data = _.map(all_ticks, (tick) => ({
        label: tick,
        data: [
          _.isNumber(auth[_.findIndex(auth_ticks, (d) => d === tick)])
            ? auth[_.findIndex(auth_ticks, (d) => d === tick)]
            : null,
          _.isNumber(exp[_.findIndex(exp_ticks, (d) => d === tick)])
            ? exp[_.findIndex(exp_ticks, (d) => d === tick)]
            : null,
          _.isNumber(progSpending[_.findIndex(plan_ticks, (d) => d === tick)])
            ? progSpending[_.findIndex(plan_ticks, (d) => d === tick)]
            : null,
        ],
      }));

      graph_content = (
        <A11yTable data_col_headers={series_labels} data={data} />
      );
    } else {
      const zip_years_and_data = (years, data) =>
        _.map(years, (year, year_ix) => {
          if (data) {
            return {
              x: year,
              y: data[year_ix],
            };
          }
        });
      const graph_data = _.chain(series_labels)
        .zip([
          zip_years_and_data(exp_ticks, exp),
          zip_years_and_data(auth_ticks, auth),
          _.compact([
            gap_year && {
              x: gap_year,
              y: null,
            },
            ...zip_years_and_data(plan_ticks, progSpending),
          ]),
        ])
        .filter((row) => !_.isNull(row[0]) && _.includes(active_series, row[0]))
        .map(([id, data]) => ({ id, data }))
        .value();

      const get_auth_exp_diff = (slice_data) =>
        Math.abs(slice_data[0].data.y - slice_data[1].data.y);

      const lineStyleById = {
        [series_labels[0]]: {
          stroke: colors(series_labels[0]),
          strokeWidth: 2.5,
        },
        [series_labels[1]]: {
          strokeDasharray: "56",
          stroke: colors(series_labels[1]),
          strokeWidth: 2.5,
        },
        [series_labels[2]]: {
          stroke: colors(series_labels[2]),
          strokeWidth: 2.5,
        },
      };

      const DashedLine = ({ lineGenerator, xScale, yScale }) => {
        return graph_data.map(({ id, data }) => {
          return (
            <path
              key={id}
              d={lineGenerator(
                data.map((d) => ({
                  x: xScale(d.x),
                  y: d.y != null ? yScale(d.y) : null,
                }))
              )}
              fill="none"
              style={lineStyleById[id]}
            />
          );
        });
      };

      const nivo_default_props = {
        data: graph_data,
        raw_data: raw_data,
        colorBy: (d) => colors(d.id),
        tooltip: (slice, tooltip_formatter) => (
          <div style={{ color: window.infobase_color_constants.textColor }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {slice.data.map((tooltip_item) => (
                  <tr key={tooltip_item.serie.id}>
                    <td className="nivo-tooltip__content">
                      <div
                        style={{
                          height: "12px",
                          width: "12px",
                          backgroundColor: tooltip_item.serie.color,
                        }}
                      />
                    </td>
                    <td className="nivo-tooltip__content">
                      {tooltip_item.serie.id}
                    </td>
                    <td
                      className="nivo-tooltip__content"
                      dangerouslySetInnerHTML={{
                        __html: tooltip_formatter(tooltip_item.data.y),
                      }}
                    />
                  </tr>
                ))}
                {slice.data.length > 1 ? (
                  <tr>
                    <td
                      className="nivo-tooltip__content"
                      style={{ height: "12px" }}
                    />
                    <td className="nivo-tooltip__content">
                      {text_maker("difference")}
                    </td>
                    <td
                      className="nivo-tooltip__content"
                      style={{
                        color: window.infobase_color_constants.highlightColor,
                      }}
                      dangerouslySetInnerHTML={{
                        __html: tooltip_formatter(
                          get_auth_exp_diff(slice.data)
                        ),
                      }}
                    />
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ),
        margin: {
          top: 10,
          right: 30,
          bottom: 40,
          left: 100,
        },
        graph_height: "400px",
        ...(_.isEqual(exp, auth) &&
          _.includes(active_series, text_maker("budgetary_expenditures")) &&
          _.includes(active_series, text_maker("authorities")) && {
            layers: [
              "grid",
              "markers",
              "areas",
              DashedLine,
              "slices",
              "dots",
              "axes",
              "legends",
            ],
          }),
        ...(gap_year &&
          _.includes(active_series, text_maker("planned_spending")) && {
            markers: [
              {
                axis: "x",
                value: gap_year,
                lineStyle: {
                  stroke: window.infobase_color_constants.tertiaryColor,
                  strokeWidth: 2,
                  strokeDasharray: "3, 3",
                },
              },
            ],
          }),
      };

      const legend_items = _.chain(series_labels)
        .map((label) => {
          return {
            id: label,
            label: label,
            active: _.includes(active_series, label),
            color: colors(label),
          };
        })
        .filter((legend_row) => !_.isNull(legend_row.id))
        .value();

      graph_content = (
        <Fragment>
          <div style={{ padding: "10px 25px 0px 97px" }}>
            <StandardLegend
              items={legend_items}
              isHorizontal={true}
              onClick={(id) => {
                !(
                  active_series.length === 1 && _.includes(active_series, id)
                ) &&
                  this.setState({
                    active_series: _.toggle_list(active_series, id),
                  });
              }}
            />
          </div>
          <div>
            <NivoResponsiveLine {...nivo_default_props} />
          </div>
        </Fragment>
      );
    }

    return (
      <StdPanel
        containerAlign={subject.has_planned_spending ? "top" : "middle"}
        title={text_maker("auth_exp_prog_spending_title", {
          ...info,
          ...additional_info,
        })}
        {...{ footnotes, sources, glossary_keys }}
      >
        <Col size={4} isText>
          <TM
            k={text_keys_by_level[subject.level]}
            args={{ ...info, ...additional_info }}
          />
          {gap_year && (
            <div className="auth-gap-details">
              <Details
                summary_content={
                  <TM
                    k={"gap_explain_title"}
                    args={{ ...info, ...additional_info }}
                  />
                }
                content={
                  <TM
                    k={`${subject.level}_gap_explain_body`}
                    args={{ ...info, ...additional_info }}
                  />
                }
              />
            </div>
          )}
        </Col>
        <Col size={8} isGraph>
          {graph_content}
        </Col>
      </StdPanel>
    );
  }
}

const render = function ({ calculations, footnotes, sources, glossary_keys }) {
  return (
    <AuthExpProgSpending
      calculations={calculations}
      footnotes={footnotes}
      sources={sources}
      glossary_keys={glossary_keys}
    />
  );
};

export const declare_auth_exp_prog_spending_panel = () =>
  declare_panel({
    panel_key: "auth_exp_prog_spending",
    levels: ["gov", "dept"],
    panel_config_func: (level, panel_key) => ({
      depends_on: ["orgVoteStatPa", "programSpending", "orgVoteStatEstimates"],
      info_deps: [
        `orgVoteStatPa_${level}_info`,
        `programSpending_${level}_info`,
      ],
      glossary_keys: ["BUD_EXP", "NB_EXP"],
      calculate,
      render,
    }),
  });
