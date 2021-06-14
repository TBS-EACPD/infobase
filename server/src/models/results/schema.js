import _ from "lodash";

import { first_true_promise } from "../general_utils.js";
import { bilingual_field } from "../schema_utils.js";

import { drr_docs, dp_docs } from "./results_common.js";

const schema = `
  extend type Root {
    indicator(id: String): Indicator
  }
  
  extend type Gov {
    all_target_counts_summary: [AllDocResultCount]
    all_target_counts_granular: [AllDocResultCount]
    target_counts(doc: String): ResultCount
  }

  extend type Org {
    target_counts(doc: String): ResultCount
    has_results: Boolean
  }

  extend type Crso {
    target_counts(doc: String): ResultCount
    results(doc:String): [Result]
    has_results: Boolean
  }

  extend type Program {
    target_counts(doc: String): ResultCount
    results(doc: String): [Result]
    # special departmental results to which this programs 'contributes' to
    drs: [Result]
    pidrlinks: [PIDRLink]
    has_results: Boolean
  }

  type AllDocResultCount {
    subject_id: String
    level: String

${_.reduce(
  drr_docs,
  (drr_fields, drr_doc) => `${drr_fields}
    ${drr_doc}_results: Int
    ${drr_doc}_indicators_met: Int
    ${drr_doc}_indicators_not_available: Int
    ${drr_doc}_indicators_not_met: Int
    ${drr_doc}_indicators_future: Int
    `,
  ""
)}

${_.reduce(
  dp_docs,
  (dp_fields, dp_doc) => `${dp_fields}
    ${dp_doc}_results: Int
    ${dp_doc}_indicators: Int
    `,
  ""
)}
  }

  type ResultCount {
    doc: String

    results: Int

    indicators_dp: Int

    indicators_met: Int 
    indicators_not_available: Int
    indicators_not_met: Int
    indicators_future: Int
  }

  type Result {
    id: String
    stable_id: String
    parent_id: String
    name: String
    doc: String
    indicators(doc: String): [Indicator]
  }

  type Indicator {
    id: String
    stable_id: String
    result_id: String
    name: String
    doc: String
    
    target_year: String
    target_month: String

    target_type: String
    target_min: String
    target_max: String
    target_narrative: String
    measure: String
    seeking_to: String
    target_change: String

    previous_year_target_type: String
    previous_year_target_min: String
    previous_year_target_max: String
    previous_year_target_narrative: String
    previous_year_measure: String
    previous_year_seeking_to: String
    previous_year_target_change: String

    target_explanation: String
    result_explanation: String

    actual_result: String
    
    status_key: String

    methodology: String    
  }

  # this is a graphql anti-pattern but fits in the existing client stores nicely
  type PIDRLink {
    program_id: String
    result_id: String
  }
`;

export default function ({ models, loaders }) {
  const { Org, Crso, Program, Result, ResultCount, Indicator, PIDRLink } =
    models;

  const {
    prog_dept_code_loader,
    crso_from_deptcode_loader,
    prog_crso_id_loader,

    result_by_subj_loader,
    indicator_by_result_loader,
    program_link_loader,
    indicator_id_loader,
  } = loaders;

  async function get_all_target_counts(levels) {
    return await ResultCount.find({ level: { $in: levels } });
  }

  async function get_gov_target_counts(doc) {
    const orgs = await Org.find({});

    return await get_org_target_counts(orgs, doc);
  }

  //this should take 6 DB queries, but the first 2 can be done in paralel
  async function get_org_target_counts(orgs, doc) {
    const dept_codes = _.chain(orgs).map("dept_code").compact().value();

    if (_.isEmpty(dept_codes)) {
      return null;
    }

    const [crsos, progs] = await Promise.all([
      crso_from_deptcode_loader.loadMany(dept_codes),
      prog_dept_code_loader.loadMany(dept_codes),
    ]);

    return await get_target_counts(
      _.uniq([
        ..._.chain(crsos).flatten().map("crso_id").filter().value(),
        ..._.chain(progs).flatten().map("program_id").filter().value(),
      ]),
      doc
    );
  }

  async function get_target_counts(cr_or_program_ids, doc) {
    // turns [ [ { [attr]: val, ... }, undef ... ], undef ... ] into [ val, ... ] w/out undefs
    const flatmap_to_attr = (list_of_lists, attr) =>
      _.chain(list_of_lists).compact().flatten().map(attr).compact().value();

    const results = await result_by_subj_loader.loadMany(cr_or_program_ids);

    const all_indicators = await indicator_by_result_loader.loadMany(
      flatmap_to_attr(results, "result_id")
    );

    const doc_indicators = _.chain(all_indicators)
      .flatten()
      .filter({ doc })
      .value();

    return _.defaults(
      {
        ..._.chain(doc_indicators)
          .countBy("status_key")
          .mapKeys((value, key) => `indicators_${key}`)
          .value(),
        results: _.chain(results).compact().flatten().filter({ doc }).value()
          .length,
        doc: doc,
      },
      {
        results: 0,

        indicators_dp: 0,

        indicators_met: 0,
        indicators_not_available: 0,
        indicators_not_met: 0,
        indicators_future: 0,
      }
    );
  }

  async function get_results(subject, { doc }) {
    let id_val;
    if (subject instanceof Crso) {
      id_val = subject.crso_id;
    } else if (subject instanceof Program) {
      id_val = subject.program_id;
    } else {
      throw new Error("bad subject");
    }
    let records = await result_by_subj_loader.load(id_val);

    if (doc) {
      records = _.filter(records, { doc });
    }
    return records;
  }

  const subject_has_results = async (subject_id) => {
    const has_result = await ResultCount.findOne({ subject_id: subject_id });
    return !_.isNull(has_result);
  };
  const crso_has_results = async (crso_id) => {
    const crso_has_own_results = await ResultCount.findOne({
      subject_id: crso_id,
    });

    if (!_.isNull(crso_has_own_results)) {
      return true;
    } else {
      const programs = await prog_crso_id_loader.load(crso_id);

      return first_true_promise(
        _.map(programs, ({ program_id }) => subject_has_results(program_id))
      );
    }
  };

  const resolvers = {
    Root: {
      indicator: (_x, { id }) => indicator_id_loader.load(id),
    },
    Gov: {
      all_target_counts_summary: () => get_all_target_counts(["all", "dept"]),
      all_target_counts_granular: () =>
        get_all_target_counts(["crso_or_program"]),
      target_counts: (_x, { doc }) => get_gov_target_counts(doc),
    },
    Org: {
      target_counts: (org, { doc }) => get_org_target_counts(org, doc),
      has_results: ({ org_id }) => subject_has_results(org_id),
    },
    Crso: {
      results: get_results,
      target_counts: ({ crso_id }, { doc }) =>
        get_target_counts([crso_id], doc),
      has_results: ({ crso_id }) => crso_has_results(crso_id),
    },
    Program: {
      results: get_results,
      drs: ({ program_id }) => program_link_loader.load(program_id),
      pidrlinks: async ({ program_id }) => {
        const linked_results = await program_link_loader.load(program_id);
        return _.map(linked_results, ({ result_id }) => ({
          program_id,
          result_id,
        }));
      },
      target_counts: ({ program_id }, { doc }) =>
        get_target_counts([program_id], doc),
      has_results: ({ program_id }) => subject_has_results(program_id),
    },
    Result: {
      id: _.property("result_id"),
      indicators: async (result, { doc }) => {
        let records = await indicator_by_result_loader.load(result.result_id);

        if (doc) {
          records = _.filter(records, { doc });
        }
        return records;
      },
      name: bilingual_field("name"),
    },
    Indicator: {
      id: _.property("indicator_id"),
      name: bilingual_field("name"),
      target_explanation: bilingual_field("target_explanation"),
      result_explanation: bilingual_field("result_explanation"),
      target_narrative: bilingual_field("target_narrative"),
      previous_year_target_narrative: bilingual_field(
        "previous_year_target_narrative"
      ),
      actual_result: bilingual_field("actual_result"),
      methodology: bilingual_field("methodology"),
      measure: bilingual_field("measure"),
      previous_year_measure: bilingual_field("previous_year_measure"),
    },
  };

  return { schema, resolvers };
}
