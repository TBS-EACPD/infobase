import _ from "lodash";
import React, { useMemo } from "react";
import MediaQuery from "react-responsive";

import { InfographicPanel } from "src/panels/panel_declarations/InfographicPanel";
import { declare_panel } from "src/panels/PanelRegistry";

import { create_text_maker_component, LeafSpinner } from "src/components/index";

import { calculate_crso_by_prog_from_finance_data } from "src/models/finances/crso_by_prog_calculations";
import { useCrsoByProgFinanceData } from "src/models/finances/useCrsoByProgFinanceData";

import { run_template } from "src/models/text";

import { infobase_colors } from "src/core/color_schemes";
import { is_a11y_mode } from "src/core/injected_build_constants";

import { StandardLegend } from "src/charts/legends/index";

import { WrappedNivoBar } from "src/charts/wrapped_nivo/index";

import { toggle_list } from "src/general_utils";
import {
  minExtraLargeDevice,
  maxExtraLargeDevice,
  minLargeDevice,
  maxLargeDevice,
  minMediumDevice,
  maxMediumDevice,
  minSmallDevice,
  maxSmallDevice,
  minExtraSmallDevice,
  maxExtraSmallDevice,
  tertiaryColor,
} from "src/style_constants/index";

import text from "./crso_by_prog.yaml";

const { text_maker, TM } = create_text_maker_component(text);

const render_resource_type =
  (is_fte) =>
  ({ title, sources, datasets, subject, calculations, footnotes }) => {
    const {
      exp_data,
      fte_data,
      fte_years,
      exp_years,
      exp_gap_year,
      fte_gap_year,
    } = calculations;

    //use hacky side-effects to create colors for all programs, so that these colours are consitent accross the fte/$ panel
    const all_program_names = _.chain(exp_data).map("label").uniq().value();
    const colors = infobase_colors();
    _.each(all_program_names, (name) => colors(name));

    const first_year_program_count = _.chain(exp_data)
      .zip(fte_data)
      .filter(
        ([{ data: exp_data }, { data: fte_data }]) =>
          exp_data[0] !== 0 || fte_data[0] !== 0
      )
      .value().length;

    const text = (
      <TM
        k="crso_by_prog_exp_or_ftes"
        args={{
          subject,
          first_year_program_count,
          is_fte: is_fte,
          ...calculations,
        }}
      />
    );

    return (
      <InfographicPanel {...{ title, sources, datasets, footnotes }}>
        <PlannedProgramResources
          years_with_gap_year={is_fte ? fte_years : exp_years}
          programs={_.sortBy(is_fte ? fte_data : exp_data, "label")}
          colors={colors}
          text={text}
          gap_year={is_fte ? fte_gap_year : exp_gap_year}
          is_fte={is_fte}
        />
      </InfographicPanel>
    );
  };

class PlannedProgramResources extends React.Component {
  constructor(props) {
    super(props);
    const program_labels = _.map(props.programs, "label");
    this.state = {
      active_programs: is_a11y_mode
        ? program_labels
        : _.take(program_labels, 3),
    };
  }
  render() {
    const { text, programs, colors, is_fte, years_with_gap_year, gap_year } =
      this.props;
    const ticks = _.map(years_with_gap_year, run_template);

    const { active_programs } = this.state;

    // merge programs with the same name; limitation of nivo being keyed by label while we have programs with reused names
    const graph_data = _.chain(programs)
      .filter(({ label }) => _.includes(active_programs, label))
      .groupBy("label")
      .mapValues((programs) =>
        _.chain(programs)
          .map("data")
          .thru((data_rows) => _.zip(...data_rows))
          .map(_.sum)
          .value()
      )
      .value();

    //have to have an empty string in key to make sure
    //that negative bars will be displayed
    const data_by_year = _.map(ticks, (year, year_index) => ({
      year,
      ..._.chain(graph_data)
        .map((data, label) => [label, data[year_index]])
        .fromPairs()
        .value(),
    }));

    const nivo_props = {
      data: data_by_year,
      padding: 0.3,
      keys: Object.keys(graph_data),
      indexBy: "year",
      colors: (d) => colors(d.id),
      is_money: !is_fte,
    };

    const get_nivo_bar_graph = (gap_year_marker_x_px) => (
      <WrappedNivoBar
        {...{
          ...nivo_props,
          ...(gap_year && {
            markers: [
              {
                axis: "x",
                value: gap_year,
                lineStyle: {
                  stroke: tertiaryColor,
                  transform: `translate(${gap_year_marker_x_px}px, 0px)`,
                  strokeWidth: 2,
                  strokeDasharray: "3, 3",
                },
              },
            ],
          }),
        }}
      />
    );
    return (
      <div>
        <div className="medium-panel-text mrgn-bttm-lg">{text}</div>
        <div className="row">
          {!is_a11y_mode && (
            <div className="col-12 col-lg-4" style={{ width: "100%" }}>
              <StandardLegend
                legendListProps={{
                  items: _.map(programs, ({ label }) => ({
                    label,
                    id: label,
                    active: _.includes(active_programs, label),
                    color: colors(label),
                  })),
                  onClick: (id) => {
                    !(
                      active_programs.length === 1 &&
                      active_programs.includes(id)
                    ) &&
                      this.setState({
                        active_programs: toggle_list(active_programs, id),
                      });
                  },
                }}
              />
            </div>
          )}
          <div className="col-12 col-lg-8">
            <MediaQuery minWidth={minExtraLargeDevice}>
              {get_nivo_bar_graph(34)}
            </MediaQuery>
            <MediaQuery
              minWidth={minLargeDevice}
              maxWidth={maxExtraLargeDevice}
            >
              {get_nivo_bar_graph(27)}
            </MediaQuery>
            <MediaQuery minWidth={minMediumDevice} maxWidth={maxLargeDevice}>
              {get_nivo_bar_graph(31)}
            </MediaQuery>
            <MediaQuery minWidth={minSmallDevice} maxWidth={maxMediumDevice}>
              {get_nivo_bar_graph(22)}
            </MediaQuery>
            <MediaQuery
              minWidth={minExtraSmallDevice}
              maxWidth={maxSmallDevice}
            >
              {get_nivo_bar_graph(17)}
            </MediaQuery>
            <MediaQuery maxWidth={maxExtraSmallDevice}>
              {get_nivo_bar_graph(9)}
            </MediaQuery>
          </div>
        </div>
      </div>
    );
  }
}

const CrsoByProgContainer = ({ is_fte, subject, ...props }) => {
  const { loading, finance_data } = useCrsoByProgFinanceData(subject);

  const calculations = useMemo(() => {
    if (loading) {
      return null;
    }
    return calculate_crso_by_prog_from_finance_data(
      subject,
      finance_data,
      is_fte
    );
  }, [loading, subject, finance_data, is_fte]);

  if (loading) {
    return <LeafSpinner config_name="subroute" />;
  }

  if (!calculations) {
    return null;
  }

  return render_resource_type(is_fte)({
    ...props,
    subject,
    calculations,
  });
};

export const declare_crso_by_prog_fte_panel = () =>
  declare_panel({
    panel_key: "crso_by_prog_fte",
    subject_types: ["crso"],
    panel_config_func: () => ({
      get_dataset_keys: () => ["program_ftes"],
      get_title: () => text_maker("crso_by_prog_fte_title"),
      calculate: () => true,
      render: (props) => <CrsoByProgContainer {...props} is_fte />,
    }),
  });
export const declare_crso_by_prog_exp_panel = () =>
  declare_panel({
    panel_key: "crso_by_prog_exp",
    subject_types: ["crso"],
    panel_config_func: () => ({
      get_dataset_keys: () => ["program_spending"],
      get_title: () => text_maker("crso_by_prog_exp_title"),
      calculate: () => true,
      render: (props) => <CrsoByProgContainer {...props} is_fte={false} />,
    }),
  });
