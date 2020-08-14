import {
  WrappedNivoBar,
  year_templates,
  StandardLegend,
  run_template,
  InfographicPanel,
  create_text_maker_component,
  get_planned_fte_source_link,
  get_planned_spending_source_link,
  declare_panel,
} from "../../shared.js";

import text from "./crso_by_prog.yaml";

const { planning_years } = year_templates;
const { text_maker, TM } = create_text_maker_component(text);

const render_resource_type = (is_fte) => ({ calculations, footnotes }) => {
  const { panel_args, subject } = calculations;

  const sources = [
    is_fte
      ? get_planned_fte_source_link(subject)
      : get_planned_spending_source_link(subject),
  ];

  const { exp_data, fte_data } = panel_args;

  //use hacky side-effects to create colors for all programs, so that these colours are consitent accross the fte/$ panel
  const all_program_names = _.chain(exp_data.programs)
    .map("label")
    .concat(_.map(exp_data, "label"))
    .uniq()
    .value();
  const colors = infobase_colors();
  _.each(all_program_names, (name) => colors(name));

  const text = (
    <TM
      k="crso_by_prog_exp_or_ftes"
      args={{
        subject,
        crso_prg_num: subject.programs.length,
        crso_prg_top1: is_fte
          ? panel_args.max_fte_name
          : panel_args.max_exp_name,
        crso_prg_top1_amnt: is_fte ? panel_args.max_ftes : panel_args.max_exp,
        crso_prg_top2: is_fte
          ? panel_args.top2_fte_name
          : panel_args.top2_exp_name,
        crso_prg_top2_amnt: is_fte ? panel_args.top2_ftes : panel_args.top2_exp,
        is_fte: is_fte,
      }}
    />
  );

  return (
    <InfographicPanel
      title={text_maker(
        is_fte ? "crso_by_prog_fte_title" : "crso_by_prog_exp_title"
      )}
      {...{ sources, footnotes }}
    >
      <PlannedProgramResources
        programs={_.sortBy(
          is_fte ? fte_data : exp_data,
          ({ data }) => -d3.sum(data)
        )}
        colors={colors}
        text={text}
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
      active_programs: window.is_a11y_mode
        ? program_labels
        : _.take(program_labels, 3),
    };
  }
  render() {
    const { text, programs, colors, is_fte } = this.props;

    const ticks = _.map(planning_years, run_template);

    const { active_programs } = this.state;

    const graph_data = _.chain(programs)
      .filter(({ label }) => _.includes(active_programs, label))
      .map(({ label, data }) => [label, data])
      .fromPairs()
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

    return (
      <div>
        <div className="medium_panel_text mrgn-bttm-lg">{text}</div>
        <div className="frow">
          {!window.is_a11y_mode && (
            <div className="fcol-md-4" style={{ width: "100%" }}>
              <StandardLegend
                items={_.map(programs, ({ label }) => ({
                  label,
                  id: label,
                  active: _.includes(active_programs, label),
                  color: colors(label),
                }))}
                onClick={(id) => {
                  !(
                    active_programs.length === 1 && active_programs.includes(id)
                  ) &&
                    this.setState({
                      active_programs: _.toggle_list(active_programs, id),
                    });
                }}
              />
            </div>
          )}
          <div className="fcol-md-8">
            <WrappedNivoBar
              data={data_by_year}
              keys={Object.keys(graph_data)}
              indexBy="year"
              colorBy={(d) => colors(d.id)}
              is_money={!is_fte}
            />
          </div>
        </div>
      </div>
    );
  }
}

const get_calculate_func = (is_fte) => {
  return function (subject) {
    if (subject.is_dead) {
      return false;
    }

    const { programSpending, programFtes } = this.tables;

    const all_exp = _.sumBy(planning_years, (col) =>
      programSpending.q(subject).sum(col)
    );
    const all_fte = _.sumBy(planning_years, (col) =>
      programFtes.q(subject).sum(col)
    );

    const should_bail = is_fte ? all_fte === 0 : all_exp === 0;
    if (should_bail) {
      return false;
    }

    const exp_data = _.map(programSpending.q(subject).data, (row) => ({
      label: row.prgm,
      data: planning_years.map((col) => row[col]),
    }));

    const fte_data = _.map(programFtes.q(subject).data, (row) => ({
      label: row.prgm,
      data: planning_years.map((col) => row[col]),
    }));

    const ftes = _.map(fte_data, (prg) => prg.data[0]);
    const sorted_ftes = ftes.slice().sort((a, b) => b - a);
    const max_ftes = sorted_ftes[0];
    const max_fte_name = fte_data[_.indexOf(ftes, max_ftes)].label;
    const top2_ftes = sorted_ftes.length > 1 && sorted_ftes[1];
    const top2_fte_name =
      top2_ftes && fte_data[_.indexOf(ftes, top2_ftes)].label;

    const exps = _.map(exp_data, (prg) => prg.data[0]);
    const sorted_exps = exps.slice().sort((a, b) => b - a);
    const max_exp = sorted_exps[0];
    const max_exp_name = exp_data[_.indexOf(exps, max_exp)].label;
    const top2_exp = sorted_exps.length > 1 && sorted_exps[1];
    const top2_exp_name = top2_exp && exp_data[_.indexOf(exps, top2_exp)].label;
    return {
      exp_data,
      fte_data,
      max_ftes,
      max_fte_name,
      top2_ftes,
      top2_fte_name,
      max_exp,
      max_exp_name,
      top2_exp,
      top2_exp_name,
    };
  };
};

export const declare_crso_by_prog_fte_panel = () =>
  declare_panel({
    panel_key: "crso_by_prog_fte",
    levels: ["crso"],
    panel_config_func: (level, panel_key) => ({
      footnotes: ["PLANNED_EXP"],
      depends_on: ["programSpending", "programFtes"],
      calculate: get_calculate_func(true),
      render: render_resource_type(true),
    }),
  });
export const declare_crso_by_prog_exp_panel = () =>
  declare_panel({
    panel_key: "crso_by_prog_exp",
    levels: ["crso"],
    panel_config_func: (level, panel_key) => ({
      footnotes: ["PLANNED_EXP"],
      depends_on: ["programSpending", "programFtes"],
      calculate: get_calculate_func(false),
      render: render_resource_type(false),
    }),
  });
