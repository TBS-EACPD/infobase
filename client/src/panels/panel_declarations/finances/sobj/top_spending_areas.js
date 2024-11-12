import _ from "lodash";
import React from "react";

import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import { create_text_maker_component, LeafSpinner } from "src/components/index";

import { useProgramExpSobjs } from "src/models/finance/queries";

import { WrappedNivoPie } from "src/charts/wrapped_nivo/index";

import text from "./top_spending_areas.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const ProgramExpSobjs = ({ subject }) => {
  const { loading, data } = useProgramExpSobjs({ programId: subject.id });

  if (loading) {
    return <LeafSpinner config_name={"subroute"} />;
  }

  const graph_data = _.chain(data.program_exp_sobjs)
    .filter((row) => row.pa_exp_last_year !== 0)
    .map(({ so_num, pa_exp_last_year }) => ({
      id: so_num,
      label: text_maker(`SOBJ${so_num}`),
      value: pa_exp_last_year,
    }))
    .compact()
    .value();

  const total_spent = _.sumBy(graph_data, "value");

  const top_so_spent = _.maxBy(graph_data, "value");

  const top_so_pct = top_so_spent.value / total_spent;

  const text_calculations = {
    subject,
    total_spent,
    top_so_name: top_so_spent.label,
    top_so_spent: top_so_spent.value,
    top_so_pct,
  };

  return (
    <div>
      <TM k={"program_top_spending_areas_text"} args={text_calculations} />
      <WrappedNivoPie
        data={graph_data}
        display_horizontal={true}
        graph_height="450px"
      />
    </div>
  );
};

export const declare_top_spending_areas_panel = () =>
  declare_panel({
    panel_key: "top_spending_areas",
    subject_types: ["program"],
    panel_config_func: () => ({
      legacy_table_dependencies: ["programSobjs"],
      get_dataset_keys: () => ["program_standard_objects"],
      get_title: () => text_maker("top_spending_areas_title"),
      render: ({ title, subject, footnotes, sources, datasets }) => {
        return (
          <InfographicPanel {...{ title, footnotes, sources, datasets }}>
            <ProgramExpSobjs subject={subject} />
          </InfographicPanel>
        );
      },
    }),
  });
