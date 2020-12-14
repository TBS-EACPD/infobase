import {
  declare_panel,
  util_components,
  InfographicPanel,
  create_text_maker_component,
  WrappedNivoPie,
} from "../../shared.js";

import text from "./perspective_text.yaml";

const { Select } = util_components;

const { text_maker, TM } = create_text_maker_component(text);

const col = "{{planning_year_1}}";

const sum_a_tag_col = (tag, table, col) =>
  _.chain(tag.programs)
    .map((p) => table.programs.get(p))
    .flatten()
    .compact()
    .filter(col)
    .map(col)
    .reduce((acc, amt) => acc + amt, 0)
    .value();

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

    const { tag: active_tag, amount: active_tag_exp } = tag_exps[
      active_tag_index
    ];

    const color_scale = infobase_colors();

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
      <div className="grid-row">
        <div
          className="lg-grid-panel50"
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
          className="lg-grid-panel50"
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
                style={{ width: "100%" }}
              />
            </div>
          )}
          <WrappedNivoPie
            data={data}
            colorBy={(obj) => color_scale(obj.label)}
          />
        </div>
      </div>
    );
  }
}

//spending in tag perspective also included
export const declare_spending_in_tag_perspective_panel = () =>
  declare_panel({
    panel_key: "spending_in_tag_perspective",
    levels: ["program"],
    panel_config_func: (level, panel_key) => ({
      depends_on: ["programSpending"],
      calculate(subject, options) {
        if (window.is_a11y_mode) {
          //turn off this panel in a11y mode
          return false;
        }
        if (subject.is_dead) {
          return false;
        }
        const { programSpending } = this.tables;
        //analysis: as of writing this (oct 2016) the max number of tags encountered is 13.
        const prog_row = _.first(programSpending.programs.get(subject));

        if (!prog_row || !(prog_row[col] > 0)) {
          return false;
        }

        const prog_exp = prog_row["{{planning_year_1}}"];

        const tags = subject.tags;

        const tag_exps = _.map(tags, (tag) => ({
          tag,
          amount: sum_a_tag_col(tag, programSpending, col),
        }));
        return { tag_exps, prog_exp };
      },

      render({ calculations, footnotes, sources }) {
        const { panel_args, subject } = calculations;

        const { tag_exps, prog_exp } = panel_args;

        return (
          <InfographicPanel
            title={text_maker("program_spending_in_tag_perspective_title")}
            {...{ footnotes, sources }}
          >
            <SpendInTagPerspective
              tag_exps={tag_exps}
              subject={subject}
              prog_exp={prog_exp}
            />
          </InfographicPanel>
        );
      },
    }),
  });
