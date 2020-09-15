import { formats } from "../../../../core/format.js";
import { StdPanel, Col, WrappedNivoBar, declare_panel } from "../../shared.js";

import { text_maker, TM } from "./vote_stat_text_provider.js";

const estimates_split_calculate = function (subject, info, options) {
  const in_year_estimates_split =
    info[subject.level + "_in_year_estimates_split"];
  const last_year_estimates_split =
    info[subject.level + "_last_year_estimates_split"];
  if (_.isEmpty(in_year_estimates_split)) {
    return false;
  }
  return {
    in_year: {
      series: _.map(in_year_estimates_split, 1),
      ticks: _.map(in_year_estimates_split, 0),
    },
    last_year: {
      series: _.map(last_year_estimates_split, 1),
      ticks: _.map(last_year_estimates_split, 0),
    },
  };
};

const estimates_split_render_w_text_key = (text_key) => ({
  calculations,
  footnotes,
  sources,
}) => {
  const {
    info,
    panel_args: { in_year: in_year_bar_args },
  } = calculations;
  const keys = in_year_bar_args.ticks;
  const estimate_data = _.map(in_year_bar_args.series, (data, index) => ({
    label: keys[index],
    [text_maker("value")]: data,
  }));

  const content = (
    <WrappedNivoBar
      data={estimate_data}
      keys={[text_maker("value")]}
      label_format={(d) => <tspan y={-4}>{formats.compact2_raw(d)}</tspan>}
      isInteractive={false}
      enableLabel={true}
      indexBy="label"
      colorBy={(d) =>
        d.data[d.id] < 0
          ? window.infobase_color_constants.highlightColor
          : window.infobase_color_constants.secondaryColor
      }
      margin={{
        top: 50,
        right: 40,
        bottom: 120,
        left: 40,
      }}
      bttm_axis={{
        format: (d) => (_.words(d).length > 3 ? d.substring(0, 20) + "..." : d),
        tickSize: 3,
        tickRotation: -45,
        tickPadding: 10,
      }}
      graph_height="450px"
      enableGridX={false}
      remove_left_axis={true}
      theme={{
        axis: {
          ticks: {
            text: {
              fontSize: 12,
              fill: window.infobase_color_constants.textColor,
              fontWeight: "550",
            },
          },
        },
      }}
    />
  );

  return (
    <StdPanel
      title={text_maker("in_year_estimates_split_title")}
      {...{ sources, footnotes }}
    >
      <Col isText size={6}>
        <TM k={text_key} args={info} />
      </Col>
      <Col isGraph={window.is_a11y_mode} size={6}>
        {content}
      </Col>
    </StdPanel>
  );
};

export const declare_in_year_estimates_split_panel = () =>
  declare_panel({
    panel_key: "in_year_estimates_split",
    levels: ["gov", "dept"],
    panel_config_func: (level, panel_key) => {
      switch (level) {
        case "gov":
          return {
            machinery_footnotes: false,
            depends_on: ["orgVoteStatEstimates"],
            info_deps: ["orgVoteStatEstimates_gov_info"],
            calculate: estimates_split_calculate,
            render: estimates_split_render_w_text_key(
              "gov_in_year_estimates_split_text"
            ),
          };
        case "dept":
          return {
            machinery_footnotes: false,
            depends_on: ["orgVoteStatEstimates"],
            info_deps: [
              "orgVoteStatEstimates_gov_info",
              "orgVoteStatEstimates_dept_info",
            ],
            calculate: estimates_split_calculate,
            render: estimates_split_render_w_text_key(
              "dept_in_year_estimates_split_text"
            ),
          };
      }
    },
  });
