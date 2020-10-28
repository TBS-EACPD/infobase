import _ from "lodash";

import { budget_years } from "./budget_measures_common.js";

import { get_standard_csv_file_rows } from "../load_utils.js";

export default async function ({ models }) {
  const { FakeBudgetOrgSubject } = models;

  const get_program_allocations_by_measure_and_org_id = (
    program_allocation_rows
  ) =>
    _.chain(program_allocation_rows)
      .groupBy("measure_id")
      .mapValues((measure_program_allocation_rows) =>
        _.chain(measure_program_allocation_rows)
          .groupBy("org_id")
          .mapValues((measure_and_org_program_allocation_rows) =>
            _.chain(measure_and_org_program_allocation_rows)
              .map(({ subject_id, program_allocation }) => [
                subject_id,
                program_allocation,
              ])
              .fromPairs()
              .value()
          )
          .value()
      )
      .value();

  const flatten_documents_by_measure_and_org_id = (
    documents_by_measure_and_org_id,
    uniq_id_func,
    fields_func
  ) =>
    _.chain(documents_by_measure_and_org_id)
      .flatMap((documents_by_org_id, measure_id) =>
        _.flatMap(documents_by_org_id, (documents, org_id) =>
          _.flatMap(documents, (document, key) => ({
            unique_id: uniq_id_func(measure_id, org_id, document, key),
            ...fields_func(measure_id, org_id, document, key),
          }))
        )
      )
      .map((document) =>
        _.omitBy(
          document,
          (field_value) =>
            (_.isEmpty(field_value) &&
              (_.isArray(field_value) || _.isObject(field_value))) ||
            _.isNull(field_value)
        )
      )
      .value();

  return await Promise.all([
    FakeBudgetOrgSubject.insertMany([
      {
        org_id: "net_adjust",
        level: "special_funding_case",
        name_en: "Net adjustment to be on a 2018-19 Estimates Basis",
        name_fr: "Rajustement net selon le Budget des dépenses de 2018-2019",
        description_en: "",
        description_fr: "",
      },
      {
        org_id: "non_allocated",
        level: "special_funding_case",
        name_en: "Allocation to be determined",
        name_fr: "Affectation à determiner",
        description_en: "",
        description_fr: "",
      },
    ]),
    ..._.map(budget_years, async (budget_year) => {
      const budget_measure_data = get_standard_csv_file_rows(
        `budget_${budget_year}_measure_data.csv`
      );
      const budget_program_allocatios = get_standard_csv_file_rows(
        `budget_${budget_year}_program_allocations.csv`
      );
      const budget_lookups = get_standard_csv_file_rows(
        `budget_${budget_year}_measure_lookups.csv`
      );
      const budget_org_level_descriptions = (() => {
        try {
          return _.map(
            get_standard_csv_file_rows(
              `budget_${budget_year}_org_level_measure_descriptions.csv`
            ),
            (row) => ({
              ...row,
              ..._.chain(["en", "fr"])
                .map((lang) => [
                  `description_${lang}`,
                  row[`description_${lang}`].replace(/^-/, "*"),
                ])
                .fromPairs()
                .value(),
            })
          );
        } catch (error) {
          console.log(error);
          return [];
        }
      })();

      const { true: measure_lookups, false: submeasure_lookups } = _.chain(
        budget_lookups
      )
        .map((budget_lookup) => ({
          ...budget_lookup,
          description_en: budget_lookup.description_en || "",
          description_fr: budget_lookup.description_fr || "",
        }))
        .groupBy(({ parent_measure_id }) => !parent_measure_id)
        .value();

      const submeasure_ids = _.map(submeasure_lookups, "measure_id");
      const submeasure_ids_by_parent_measure = _.chain(submeasure_lookups)
        .groupBy("parent_measure_id")
        .mapValues((submeasures) => _.map(submeasures, "measure_id"))
        .value();

      // In the csv, parent measures do NOT contain the allocated, withheld, and program allocation values of their submeasures (I gather
      // that's done so, in the open data set, people summing by columns readily see the correct totals). That means, before loading the csv data
      // in to the database, we have to go around rolling up the submeasure values in to their parents.
      // Because we do that here, in the final model, submeasures don't have values that contribute to the total; they just represent granular breakouts of
      // certain real measures.
      const { true: measure_data, false: submeasure_data } = _.chain(
        budget_measure_data
      )
        .map(
          ({
            measure_id,
            org_id,
            funding,
            allocated,
            withheld,
            remaining,
            ...program_columns
          }) => ({
            measure_id,
            org_id,
            funding: +funding,
            allocated: +allocated,
            withheld: +withheld,
            remaining: +remaining,
          })
        )
        .groupBy(({ measure_id }) => !_.includes(submeasure_ids, measure_id))
        .value();

      const {
        true: direct_program_allocations,
        false: submeasure_program_allocations,
      } = _.chain(budget_program_allocatios)
        .map(({ measure_id, org_id, subject_id, program_allocation }) => ({
          measure_id,
          org_id,
          subject_id,
          program_allocation: +program_allocation,
        }))
        .groupBy(({ measure_id }) => !_.includes(submeasure_ids, measure_id))
        .value();

      const submeasure_ids_by_parent_measure_and_org_id = _.mapValues(
        submeasure_ids_by_parent_measure,
        (submeasure_ids) =>
          _.chain(submeasure_data)
            .filter(({ measure_id }) => _.includes(submeasure_ids, measure_id))
            .groupBy("org_id")
            .mapValues((submeasures) => _.map(submeasures, "measure_id"))
            .value()
      );

      const direct_program_allocations_by_measure_and_org_id = get_program_allocations_by_measure_and_org_id(
        direct_program_allocations
      );
      const submeasure_program_allocations_by_submeasure_and_org_id = get_program_allocations_by_measure_and_org_id(
        submeasure_program_allocations
      );

      const program_allocations_by_measure_and_org_id = _.chain(measure_data)
        .groupBy("measure_id")
        .mapValues((rows_for_measure_id, measure_id) =>
          _.chain(rows_for_measure_id)
            .groupBy("org_id")
            .mapValues((measure_data, org_id) => {
              const direct_program_allocations = _.get(
                direct_program_allocations_by_measure_and_org_id,
                `${measure_id}.${org_id}`
              );

              const submeasure_ids = _.get(
                submeasure_ids_by_parent_measure_and_org_id,
                `${measure_id}.${org_id}`
              );
              const submeasure_program_allocations = _.map(
                submeasure_ids,
                (submeasure_id) =>
                  _.get(
                    submeasure_program_allocations_by_submeasure_and_org_id,
                    `${submeasure_id}.${org_id}`
                  )
              );

              if (
                !_.isEmpty(direct_program_allocations) &&
                !_.isEmpty(submeasure_program_allocations)
              ) {
                return _.chain(direct_program_allocations)
                  .cloneDeep()
                  .mergeWith(
                    ...submeasure_program_allocations,
                    (
                      program_allocation_ammount,
                      submeasure_allocation_ammount
                    ) =>
                      (program_allocation_ammount || 0) +
                      submeasure_allocation_ammount
                  )
                  .value();
              } else {
                return {
                  ...direct_program_allocations,
                  ..._.mergeWith(
                    {},
                    ...submeasure_program_allocations,
                    (
                      program_allocation_ammount,
                      submeasure_allocation_ammount
                    ) =>
                      (program_allocation_ammount || 0) +
                      submeasure_allocation_ammount
                  ),
                };
              }
            })
            .value()
        )
        .value();

      const flatten_program_allocations_by_measure_and_org_id = (
        program_allocations_by_measure_and_org_id
      ) =>
        flatten_documents_by_measure_and_org_id(
          program_allocations_by_measure_and_org_id,
          (measure_id, org_id, document, key) =>
            `${budget_year}-${measure_id}-${org_id}-${key}`,
          (measure_id, org_id, document, key) => ({
            subject_id: key,
            measure_id,
            org_id,

            allocated: document,
          })
        );

      const submeasures_by_measure_and_org_id = _.mapValues(
        submeasure_ids_by_parent_measure_and_org_id,
        (submeasure_data_by_org_id, parent_measure_id) =>
          _.mapValues(submeasure_data_by_org_id, (submeasure_ids, org_id) =>
            _.map(submeasure_ids, (submeasure_id) => ({
              submeasure_id,
              parent_measure_id,
              org_id,
              ..._.chain(submeasure_data)
                .find({ measure_id: submeasure_id, org_id })
                .pick(["allocated", "withheld"])
                .value(),
            }))
          )
      );
      const flatten_submeasures_by_measure_and_org_id = (
        submeasures_by_measure_and_org_id
      ) =>
        flatten_documents_by_measure_and_org_id(
          submeasures_by_measure_and_org_id,
          (measure_id, org_id, document, key) =>
            `${budget_year}-${measure_id}-${org_id}-${document.submeasure_id}`,
          (measure_id, org_id, document, key) => ({
            ...document,

            ..._.chain(submeasure_lookups)
              .find(
                (submeasure_lookup) =>
                  submeasure_lookup.measure_id === document.submeasure_id &&
                  submeasure_lookup.parent_measure_id === measure_id
              )
              .pick(["name_en", "name_fr"])
              .value(),

            program_allocations: flatten_program_allocations_by_measure_and_org_id(
              {
                [document.submeasure_id]: {
                  [org_id]: _.get(
                    submeasure_program_allocations_by_submeasure_and_org_id,
                    `${document.submeasure_id}.${org_id}`
                  ),
                },
              }
            ),
          })
        );

      const data_by_measure_and_org_id = _.chain(measure_data)
        .map(
          ({ measure_id, org_id, funding, allocated, withheld, remaining }) => {
            const submeasures = _.get(
              submeasures_by_measure_and_org_id,
              `${measure_id}.${org_id}`
            );

            const allocated_to_submeasures = _.reduce(
              submeasures,
              (sum, { allocated }) => sum + allocated,
              0
            );

            const withheld_through_submeasures = _.reduce(
              submeasures,
              (sum, { withheld }) => sum + withheld,
              0
            );

            const descriptions = _.chain(budget_org_level_descriptions)
              .find(
                (budget_description_row) =>
                  budget_description_row.measure_id === measure_id &&
                  budget_description_row.org_id === org_id
              )
              .pick(["description_en", "description_fr"])
              .value();

            return {
              measure_id,
              org_id,
              funding,
              allocated: allocated + allocated_to_submeasures,
              withheld: withheld + withheld_through_submeasures,
              remaining,
              ...descriptions,
            };
          }
        )
        .groupBy("measure_id")
        .mapValues((measure_rows) => _.groupBy(measure_rows, "org_id"))
        .value();
      const flatten_data_by_measure_and_org_id = (data_by_measure_and_org_id) =>
        flatten_documents_by_measure_and_org_id(
          data_by_measure_and_org_id,
          (measure_id, org_id, document, key) =>
            `${budget_year}-${measure_id}-${org_id}`,
          (measure_id, org_id, document, key) => ({
            ..._.omit(document, "parent_measure_id"),

            program_allocations: flatten_program_allocations_by_measure_and_org_id(
              {
                [measure_id]: {
                  [org_id]: _.get(
                    program_allocations_by_measure_and_org_id,
                    `${measure_id}.${org_id}`
                  ),
                },
              }
            ),

            submeasure_breakouts: flatten_submeasures_by_measure_and_org_id({
              [measure_id]: {
                [org_id]: _.get(
                  submeasures_by_measure_and_org_id,
                  `${measure_id}.${org_id}`
                ),
              },
            }),
          })
        );

      const budget_measures = _.map(measure_lookups, (measure) => ({
        ...measure,

        data: flatten_data_by_measure_and_org_id({
          [measure.measure_id]: {
            ...data_by_measure_and_org_id[measure.measure_id],
          },
        }),
      }));
      const subjects_with_budget_measures = _.chain(budget_measures)
        .flatMap((budget_measure) =>
          _.flatMap(budget_measure.data, ({ org_id, program_allocations }) => [
            org_id,
            ..._.map(program_allocations, "subject_id"),
          ])
        )
        .uniq()
        .map((subject_id) => ({ subject_id }))
        .value();
      return [
        models[`Budget${budget_year}Measure`].insertMany(budget_measures),
        models[`SubjectsWithBudget${budget_year}Measure`].insertMany(
          subjects_with_budget_measures
        ),
      ];
    }),
  ]);
}
