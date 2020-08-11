import text from "./dynamic_footnotes.yaml";

import { Gov, Dept, CRSO, Program } from "../organizational_entities.js";
import { actual_to_planned_gap_year, fiscal_year_to_year } from "../years.js";
import { result_docs_in_tabling_order } from "../results.js";
import { create_text_maker } from "../text.js";

const all_subject_classes = [Gov, Dept, CRSO, Program];
const text_maker = create_text_maker(text);

const expand_dept_cr_and_programs = (dept) => [
  dept,
  ...dept.crsos,
  ...dept.programs,
];

const get_dynamic_footnotes = () => {
  const gap_year_footnotes = _.map(
    all_subject_classes,
    (subject_class) =>
      actual_to_planned_gap_year && {
        subject: subject_class,
        topic_keys: ["EXP", "PLANNED_EXP"],
        text: text_maker("gap_year_warning", {
          gap_year: actual_to_planned_gap_year,
        }),
        year1: fiscal_year_to_year(actual_to_planned_gap_year),
      }
  );

  const late_result_or_resource_footnotes = _.flatMap(
    ["results", "resources"],
    (result_or_resource) => {
      const late_org_property = `late_${result_or_resource}_orgs`;

      const docs_with_late_orgs = _.chain(result_docs_in_tabling_order)
        .clone() // ...reverse mutates, clone first!
        .reverse()
        .filter((doc) => doc[late_org_property].length > 0)
        .value();

      const gov_footnotes = _.map(
        docs_with_late_orgs,
        ({ [late_org_property]: late_orgs, doc_type, year }) => ({
          subject: Gov,
          topic_keys:
            result_or_resource === "resources"
              ? ["PLANNED_EXP", "DP_EXP"]
              : [`${_.toUpper(doc_type)}_RESULTS`],
          text: `<p>
            ${text_maker(`late_${result_or_resource}_warning_gov`, {
              result_doc_name: text_maker(`${doc_type}_name`, { year }),
            })}
            </p>
            <ul>
            ${_.reduce(
              late_orgs,
              (elements, org_id) =>
                `${elements}<li>${Dept.lookup(org_id).name}</li>`,
              ""
            )}
            </ul>`,
          year1: fiscal_year_to_year(year),
        })
      );

      const dept_footnotes = _.flatMap(
        docs_with_late_orgs,
        ({ [late_org_property]: late_orgs, doc_type, year }) =>
          _.chain(late_orgs)
            .map(Dept.lookup)
            .flatMap(expand_dept_cr_and_programs)
            .map(
              (subject) =>
                actual_to_planned_gap_year && {
                  subject,
                  topic_keys: [`${_.toUpper(doc_type)}_RESULTS`],
                  text: text_maker(
                    `late_${result_or_resource}_warning_${subject.level}`,
                    {
                      result_doc_name: text_maker(`${doc_type}_name`, { year }),
                    }
                  ),
                  year1: fiscal_year_to_year(year),
                }
            )
            .value()
      );

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

export { get_dynamic_footnotes };
