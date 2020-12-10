import _ from "lodash";

import {
  mix,
  exstensibleStoreMixin,
  PluralSingular,
  SubjectMixin,
} from "src/models/storeMixins.js";
import { trivial_text_maker } from "src/models/text.js";

const flatten_estimates_rows = (measures) =>
  _.flatMap(measures, ({ id: measure_id, estimates }) =>
    _.map(estimates, (estimate_row) => ({
      measure_id,
      ...estimate_row,
    }))
  );

const roll_up_estimates_by_property = (estimates_by_measure, property_name) =>
  _.chain(estimates_by_measure)
    .groupBy(property_name)
    .flatMap((grouped_rows, group_value) =>
      _.chain(grouped_rows)
        .groupBy("fiscal_year")
        .flatMap((year_group, fiscal_year) =>
          _.chain(year_group)
            .groupBy("est_doc")
            .flatMap((doc_group, est_doc) => ({
              [property_name]: group_value,
              est_doc,
              fiscal_year,
              ..._.reduce(
                doc_group,
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

  static extend_with_estimates(measure_id, estimates) {
    const measure = this.lookup(measure_id);
    const new_estimates_set =
      measure && measure.estimates
        ? _.uniqBy(
            [...estimates, ...measure.estimates],
            ({ org_id, fiscal_year, est_doc }) =>
              `${org_id}-${fiscal_year}-${est_doc}`
          )
        : estimates;

    this.extend(measure_id, { estimates: new_estimates_set });
  }

  static get_all_estimates_by_measure = () =>
    flatten_estimates_rows(this.get_all());
  static org_lookup_estimates_by_measure = (org_id) =>
    _.filter(
      this.get_all_estimates_by_measure(),
      ({ org_id: row_org_id }) => row_org_id === org_id
    );
  static gov_estimates_by_measure = () =>
    roll_up_estimates_by_property(
      this.get_all_estimates_by_measure(),
      "measure_id"
    );

  static get_all_estimates_by_org = () =>
    roll_up_estimates_by_property(
      this.get_all_estimates_by_measure(),
      "org_id"
    );
  static org_lookup_estimates_by_org = (org_id) =>
    roll_up_estimates_by_property(
      this.org_lookup_estimates_by_measure(org_id),
      "org_id"
    );
}

export { CovidMeasure };
