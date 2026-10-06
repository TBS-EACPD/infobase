import React, { useMemo } from "react";

import { TextPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import { create_text_maker_component, LeafSpinner } from "src/components/index";

import {
  panel_finance_config,
  useFinanceData,
  with_loaded_finance_data,
} from "src/models/finances/finance_panels";
import { calculate_planned_actual_comparison_from_finance_data } from "src/models/finances/planned_actual_comparison_calculations";

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
  const { loading, finance_data } = useFinanceData(
    subject,
    "planned_actual_comparison"
  );

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
    panel_config_func: (subject_type) => ({
      get_dataset_keys: () => ["program_spending", "program_ftes"],
      get_title: () => text_maker("planned_actual_title"),
      ...panel_finance_config("planned_actual_comparison", subject_type),
      calculate: ({ subject }) =>
        with_loaded_finance_data(subject, (finance_data) =>
          calculate_planned_actual_comparison_from_finance_data(
            subject,
            finance_data
          )
        ),
      render: (props) => <PlannedActualComparisonContainer {...props} />,
    }),
  });
