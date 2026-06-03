import React, { useMemo } from "react";

import { TextPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import { create_text_maker_component, LeafSpinner } from "src/components/index";

import { calculate_planned_actual_comparison_from_finance_data } from "src/models/finances/planned_actual_comparison_calculations";
import { useWelcomeMatFinanceData } from "src/models/finances/useWelcomeMatFinanceData";

import { PlannedActualTable } from "./PlannedActualTable";

import text from "./planned_actual_comparison.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const PlannedActualComparisonPanel = ({
  title,
  subject,
  calculations,
  sources,
  datasets,
}) => {
  const {
    actual_spend,
    actual_ftes,
    planned_spend,
    planned_ftes,
    diff_ftes,
    diff_spend,
    footnotes,
    text_calculations,
  } = calculations;

  return (
    <TextPanel {...{ title, footnotes, sources, datasets }}>
      <TM
        k={`${subject.subject_type}_planned_actual_text`}
        args={text_calculations}
      />
      <PlannedActualTable
        {...{
          actual_spend,
          actual_ftes,
          planned_spend,
          planned_ftes,
          diff_ftes,
          diff_spend,
        }}
      />
    </TextPanel>
  );
};

const PlannedActualComparisonContainer = (props) => {
  const { subject, sources, datasets } = props;
  const { loading, finance_data } = useWelcomeMatFinanceData(subject);

  const calculations = useMemo(() => {
    if (loading) {
      return null;
    }
    return calculate_planned_actual_comparison_from_finance_data(
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
    <PlannedActualComparisonPanel
      {...props}
      title={text_maker("planned_actual_title")}
      calculations={calculations}
      footnotes={calculations.footnotes}
      sources={sources}
      datasets={datasets}
    />
  );
};

export const declare_planned_actual_comparison_panel = () =>
  declare_panel({
    panel_key: "planned_actual_comparison",
    subject_types: ["dept", "crso", "program"],
    panel_config_func: () => ({
      get_dataset_keys: () => ["program_spending", "program_ftes"],
      get_title: () => text_maker("planned_actual_title"),
      calculate: () => true,
      render: (props) => <PlannedActualComparisonContainer {...props} />,
    }),
  });
