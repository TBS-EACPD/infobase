import _ from "lodash";
import React, { useMemo } from "react";

import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import {
  create_text_maker_component,
  LeafSpinner,
  Select,
} from "src/components/index";

import { calculate_spending_in_tag_perspective_from_finance_data } from "src/models/finances/spending_in_tag_perspective_calculations";
import { useSpendingInTagPerspectiveFinanceData } from "src/models/finances/useSpendingInTagPerspectiveFinanceData";

import { WrappedNivoPie } from "src/charts/wrapped_nivo/index";

import text from "./perspective_text.yaml";

const { text_maker, TM } = create_text_maker_component(text);

class SpendInTagPerspective extends React.Component {
  constructor() {
    super();
    this.state = {
      active_tag_index: 0,
    };
  }
  render() {
    const { tag_exps, subject, prog_exp } = this.props;

    const { active_tag_index } = this.state;

    const { tag: active_tag, amount: active_tag_exp } =
      tag_exps[active_tag_index];

    const data = [
      {
        id: subject.name,
        label: subject.name,
        value: prog_exp,
      },
      {
        id: text_maker("other_s"),
        label: text_maker("other_s"),
        value: active_tag_exp - prog_exp,
      },
    ];

    return (
      <div className="row" style={{ margin: 0 }}>
        <div
          className="col-12 col-lg-6"
          style={{ padding: "10px", marginBottom: "auto", marginTop: "auto" }}
        >
          <div className="medium-panel-text">
            <TM
              k="program_spending_in_tag_perspective_text"
              args={{
                subject,
                tag: active_tag,
                tag_spend: active_tag_exp,
                tag_exp_pct: prog_exp / active_tag_exp,
              }}
            />
          </div>
        </div>
        <div
          className="col-12 col-lg-6"
          style={{
            padding: "10px",
            flexDirection: "column",
          }}
        >
          {tag_exps.length > 1 && (
            <div>
              <Select
                options={_.map(tag_exps, ({ tag }, index) => ({
                  id: index,
                  display: tag.name,
                }))}
                onSelect={(id) => {
                  this.setState({ active_tag_index: id });
                }}
                selected={active_tag_index}
                className="form-control"
                title={text_maker("search")}
                style={{ width: "100%" }}
              />
            </div>
          )}
          <WrappedNivoPie data={data} />
        </div>
      </div>
    );
  }
}

const SpendingInTagPerspectiveContainer = (props) => {
  const { subject } = props;
  const { loading, finance_data } =
    useSpendingInTagPerspectiveFinanceData(subject);

  const calculations = useMemo(() => {
    if (loading) {
      return null;
    }
    return calculate_spending_in_tag_perspective_from_finance_data(
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

  const { tag_exps, prog_exp } = calculations;

  return (
    <InfographicPanel
      {...props}
      title={text_maker("program_spending_in_tag_perspective_title")}
    >
      <SpendInTagPerspective
        tag_exps={tag_exps}
        subject={subject}
        prog_exp={prog_exp}
      />
    </InfographicPanel>
  );
};

export const declare_spending_in_tag_perspective_panel = () =>
  declare_panel({
    panel_key: "spending_in_tag_perspective",
    subject_types: ["program"],
    panel_config_func: () => ({
      get_title: () => text_maker("program_spending_in_tag_perspective_title"),
      get_dataset_keys: () => ["program_spending"],
      calculate: () => true,
      render: (props) => <SpendingInTagPerspectiveContainer {...props} />,
    }),
  });
