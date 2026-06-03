import _ from "lodash";
import React, { useMemo } from "react";

import { StdPanel, Col } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import { GraphOverlay, LeafSpinner } from "src/components/index";

import { calculate_personnel_spend_from_finance_data } from "src/models/finances/sobj_calculations";
import { useOrgSobjsFinanceData } from "src/models/finances/useOrgSobjsFinanceData";

import { run_template } from "src/models/text";
import { year_templates } from "src/models/years";

import { WrappedNivoLine } from "src/charts/wrapped_nivo/index";
import { primaryColor } from "src/style_constants/index";

import { text_maker, TM } from "./sobj_text_provider";

const { std_years } = year_templates;

const PersonnelSpendPanel = ({
  title,
  calculations,
  footnotes,
  sources,
  datasets,
}) => {
  const personnel_data = [
    {
      id: "Personnel",
      data: _.map(calculations.series, (spending_data, year_index) => ({
        y: spending_data,
        x: run_template(std_years[year_index]),
      })),
    },
  ];

  return (
    <StdPanel {...{ title, footnotes, sources, datasets }}>
      <Col size={5} isText>
        <TM k="personnel_spend_text" args={calculations.text_calculations} />
      </Col>
      <Col size={7} isGraph>
        <div position="relative">
          <GraphOverlay>
            <WrappedNivoLine
              raw_data={calculations.series}
              data={personnel_data}
              margin={{
                top: 50,
                right: 40,
                bottom: 50,
                left: 65,
              }}
              colors={primaryColor}
            />
          </GraphOverlay>
        </div>
      </Col>
    </StdPanel>
  );
};

const PersonnelSpendContainer = (props) => {
  const { subject } = props;
  const { loading, finance_data } = useOrgSobjsFinanceData(subject);

  const calculations = useMemo(() => {
    if (loading) {
      return null;
    }
    return calculate_personnel_spend_from_finance_data(finance_data);
  }, [loading, finance_data]);

  if (loading) {
    return <LeafSpinner config_name="subroute" />;
  }

  if (!calculations) {
    return null;
  }

  return (
    <PersonnelSpendPanel
      {...props}
      title={text_maker("personnel_spend_title")}
      calculations={calculations}
    />
  );
};

export const declare_personnel_spend_panel = () =>
  declare_panel({
    panel_key: "personnel_spend",
    subject_types: ["gov"],
    panel_config_func: () => ({
      get_dataset_keys: () => ["org_standard_objects"],
      get_title: () => text_maker("personnel_spend_title"),
      calculate: () => true,
      render: (props) => <PersonnelSpendContainer {...props} />,
    }),
  });
