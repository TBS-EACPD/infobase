import {
  StdPanel,
  Col,
  create_text_maker_component,
  table_common,
  declare_panel,
  WrappedNivoPie,
} from "../../shared.js";

import text from "./top_spending_areas.yaml";

const { is_non_revenue, collapse_by_so } = table_common;

const { text_maker, TM } = create_text_maker_component(text);

const common_cal = (programs, programSobjs) => {
  const cut_off_index = 3;
  const rows_by_so = collapse_by_so(programs, programSobjs, is_non_revenue);

  if (
    rows_by_so.length <= 1 ||
    _.every(rows_by_so, ({ value }) => value === 0)
  ) {
    return false;
  }

  const top_3_sos = _.take(rows_by_so, cut_off_index);
  const remainder =
    top_3_sos.length > cut_off_index - 1
      ? {
          label: text_maker("other_s"),
          value: d3.sum(_.tail(rows_by_so, cut_off_index), _.property("value")),
        }
      : [];

  return top_3_sos.concat(remainder);
};

const render_w_options = ({ text_key }) => ({
  calculations,
  footnotes,
  sources,
}) => {
  const { panel_args } = calculations;
  const { top_3_sos_and_remainder, text_calculations } = panel_args;

  const graph_data = top_3_sos_and_remainder.map((d) => ({
    label: d["label"],
    id: d["label"],
    value: d["value"],
  }));

  return (
    <StdPanel
      title={text_maker("top_spending_areas_title")}
      {...{ footnotes, sources }}
    >
      <Col isText size={5}>
        <TM k={text_key} args={text_calculations} />
      </Col>
      <Col isGraph={!window.is_a11y_mode} size={7}>
        <WrappedNivoPie data={graph_data} graph_height="450px" />
      </Col>
    </StdPanel>
  );
};

export const declare_top_spending_areas_panel = () =>
  declare_panel({
    panel_key: "top_spending_areas",
    levels: ["program"],
    panel_config_func: (level, panel_key) => ({
      depends_on: ["programSobjs"],
      footnotes: ["SOBJ"],
      calculate(subject, options) {
        if (_.isEmpty(this.tables.programSobjs.programs.get(subject))) {
          return false;
        }

        const top_3_sos_and_remainder = common_cal(
          [subject],
          this.tables.programSobjs
        );
        if (!top_3_sos_and_remainder) {
          return false;
        }

        const total_spent = _.sum(
          _.map(top_3_sos_and_remainder, (so) => so.value)
        );
        const top_so_pct = top_3_sos_and_remainder[0].value / total_spent;

        const text_calculations = {
          subject,
          top_3_sos_and_remainder,
          top_so_name: top_3_sos_and_remainder[0].label,
          top_so_spent: top_3_sos_and_remainder[0].value,
          total_spent,
          top_so_pct,
        };

        return {
          text_calculations,
          top_3_sos_and_remainder,
        };
      },
      render: render_w_options({ text_key: "program_top_spending_areas_text" }),
    }),
  });
