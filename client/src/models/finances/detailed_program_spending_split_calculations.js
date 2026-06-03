import { sum } from "d3-array";
import _ from "lodash";

import { businessConstants } from "src/models/businessConstants";
import { get_footnotes_by_subject_and_topic } from "src/models/footnotes/footnotes";
import { Program } from "src/models/subjects";
import { year_templates } from "src/models/years";

import { get_sobj_label } from "./sobj_utils";
import { program_spending_rows_to_table_rows } from "./program_finance_utils";

const { std_years } = year_templates;
const { sos } = businessConstants;

const footnote_topics = ["PROG", "SOBJ"];
const pa_last_year_field = "pa_last_year";

export function calculate_detailed_program_spending_split_from_finance_data(
  subject,
  finance_data,
  { text_maker }
) {
  const program_sobjs = finance_data.program_sobjs || [];

  if (_.isEmpty(program_sobjs)) {
    return false;
  }

  const flat_data = _.chain(program_sobjs)
    .filter((row) => row?.program_id)
    .map((row) => {
      const program = Program.store.lookup(row.program_id);
      const so_num = row.so_num;
      return {
        program,
        so_num,
        so_label: get_sobj_label(so_num),
        value: row[pa_last_year_field] || 0,
      };
    })
    .value();

  if (_.isEmpty(flat_data)) {
    return false;
  }

  const top_3_so_nums = _.chain(flat_data)
    .compact()
    .groupBy("so_num")
    .toPairs()
    .map(([so_num, group]) => ({
      so_num: +so_num,
      sum: sum(group, _.property("value")),
    }))
    .sortBy("sum")
    .reverse()
    .map("so_num")
    .take(3)
    .value();

  const higher_level_mapping = (so_num) => {
    if (+so_num > 19) {
      return text_maker("revenues");
    }
    if (_.includes(top_3_so_nums, +so_num)) {
      return sos[+so_num].text;
    }
    return text_maker("other_sos");
  };

  const exp_years = _.map(std_years, (yr) => yr + "exp");
  const processed_spending_data = _.chain(
    program_spending_rows_to_table_rows(finance_data.program_spending)
  )
    .map((row) => ({
      label: row.prgm,
      data: exp_years.map((exp_year) => row[exp_year] || 0),
      active: false,
    }))
    .filter(({ data }) => _.some(data))
    .sortBy((x) => -sum(x.data))
    .value();

  const in_year_prog_count = _.filter(processed_spending_data, ({ data }) =>
    _.last(data)
  ).length;

  const in_year_top_2_programs = _.chain(processed_spending_data)
    .sortBy(({ data }) => _.last(data))
    .takeRight(2)
    .reverse()
    .value();

  const text_calculations = {
    subject,
    in_year_prog_count,
    ..._.chain(in_year_top_2_programs)
      .flatMap(({ label, data }, ix) => [
        [`top_${ix + 1}_prgm_name`, label],
        [`top_${ix + 1}_prgm_amt`, _.last(data)],
      ])
      .fromPairs()
      .value(),
  };

  const program_footnotes = _.chain(flat_data)
    .map(({ program }) => program)
    .uniqBy((program) => program.activity_code)
    .flatMap((program) =>
      get_footnotes_by_subject_and_topic(program, [
        ...footnote_topics,
        "EXP",
      ])
    )
    .filter()
    .value();

  return {
    text_calculations,
    top_3_so_nums,
    flat_data,
    higher_level_mapping,
    processed_spending_data,
    program_footnotes,
  };
}
