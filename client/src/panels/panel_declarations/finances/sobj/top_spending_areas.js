import _ from "lodash";
import React from "react";

import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import {
  create_text_maker_component,
  LeafSpinner,
  TabsStateful,
} from "src/components/index";

import { useProgramSobjs } from "src/models/finance/queries";

import { WrappedNivoPie } from "src/charts/wrapped_nivo/index";

import text from "./top_spending_areas.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const common_cal = (subject, data) => {
  const graph_data = _.chain(data)
    .filter((row) => row.pa_last_year)
    .map(({ so_num, pa_last_year }) => ({
      id: so_num,
      label: text_maker(`SOBJ${so_num}`),
      value: Math.abs(pa_last_year),
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

  return {
    graph_data,
    text_calculations,
  };
};

const ProgramSobjs = ({ subject }) => {
  const { loading, data } = useProgramSobjs({ programId: subject.id });

  if (loading) {
    return <LeafSpinner config_name={"subroute"} />;
  }

  const exp_values = common_cal(
    subject,
    _.map(data.program_sobjs, ({ so_num, pa_exp_last_year }) => ({
      so_num,
      pa_last_year: pa_exp_last_year,
    }))
  );

  const rev_values = common_cal(
    subject,
    _.map(data.program_sobjs, ({ so_num, pa_rev_last_year }) => ({
      so_num,
      pa_last_year: pa_rev_last_year,
    }))
  );

  return (
    <TabsStateful
      tabs={{
        spending: {
          label: text_maker("spending_title"),
          content: (
            <div>
              <TM
                k={"program_top_spending_areas_text"}
                args={exp_values.text_calculations}
              />
              <WrappedNivoPie
                data={exp_values.graph_data}
                display_horizontal={true}
                graph_height="450px"
              />
            </div>
          ),
        },
        revenue: {
          label: text_maker("revenue_title"),
          content: (
            <div>
              <TM
                k={"program_top_revenue_areas_text"}
                args={rev_values.text_calculations}
              />
              <WrappedNivoPie
                data={rev_values.graph_data}
                display_horizontal={true}
                graph_height="450px"
              />
            </div>
          ),
        },
      }}
    />
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
            <ProgramSobjs subject={subject} />
          </InfographicPanel>
        );
      },
    }),
  });
