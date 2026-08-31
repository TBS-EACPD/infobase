import _ from "lodash";
import React, { useMemo } from "react";

import { StdPanel, Col } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import { LeafSpinner } from "src/components/index";

import { isSpecialWarrants } from "src/models/estimates";

import { calculate_in_year_voted_stat_split_from_finance_data } from "src/models/finances/org_vote_stat_estimates_calculations";
import { useOrgVoteStatEstimatesFinanceData } from "src/models/finances/useOrgVoteStatEstimatesFinanceData";

import { is_a11y_mode } from "src/core/injected_build_constants";

import { WrappedNivoPie } from "src/charts/wrapped_nivo/index";

import { text_maker, TM } from "./vote_stat_text_provider";

const voted = text_maker("voted");
const stat = text_maker("stat");

const render_w_options =
  ({ graph_col, text_col, text_key }) =>
  ({ title, calculations, footnotes, sources, datasets, glossary_keys }) => {
    const { vote_stat_est_in_year, text_calculations } = calculations;

    const data = _.map(vote_stat_est_in_year, (data_set) => ({
      ...data_set,
      id: data_set.label,
    }));

    return (
      <StdPanel {...{ title, sources, datasets, footnotes, glossary_keys }}>
        <Col isText size={text_col}>
          <TM k={text_key} args={text_calculations} />
        </Col>
        {!is_a11y_mode && (
          <Col isGraph size={graph_col}>
            <WrappedNivoPie data={data} />
          </Col>
        )}
      </StdPanel>
    );
  };

const InYearVotedStatSplitContainer = ({
  subject,
  text_key,
  text_col,
  graph_col,
  ...props
}) => {
  const { loading, finance_data } = useOrgVoteStatEstimatesFinanceData(subject);

  const calculations = useMemo(() => {
    if (loading || isSpecialWarrants()) {
      return null;
    }
    return calculate_in_year_voted_stat_split_from_finance_data(
      subject,
      finance_data,
      { stat, voted }
    );
  }, [loading, subject, finance_data]);

  if (loading) {
    return <LeafSpinner config_name="subroute" />;
  }

  if (!calculations) {
    return null;
  }

  return render_w_options({ text_key, text_col, graph_col })({
    ...props,
    subject,
    calculations,
  });
};

const common_panel_config = {
  get_dataset_keys: () => ["tabled_estimates"],
  glossary_keys: ["AUTH"],
  get_title: () => text_maker("in_year_voted_stat_split_title"),
  calculate: () => true,
};

export const declare_in_year_voted_stat_split_panel = () =>
  declare_panel({
    panel_key: "in_year_voted_stat_split",
    subject_types: ["gov", "dept"],
    panel_config_func: (subject_type) => {
      switch (subject_type) {
        case "gov":
          return {
            ...common_panel_config,
            render: (props) => (
              <InYearVotedStatSplitContainer
                {...props}
                text_key="gov_in_year_voted_stat_split_text"
                text_col={7}
                graph_col={5}
              />
            ),
          };
        case "dept":
          return {
            ...common_panel_config,
            render: (props) => (
              <InYearVotedStatSplitContainer
                {...props}
                text_key="dept_in_year_voted_stat_split_text"
                graph_col={6}
                text_col={6}
              />
            ),
          };
      }
    },
  });
