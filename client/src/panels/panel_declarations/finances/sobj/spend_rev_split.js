import _ from "lodash";
import React, { useMemo } from "react";

import { StdPanel, Col } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import {
  create_text_maker_component,
  LeafSpinner,
} from "src/components/index";

import {
  calculate_dept_spend_rev_split_from_finance_data,
  calculate_program_spend_rev_split_from_finance_data,
} from "src/models/finances/sobj_calculations";
import { useOrgSobjsFinanceData } from "src/models/finances/useOrgSobjsFinanceData";
import { useProgramSobjsFinanceData } from "src/models/finances/useProgramSobjsFinanceData";

import { formats } from "src/core/format";

import { is_a11y_mode } from "src/core/injected_build_constants";

import { WrappedNivoBar } from "src/charts/wrapped_nivo/index";
import { highlightColor, secondaryColor } from "src/style_constants/index";

import text from "./spend_rev_split.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const text_keys_by_subject_type = {
  dept: "dept_spend_rev_split_text",
  program: "program_spend_rev_split_text",
};

function render({
  title,
  subject,
  calculations,
  footnotes,
  sources,
  datasets,
}) {
  const { text_calculations } = calculations;
  const { last_year_gross_exp, last_year_net_exp, last_year_rev } =
    text_calculations;

  const series = [last_year_gross_exp, last_year_rev];
  const _ticks = ["gross", "revenues"];

  if (last_year_rev !== 0) {
    series.push(last_year_net_exp);
    _ticks.push("net");
  }

  const ticks = _ticks.map(text_maker);
  const spend_rev_data = _.map(series, (spend_rev_value, tick_index) => ({
    title: ticks[tick_index],
    [text_maker("value")]: spend_rev_value,
  }));

  const graph_content = is_a11y_mode ? null : (
    <div>
      <WrappedNivoBar
        data={spend_rev_data}
        keys={[text_maker("value")]}
        indexBy="title"
        enableLabel={true}
        isInteractive={false}
        label={(d) => (
          <tspan y={-10}>
            {formats.compact1(d.formattedValue, { raw: true })}
          </tspan>
        )}
        colors={(d) => (d.data[d.id] < 0 ? highlightColor : secondaryColor)}
        enableGridX={false}
      />
    </div>
  );

  return (
    <StdPanel {...{ title, footnotes, sources, datasets }}>
      <Col size={5} isText>
        <TM
          k={text_keys_by_subject_type[subject.subject_type]}
          args={text_calculations}
        />
      </Col>
      <Col size={7} isGraph>
        {graph_content}
      </Col>
    </StdPanel>
  );
}

const SpendRevSplitContainer = ({ subject, ...props }) => {
  const org_query = useOrgSobjsFinanceData(subject);
  const program_query = useProgramSobjsFinanceData(subject);
  const { loading, finance_data } =
    subject.subject_type === "program" ? program_query : org_query;

  const calculations = useMemo(() => {
    if (loading) {
      return null;
    }
    if (subject.subject_type === "program") {
      return calculate_program_spend_rev_split_from_finance_data(
        subject,
        finance_data
      );
    }
    return calculate_dept_spend_rev_split_from_finance_data(
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

  return render({
    ...props,
    subject,
    title: text_maker("spend_rev_split_title"),
    calculations,
  });
};

const common_panel_config = {
  get_title: () => text_maker("spend_rev_split_title"),
  calculate: () => true,
  render: (props) => <SpendRevSplitContainer {...props} />,
};

export const declare_spend_rev_split_panel = () =>
  declare_panel({
    panel_key: "spend_rev_split",
    subject_types: ["dept", "program"],
    panel_config_func: (subject_type) => {
      switch (subject_type) {
        case "dept":
          return {
            ...common_panel_config,
            get_dataset_keys: () => ["org_standard_objects"],
          };
        case "program":
          return {
            ...common_panel_config,
            get_dataset_keys: () => ["program_standard_objects"],
          };
      }
    },
  });
