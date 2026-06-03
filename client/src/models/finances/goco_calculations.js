import _ from "lodash";

import { ProgramTag } from "src/models/subjects";

import { sum_field_for_program_ids } from "./finance_utils";

const spend_field = "pa_last_year_exp";
const fte_field = "pa_last_year";

export function calculate_gocographic_from_finance_data(
  finance_data,
  { spending_text, ftes_text, sa_text }
) {
  const program_spending = finance_data.program_spending || [];
  const program_fte = finance_data.program_fte || [];
  const gocos_by_spendarea = ProgramTag.tag_roots_by_id["GOCO"].children_tags;

  const sum_goco_spending = (goco) =>
    sum_field_for_program_ids(
      program_spending,
      _.map(goco.programs, "id"),
      spend_field
    );

  const sum_goco_fte = (goco) =>
    sum_field_for_program_ids(
      program_fte,
      _.map(goco.programs, "id"),
      fte_field
    );

  const total_fte_spend = _.reduce(
    gocos_by_spendarea,
    (result, sa) => {
      result[sa.id] = _.reduce(
        sa.children_tags,
        (child_result, goco) => {
          child_result.total_child_spending += sum_goco_spending(goco);
          child_result.total_child_ftes += sum_goco_fte(goco);
          return child_result;
        },
        {
          total_child_spending: 0,
          total_child_ftes: 0,
        }
      );
      result.total_spending += result[sa.id].total_child_spending;
      result.total_ftes += result[sa.id].total_child_ftes;
      return result;
    },
    {
      total_spending: 0,
      total_ftes: 0,
    }
  );

  const graph_data = _.chain(gocos_by_spendarea)
    .map((sa) => {
      const children = _.map(sa.children_tags, (goco) => {
        const actual_spending = sum_goco_spending(goco);
        const actual_ftes = sum_goco_fte(goco);
        return {
          label: goco.name,
          actual_spending: actual_spending || 0,
          actual_ftes: actual_ftes || 0,
          [spending_text]:
            actual_spending / total_fte_spend[sa.id].total_child_spending ||
            0,
          [ftes_text]:
            actual_ftes / total_fte_spend[sa.id].total_child_ftes || 0,
        };
      });
      return {
        label: sa.name,
        actual_spending: total_fte_spend[sa.id].total_child_spending || 0,
        actual_ftes: total_fte_spend[sa.id].total_child_ftes || 0,
        [spending_text]:
          total_fte_spend[sa.id].total_child_spending /
            total_fte_spend.total_spending || 0,
        [ftes_text]:
          total_fte_spend[sa.id].total_child_ftes / total_fte_spend.total_ftes ||
          0,
        children: _.sortBy(children, (d) => -d[spending_text]),
      };
    })
    .sortBy((d) => -d[spending_text])
    .value();

  const tick_map = _.reduce(
    gocos_by_spendarea,
    (final_result, sa) => {
      const sa_href_result = _.reduce(
        sa.children_tags,
        (child_result, goco) => {
          child_result[`${goco.name}`] = `#infographic/tag/${goco.id}`;
          return child_result;
        },
        {}
      );
      return _.assignIn(sa_href_result, final_result);
    },
    {}
  );

  const maxSpending = _.maxBy(graph_data, spending_text);
  const spend_fte_text_data = {
    ...total_fte_spend,
    max_sa: maxSpending.label,
    max_sa_share: maxSpending.actual_spending / total_fte_spend.total_spending,
  };

  const parent_table_data = _.map(gocos_by_spendarea, (sa) => ({
    [sa_text]: sa.name,
    [spending_text]: total_fte_spend[sa.id].total_child_spending,
    [ftes_text]: total_fte_spend[sa.id].total_child_ftes,
  }));

  const child_tables = _.map(gocos_by_spendarea, (sa) => ({
    key: sa.name,
    data: _.map(sa.children_tags, (goco) => ({
      [sa_text]: goco.name,
      [spending_text]: sum_goco_spending(goco),
      [ftes_text]: sum_goco_fte(goco),
    })),
  }));

  return {
    graph_data,
    total_fte_spend,
    spend_fte_text_data,
    tick_map,
    gocos_by_spendarea,
    parent_table_data,
    child_tables,
    spending_text,
    ftes_text,
  };
}
