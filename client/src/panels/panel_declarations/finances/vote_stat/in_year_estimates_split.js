import _ from "lodash";
import React, { useMemo } from "react";

import { StdPanel, Col } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import { calculate_in_year_estimates_split_from_finance_data } from "src/models/finances/org_vote_stat_estimates_calculations";
import { useOrgVoteStatEstimatesFinanceData } from "src/models/finances/useOrgVoteStatEstimatesFinanceData";

import { LeafSpinner } from "src/components/index";

import { formats } from "src/core/format";
import { is_a11y_mode } from "src/core/injected_build_constants";

import { WrappedNivoBar } from "src/charts/wrapped_nivo/index";

import {
  highlightColor,
  secondaryColor,
  textColor,
} from "src/style_constants/index";

import { text_maker, TM } from "./vote_stat_text_provider";

const estimates_split_render_w_text_key =
  (text_key) =>
  ({ title, calculations, footnotes, sources, datasets }) => {
    const { in_year_estimates_split } = calculations;
    const estimate_data = _.map(in_year_estimates_split, ([tick, data]) => ({
      label: tick,
      [tick]: data,
    }));

    const content = (
      <WrappedNivoBar
        data={estimate_data}
        keys={_.map(estimate_data, "label")}
        label={(d) => (
          <tspan y={-10}>{formats.compact2_raw(d.formattedValue)}</tspan>
        )}
        isInteractive={true}
        enableLabel={true}
        indexBy="label"
        colors={(d) => (d.data[d.id] < 0 ? highlightColor : secondaryColor)}
        margin={{
          top: 50,
          right: 40,
          bottom: 120,
          left: 40,
        }}
        bttm_axis={{
          format: (d) =>
            _.words(d).length > 3 ? d.substring(0, 20) + "..." : d,
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
                fill: textColor,
                fontWeight: "550",
              },
            },
          },
        }}
      />
    );

    return (
      <StdPanel {...{ title, sources, datasets, footnotes }}>
        <Col isText size={6}>
          <TM k={text_key} args={calculations} />
        </Col>
        <Col isGraph={is_a11y_mode} size={6}>
          {content}
        </Col>
      </StdPanel>
    );
  };

const InYearEstimatesSplitContainer = ({ subject, text_key, ...props }) => {
  const { loading, finance_data } = useOrgVoteStatEstimatesFinanceData(subject);

  const calculations = useMemo(() => {
    if (loading) {
      return null;
    }
    return calculate_in_year_estimates_split_from_finance_data(
      subject,
      finance_data
    );
  }, [loading, subject, finance_data]);

  if (loading) {
    return <LeafSpinner config_name="subroute" />;
  }

  if (!calculations) {
    return null;
  }

  return estimates_split_render_w_text_key(text_key)({
    ...props,
    subject,
    calculations,
  });
};

const common_panel_config = {
  get_dataset_keys: () => ["tabled_estimates"],
  get_title: () => text_maker("in_year_estimates_split_title"),
  calculate: () => true,
};

export const declare_in_year_estimates_split_panel = () =>
  declare_panel({
    panel_key: "in_year_estimates_split",
    subject_types: ["gov", "dept"],
    panel_config_func: (subject_type) => {
      switch (subject_type) {
        case "gov":
          return {
            ...common_panel_config,
            render: (props) => (
              <InYearEstimatesSplitContainer
                {...props}
                text_key="gov_in_year_estimates_split_text"
              />
            ),
          };
        case "dept":
          return {
            ...common_panel_config,
            render: (props) => (
              <InYearEstimatesSplitContainer
                {...props}
                text_key="dept_in_year_estimates_split_text"
              />
            ),
          };
      }
    },
  });
