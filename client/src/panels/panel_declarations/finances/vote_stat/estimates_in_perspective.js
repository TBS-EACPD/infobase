import _ from "lodash";
import React, { useMemo } from "react";

import { StdPanel, Col } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import { LeafSpinner } from "src/components/index";

import { calculate_estimates_in_perspective_from_finance_data } from "src/models/finances/org_vote_stat_estimates_calculations";
import { useOrgVoteStatEstimatesFinanceData } from "src/models/finances/useOrgVoteStatEstimatesFinanceData";
import { create_footnote } from "src/models/footnotes/footnotes";



import { is_a11y_mode } from "src/core/injected_build_constants";

import { CircleProportionGraph } from "src/charts/wrapped_nivo/index";

import { TM, text_maker } from "./vote_stat_text_provider";

const EstimatesInPerspectivePanel = ({
  title,
  subject,
  calculations,
  footnotes,
  sources,
  datasets,
}) => {
  const { gov_tabled_est_in_year, dept_tabled_est_in_year } = calculations;

  footnotes = _.concat(
    create_footnote({
      id: text_maker("auth_footnote"),
      subject_type: subject.subject_type,
      subject_id: subject.id,
      text: text_maker("auth_footnote"),
      topic_keys: ["AUTH"],
    }),
    footnotes
  );

  return (
    <StdPanel {...{ title, footnotes, sources, datasets }} allowOverflow={true}>
      <Col isText size={!is_a11y_mode ? 5 : 12}>
        <TM k="estimates_perspective_text" args={calculations} />
      </Col>
      {!is_a11y_mode && (
        <Col isGraph size={7}>
          <CircleProportionGraph
            height={250}
            child_value={dept_tabled_est_in_year}
            child_name={text_maker("dept_estimates", { subject })}
            parent_value={gov_tabled_est_in_year}
            parent_name={text_maker("gov_estimates")}
          />
        </Col>
      )}
    </StdPanel>
  );
};

const EstimatesInPerspectiveContainer = (props) => {
  const { subject } = props;
  const { loading, finance_data } = useOrgVoteStatEstimatesFinanceData(
    subject,
    { with_gov: true }
  );

  const calculations = useMemo(() => {
    if (loading) {
      return null;
    }
    return calculate_estimates_in_perspective_from_finance_data(
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

  return (
    <EstimatesInPerspectivePanel
      {...props}
      title={text_maker("estimates_perspective_title")}
      calculations={calculations}
    />
  );
};

export const declare_estimates_in_perspective_panel = () =>
  declare_panel({
    panel_key: "estimates_in_perspective",
    subject_types: ["dept"],
    panel_config_func: () => ({
      get_title: () => text_maker("estimates_perspective_title"),
      get_dataset_keys: () => ["tabled_estimates"],
      calculate: () => true,
      render: (props) => <EstimatesInPerspectiveContainer {...props} />,
    }),
  });
