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

const roll_up_data_by_property = (data_by_measure, group_key, property_name) =>
  _.chain(data_by_measure)
    .groupBy(property_name)
    .flatMap((grouped_rows, group_value) =>
      _.chain(grouped_rows)
        .groupBy("fiscal_year")
        .flatMap((year_group, fiscal_year) =>
          _.chain(year_group)
            .groupBy(group_key)
            .flatMap((group, key) => ({
              [property_name]: group_value,
              [group_key]: key,
              fiscal_year,
              ..._.reduce(
                group,
                (memo, row) => ({
                  stat: memo.stat + row.stat,
                  vote: memo.vote + row.vote,
                }),
                { stat: 0, vote: 0 }
              ),
            }))
            .value()
        )
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
  static org_lookup_estimates_by_measure = (org_id) =>
    _.filter(
      this.get_all_data_by_measure("estimates"),
      ({ org_id: row_org_id }) => row_org_id === org_id
    );
  static gov_estimates_by_measure = () =>
    roll_up_data_by_property(
      this.get_all_data_by_measure("estimates"),
      "est_doc",
      "measure_id"
    );

  static get_all_data_by_org = (data_type, group_key) =>
    roll_up_data_by_property(
      this.get_all_data_by_measure(data_type),
      group_key,
      "org_id"
    );
  static org_lookup_estimates_by_org = (org_id) =>
    roll_up_data_by_property(
      this.org_lookup_estimates_by_measure(org_id),
      "est_doc",
      "org_id"
    );
}

export { CovidMeasure };
