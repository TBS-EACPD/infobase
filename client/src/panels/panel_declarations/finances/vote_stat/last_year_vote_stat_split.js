import _ from "lodash";
import React, { useMemo } from "react";

import { StdPanel, Col } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import { LeafSpinner } from "src/components/index";

import { calculate_program_vote_stat_split_from_finance_data } from "src/models/finances/program_vote_stat_calculations";
import { useProgramVoteStatFinanceData } from "src/models/finances/useProgramVoteStatFinanceData";

import { is_a11y_mode } from "src/core/injected_build_constants";

import { WrappedNivoPie } from "src/charts/wrapped_nivo/index";

import { text_maker, TM } from "./vote_stat_text_provider";

const render_w_options =
  ({ text_key, graph_col, text_col }) =>
  ({ title, calculations, sources, datasets, footnotes, glossary_keys }) => {
    const { vote_stat, text_calculations } = calculations;

    const data = _.map(vote_stat, (data_set) => ({
      ...data_set,
      id: data_set.label,
    }));

    return (
      <StdPanel {...{ title, footnotes, sources, datasets, glossary_keys }}>
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

const VoteStatSplitContainer = (props) => {
  const { subject } = props;
  const { loading, finance_data } = useProgramVoteStatFinanceData(subject);

  const voted_label = text_maker("voted");
  const stat_label = text_maker("stat");

  const calculations = useMemo(() => {
    if (loading) {
      return null;
    }
    return calculate_program_vote_stat_split_from_finance_data(finance_data, {
      voted_label,
      stat_label,
    });
  }, [loading, finance_data, voted_label, stat_label]);

  if (loading) {
    return <LeafSpinner config_name="subroute" />;
  }

  if (!calculations) {
    return null;
  }

  return render_w_options({
    text_key: "program_vote_stat_split_text",
    graph_col: 7,
    text_col: 5,
  })({
    ...props,
    title: text_maker("vote_stat_split_title"),
    calculations,
  });
};

export const declare_vote_stat_split_panel = () =>
  declare_panel({
    panel_key: "vote_stat_split",
    subject_types: ["program"],
    panel_config_func: () => ({
      get_dataset_keys: () => ["program_vote_stat_objects"],
      glossary_keys: ["AUTH"],
      get_title: () => text_maker("vote_stat_split_title"),
      calculate: () => true,
      render: (props) => <VoteStatSplitContainer {...props} />,
    }),
  });
