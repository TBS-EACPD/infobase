import _ from "lodash";

import {
  mix,
  exstensibleStoreMixin,
  PluralSingular,
  SubjectMixin,
} from "src/models/storeMixins.js";
import { trivial_text_maker } from "src/models/text.js";

const flatten_data_rows = (measures, data_type) =>
  _.flatMap(measures, (measure) =>
    _.map(measure[data_type], (row) => ({
      measure_id: measure.id,
      ...row,
    }))
  );

const summable_data_keys = ["stat", "vote", "funding"];
const row_group_reducer = (group) => {
  const keys_to_sum_over = _.chain(group)
    .first()
    .keys()
    .intersection(summable_data_keys)
    .value();

  return _.reduce(group, (memo, row) =>
    _.chain(keys_to_sum_over)
      .map((key) => [key, _.get(memo, key, 0) + _.get(row, key, 0)])
      .fromPairs()
      .value()
  );
};
const roll_up_data_by_property = (
  data_by_measure,
  roll_up_property,
  sub_group_property = null
) =>
  _.chain(data_by_measure)
    .groupBy(roll_up_property)
    .flatMap((roll_up_group, roll_up_value) =>
      _.chain(roll_up_group)
        .groupBy("fiscal_year")
        .flatMap((year_group, fiscal_year) => {
          if (sub_group_property) {
            return _.chain(year_group)
              .groupBy(sub_group_property)
              .flatMap((sub_group, sub_group_value) => ({
                [roll_up_property]: roll_up_value,
                [sub_group_property]: sub_group_value,
                fiscal_year,
                ...row_group_reducer(sub_group),
              }))
              .value();
          } else {
            return {
              [roll_up_property]: roll_up_value,
              fiscal_year,
              ...row_group_reducer(year_group),
            };
          }
        })
        .value()
    )
    .value();

class CovidMeasure extends mix().with(
  exstensibleStoreMixin,
  PluralSingular,
  SubjectMixin
) {
  static get subject_type() {
    return "covid_measure";
  }
  static get singular() {
    return trivial_text_maker("covid_measure");
  }
  static get plural() {
    return trivial_text_maker("covid_measures");
  }

  static create_and_register(measure) {
    const inst = new CovidMeasure(measure);
    this.register(measure.id, inst);
    return inst;
  }
  constructor(measure) {
    super();
    _.assign(this, {
      ...measure,
    });
  }

  static extend_with_data(measure_id, data_key, data) {
    const measure = this.lookup(measure_id);
    const extended_data_set =
      measure && measure[data_key]
        ? _.uniqBy(
            [...measure[data_key], ...data],
            ({ org_id, fiscal_year, est_doc }) =>
              `${org_id}-${fiscal_year}-${est_doc}`
          )
        : data;

    this.extend(measure_id, { [data_key]: extended_data_set });
  }

  static get_all_data_by_measure = (data_type) =>
    flatten_data_rows(this.get_all(), data_type);

  static org_lookup_data_by_measure = (data_type, org_id) =>
    _.filter(
      this.get_all_data_by_measure(data_type),
      // TODO getting org ids from API as strings, but client tends to treat them as ints... lots of gotchas waiting to happen
      ({ org_id: row_org_id }) => +row_org_id === +org_id
    );

  static gov_data_by_measure = (data_type, grouping_key = null) =>
    roll_up_data_by_property(
      this.get_all_data_by_measure(data_type),
      "measure_id",
      grouping_key
    );

  static get_all_data_by_org = (data_type, grouping_key = null) =>
    roll_up_data_by_property(
      this.get_all_data_by_measure(data_type),
      "org_id",
      grouping_key
    );
}

export { CovidMeasure };
