import _ from "lodash";

import { result_docs_in_tabling_order } from "src/models/results";
import { Gov, Dept, class_subject_types } from "src/models/subjects";
import { create_text_maker, run_template } from "src/models/text";
import {
  actual_to_planned_gap_year,
  fiscal_year_to_year,
} from "src/models/years";

import type { FootNoteDef, TopicKey } from "./footnotes";

import text from "./dynamic_footnotes.yaml";

const text_maker = create_text_maker(text);

// late DRR resources (FTE only) can happen pre-DRR if the PA tabling is early...
// list late orgs in this mock results doc object to get the requisite footnotes showing up
// in the meantime
// TODO should belong to results code
export const PRE_DRR_PUBLIC_ACCOUNTS_LATE_FTE_MOCK_DOC = {
  doc_type: "drr",
  year: run_template("{{pa_last_year}}"),
  late_results_orgs: [] as string[],
  late_resources_orgs: [] as string[],
};

const expand_dept_cr_and_programs = (dept: InstanceType<typeof Dept>) => [
  dept,
  ...dept.crsos,
  ...dept.programs,
];

export const get_dynamic_footnote_definitions = (): FootNoteDef[] => {
  const gap_year_footnotes = actual_to_planned_gap_year
    ? _.chain(class_subject_types)
        .map(
          (subject_type): FootNoteDef => ({
            id: _.uniqueId("gap_year_warning"),
            subject_type,
            subject_id: subject_type === "gov" ? Gov.instance.id : "*",
            topic_keys: ["EXP", "PLANNED_EXP"],
            text: text_maker("gap_year_warning", {
              gap_year: actual_to_planned_gap_year,
            }),
            year1: fiscal_year_to_year(actual_to_planned_gap_year) || undefined,
          })
        )
        .compact()
        .value()
    : [];

  const late_result_or_resource_footnotes = _.flatMap(
    ["results", "resources"],
    (result_or_resource) => {
      const get_topic_keys_for_doc_type = (
        doc_type: "dp" | "drr"
      ): TopicKey[] => {
        if (
          result_or_resource === "results" &&
          _.includes(["dp", "drr"], doc_type)
        ) {
          return [doc_type === "dp" ? "DP" : "DRR"];
        } else {
          if (doc_type === "dp") {
            return ["PLANNED_EXP", "DP_EXP", "PLANNED_FTE", "DP_FTE"];
          } else if (doc_type === "drr") {
            return ["FTE", "DRR_FTE"];
          } else {
            // TODO should be able to clean this up more once results dependencies are well typed. This should never be reachable
            throw new Error(
              `"${doc_type}" is not a valid results document type. Expect "dp" or "drr"`
            );
          }
        }
      };

      const get_text_key_for_doc_type_and_subject_type = (
        doc_type: "dp" | "drr",
        subject_type: string
      ) => {
        const warning_topic =
          result_or_resource === "results"
            ? "results"
            : `${doc_type === "dp" ? "planned" : "actual"}_resources`;

        return `late_${warning_topic}_warning_${subject_type}`;
      };

      const late_org_property = `late_${result_or_resource}_orgs`;
      const docs_with_late_orgs = _.chain(result_docs_in_tabling_order)
        .clone() // ...reverse mutates, clone first!
        .reverse()
        .concat(PRE_DRR_PUBLIC_ACCOUNTS_LATE_FTE_MOCK_DOC)
        .filter((doc) => doc[late_org_property].length > 0)
        .value();

      // might make more sense for this validation to happen for results doc configs in /models/results.js, but
      // for now doing it here to catch exempt orgs in PRE_DRR_PUBLIC_ACCOUNTS_LATE_FTE_MOCK_DOC too. TODO, maybe
      // move PRE_DRR_PUBLIC_ACCOUNTS_LATE_FTE_MOCK_DOC in to the results models file, apply (some of) the results
      // config validation to it? A little hacky either way
      const EXEMPT_ORGS = ["151"];
      const docs_with_late_expempt_orgs = _.chain(docs_with_late_orgs)
        .map(({ [late_org_property]: late_orgs, doc_type, year }) => ({
          late_orgs,
          doc_type,
          year,
        }))
        .filter(
          ({ late_orgs }) =>
            !_.chain(late_orgs).intersection(EXEMPT_ORGS).isEmpty().value()
        )
        .value();
      if (!_.isEmpty(docs_with_late_expempt_orgs)) {
        throw new Error(
          `Org(s) ${EXEMPT_ORGS.join(
            ", "
          )} are exempt from being considered "late" for results reporting. ` +
            `The following results doc config(s) incorrectly include one or more exempt orgs in their ${late_org_property} field: ` +
            _.chain(docs_with_late_expempt_orgs)
              .map(({ doc_type, year }) => `${doc_type} ${year}`)
              .join(", ")
              .value()
        );
      }

      const gov_footnotes = _.map(
        docs_with_late_orgs,
        ({ [late_org_property]: late_orgs, doc_type, year }) => ({
          subject_type: Gov.subject_type,
          subject_id: Gov.instance.id,
          topic_keys: get_topic_keys_for_doc_type(doc_type),
          text: `<p>
            ${text_maker(
              get_text_key_for_doc_type_and_subject_type(doc_type, "gov"),
              {
                result_doc_name: text_maker(`${doc_type}_name`, { year }),
              }
            )}
            </p>
            <ul>
            ${_.reduce(
              late_orgs,
              (elements, org_id) =>
                `${elements}<li>${Dept.store.lookup(org_id).name}</li>`,
              ""
            )}
            </ul>`,
          year1: fiscal_year_to_year(year) || undefined,
        })
      );

      const dept_footnotes = _.chain(docs_with_late_orgs)
        .flatMap(({ [late_org_property]: late_orgs, doc_type, year }) =>
          _.chain(late_orgs as string[])
            .map(Dept.store.lookup)
            .flatMap(expand_dept_cr_and_programs)
            .map((subject) => ({
              subject_type: subject.subject_type,
              subject_id: subject.id,
              topic_keys: get_topic_keys_for_doc_type(doc_type),
              text: text_maker(
                get_text_key_for_doc_type_and_subject_type(
                  doc_type,
                  subject.subject_type
                ),
                {
                  result_doc_name: text_maker(`${doc_type}_name`, { year }),
                }
              ),
              year1: fiscal_year_to_year(year) || undefined,
            }))
            .value()
        )
        .value();

      return [...gov_footnotes, ...dept_footnotes];
    }
  );

  return _.chain([...gap_year_footnotes, ...late_result_or_resource_footnotes])
    .compact()
    .map((footnote, index) => ({
      ...footnote,
      id: `dynamic_footnote_${index}`,
    }))
    .value();
};
