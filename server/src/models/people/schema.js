import {
  camel_case_headcount_model_names,
  snake_case_headcount_model_names,
} from "./headcount_model_utils.js";

const _ = require("lodash");

const { people_years } = require("../constants.js");


const common_org_and_gov_queries = `
  employee_type_data(dimension: Type = all_dimensions): HeadcountData
  employee_type_info: EmployeeTypeInfo
  employee_region_data(dimension: Region = all_dimensions): HeadcountData
  employee_age_group_data(dimension: AgeGroup = all_dimensions): HeadcountData
  employee_ex_lvl_data(dimension: ExLvl = all_dimensions): HeadcountData
  employee_gender_data(dimension: Gender = all_dimensions): HeadcountData
  employee_fol_data(dimension: Fol = all_dimensions): HeadcountData
`;

const schema = `
  extend type Org {
    ${common_org_and_gov_queries}
  }
  extend type Gov {
    ${common_org_and_gov_queries}
  }

  enum Type {
    all_dimensions
    cas
    ind
    na
    stu
    ter
  }
  enum Region {
    all_dimensions
    ab
    bc
    mb
    nt
    ncr
    nb
    nl
    ns
    nu
    onlessncr
    abroad
    pe
    qclessncr
    sk
    na
    yt
  }
  enum AgeGroup {
    all_dimensions
    age20less
    age20to24
    age25to29
    age30to34
    age35to39
    age40to44
    age45to49
    age50to54
    age55to59
    age60to64
    age65plus
    na
  }
  enum ExLvl {
    all_dimensions
    ex1
    ex2
    ex3
    ex4
    ex5
    non
  }
  enum Gender {
    all_dimensions
    female
    male
    sup
    na
  }
  enum Fol {
    all_dimensions
    eng
    fre
    sup
    na
  }

  type HeadcountData {
    data: [HeadcountDatum]
    record: [HeadcountRecord]
    avg_share: [HeadcountShare]
    basic_trend: BasicHeadcountTrend
  }
  type BasicHeadcountTrend {
    first_active_year: String
    last_active_year: String
    active_year_count: Float

    avg_share: Float
    avg_headcount: Float
    change_percent: Float
    ppl_last_year_5: Float
    ppl_last_year_4: Float
    ppl_last_year_3: Float
    ppl_last_year_2: Float
    ppl_last_year: Float
  }
  type HeadcountRecord {
    dimension: String
    ppl_last_year_5: Float
    ppl_last_year_4: Float
    ppl_last_year_3: Float
    ppl_last_year_2: Float
    ppl_last_year: Float
  }
  type HeadcountShare {
    dimension: String
    avg_share: Float
  }
  type HeadcountDatum {
    dimension: String
    year: String
    headcount: Float
  }

  type EmployeeTypeInfo {
    first_active_year: String
    last_active_year: String
    active_year_count: Float

    total_avg_headcount: Float
    total_change_percent: Float
    total_ppl_last_year_5: Float
    total_ppl_last_year_4: Float
    total_ppl_last_year_3: Float
    total_ppl_last_year_2: Float
    total_ppl_last_year: Float
  }
`;

export default function ({ models }) {
  const headcount_models_by_name_in_schema = _.chain(
    snake_case_headcount_model_names
  )
    .zip(camel_case_headcount_model_names)
    .fromPairs()
    .mapValues((model_name) => models[model_name])
    .value();

  function get_flat_headcount_by_dimension_data_all_dimensions(
    subject,
    model_name
  ) {
    let records;

    if (subject.level === "org") {
      records = headcount_models_by_name_in_schema[model_name].get_dept_records(
        subject.dept_code
      );
    } else if (subject.level === "gov") {
      records = headcount_models_by_name_in_schema[
        model_name
      ].get_gov_records();
    }

    return _.chain(records)
      .flatMap((record) =>
        _.map(people_years, (year) => ({
          year,
          dimension: record.dimension,
          headcount: record[year],
        }))
      )
      .filter("headcount")
      .value();
  }

  function get_flat_headcount_by_dimension_data_one_dimension(
    subject,
    model_name,
    dimension_value
  ) {
    let records;

    if (subject.level === "org") {
      records = headcount_models_by_name_in_schema[model_name].get_dept_records(
        subject.dept_code
      );
    } else if (subject.level === "gov") {
      records = headcount_models_by_name_in_schema[
        model_name
      ].get_gov_records();
    }

    records = _.filter(
      records,
      (record) => record.dimension === dimension_value
    );

    return _.chain(records)
      .flatMap((record) =>
        _.map(people_years, (year) => ({
          year,
          dimension: record.dimension,
          headcount: record[year],
        }))
      )
      .filter("headcount")
      .value();
  }

  function get_flat_headcount_by_dimension_data(
    subject,
    model_name,
    dimension_value
  ) {
    const flat_headcount_data =
      dimension_value === "all_dimensions"
        ? get_flat_headcount_by_dimension_data_all_dimensions(
            subject,
            model_name
          )
        : get_flat_headcount_by_dimension_data_one_dimension(
            subject,
            model_name,
            dimension_value
          );
    return flat_headcount_data;
  }

  function headcount_by_dimension_data_resolver({ flat_headcount_data }) {
    return flat_headcount_data;
  }

  function headcount_by_dimension_avg_share_resolver({
    flat_headcount_data,
    subject,
    model_name,
    dimension_value,
  }) {
    let avg_shares;

    if (dimension_value === "all_dimensions") {
      const dimension_values = _.chain(flat_headcount_data)
        .map((d) => d.dimension)
        .sortedUniq()
        .value();

      const all_years_total = _.reduce(
        flat_headcount_data,
        (total, d) => total + d.headcount,
        0
      );

      avg_shares = _.map(dimension_values, (dimension) => {
        const dimension_all_years_total = _.chain(flat_headcount_data)
          .filter((d) => d.dimension === dimension)
          .reduce((total, d) => total + d.headcount, 0)
          .value();

        const avg_share = dimension_all_years_total / all_years_total;

        return {
          dimension,
          avg_share,
        };
      });
    } else {
      const { avg_share } = headcount_by_dimension_basic_trend_resolver({
        flat_headcount_data,
        subject,
        model_name,
        dimension_value,
      });

      avg_shares = [
        {
          dimension: dimension_value,
          avg_share: avg_share,
        },
      ];
    }

    return avg_shares;
  }

  function headcount_by_dimension_record_resolver({ flat_headcount_data }) {
    const dimension_values = _.chain(flat_headcount_data)
      .map((d) => d.dimension)
      .sortedUniq()
      .value();

    const records = _.map(dimension_values, (dimension) => {
      const data_by_year = _.chain(flat_headcount_data)
        .filter((d) => d.dimension === dimension)
        .map((data) => [data.year, data.headcount])
        .fromPairs()
        .value();

      return _.assign({ dimension }, data_by_year);
    });

    return records;
  }

  function headcount_by_dimension_basic_trend_resolver({
    flat_headcount_data,
    subject,
    model_name,
    dimension_value,
  }) {
    const flat_headcount_all_dimensions_data =
      dimension_value === "all_dimensions"
        ? flat_headcount_data
        : get_flat_headcount_by_dimension_data_all_dimensions(
            subject,
            model_name
          );

    const flat_headcount_totals_data = _.chain(people_years)
      .map((year) => {
        const year_total = _.reduce(
          flat_headcount_all_dimensions_data,
          (total, record) => {
            return record.year === year ? total + record.headcount : total;
          },
          0
        );
        return {
          year: year,
          headcount: year_total,
        };
      })
      .value();

    const basic_headcount_totals_trend = get_headcount_totals_basic_trend({
      subject,
      flat_headcount_totals_data,
    });

    const {
      first_active_year,
      last_active_year,
      active_year_count,
      total_avg_headcount,
    } = basic_headcount_totals_trend;

    const totals = _.chain(flat_headcount_data)
      .groupBy("year")
      .map((group, year) => [year, _.sumBy(group, "headcount")])
      .fromPairs()
      .value();

    const avg_headcount =
      _.chain(people_years)
        .map((key) => totals[key] || 0)
        .sum()
        .value() / active_year_count;

    const avg_share = avg_headcount / total_avg_headcount;

    const change_percent =
      (totals[last_active_year] - totals[first_active_year]) /
      totals[first_active_year];

    return _.assign(
      totals,
      {
        flat_headcount_all_dimensions_data,
        change_percent,
        avg_share,
        avg_headcount,
      },
      basic_headcount_totals_trend
    );
  }

  function get_headcount_totals_basic_trend({
    subject,
    flat_headcount_totals_data,
  }) {
    const overall_totals = _.chain(flat_headcount_totals_data)
      .map((data) => ["total_" + data.year, data.headcount])
      .fromPairs()
      .value();

    const years_with_headcounts = _.filter(
      flat_headcount_totals_data,
      (d) => d.headcount !== 0
    );

    let basic_trend;

    if (years_with_headcounts.length === 0) {
      basic_trend = _.assign(overall_totals, {
        first_active_year: null,
        last_active_year: null,
        active_year_count: 0,
        total_avg_headcount: 0,
        total_change_percent: 0,
      });
    } else {
      const first_active_year = _.head(years_with_headcounts).year;
      const last_active_year = _.last(years_with_headcounts).year;

      const active_year_count =
        _.indexOf(people_years, last_active_year) -
        _.indexOf(people_years, first_active_year) +
        1;

      const total_avg_headcount =
        _.reduce(
          overall_totals,
          (full_total, year_total) => full_total + year_total
        ) / active_year_count;

      const total_change_percent =
        (overall_totals["total_" + last_active_year] -
          overall_totals["total_" + first_active_year]) /
        overall_totals["total_" + first_active_year];

      basic_trend = _.assign(overall_totals, {
        first_active_year,
        last_active_year,
        active_year_count,
        total_avg_headcount,
        total_change_percent,
      });
    }

    return basic_trend;
  }

  function employee_headcount_subject_data_resolver(
    model_name,
    subject,
    { dimension }
  ) {
    const flat_headcount_data = get_flat_headcount_by_dimension_data(
      subject,
      model_name,
      dimension
    );
    return {
      flat_headcount_data,
      subject,
      model_name,
      dimension_value: dimension,
    };
  }
  const headcount_model_subject_data_resolvers = _.chain(
    headcount_models_by_name_in_schema
  )
    .keys()
    .map((headcount_model_name) => {
      const model_subject_data_resolver_name = headcount_model_name + "_data";
      const model_subject_data_resolver = _.curry(
        employee_headcount_subject_data_resolver
      )(headcount_model_name);
      return [model_subject_data_resolver_name, model_subject_data_resolver];
    })
    .fromPairs()
    .value();

  function employee_type_subject_info_resolver(subject) {
    const flat_headcount_data = get_flat_headcount_by_dimension_data(
      subject,
      "employee_type",
      "all_dimensions"
    );

    const {
      first_active_year,
      last_active_year,
      active_year_count,
      total_avg_headcount,
      total_change_percent,
      total_ppl_last_year,
      total_ppl_last_year_2,
      total_ppl_last_year_3,
      total_ppl_last_year_4,
      total_ppl_last_year_5,
      flat_headcount_all_dimensions_data,
    } = headcount_by_dimension_basic_trend_resolver({
      flat_headcount_data,
      subject,
      model_name: "employee_type",
      dimension_value: "all_dimensions",
    });

    //TODO calculate and return (+ add to schema) other emp type info

    return {
      first_active_year,
      last_active_year,
      active_year_count,
      total_avg_headcount,
      total_change_percent,
      total_ppl_last_year,
      total_ppl_last_year_2,
      total_ppl_last_year_3,
      total_ppl_last_year_4,
      total_ppl_last_year_5,
    };
  }

  const subject_info_resolvers = {
    employee_type_info: employee_type_subject_info_resolver,
  };

  const subject_resolvers = _.extend(
    {},
    headcount_model_subject_data_resolvers,
    subject_info_resolvers
  );

  const resolvers = {
    Org: subject_resolvers,
    Gov: subject_resolvers,
    HeadcountData: {
      data: headcount_by_dimension_data_resolver,
      avg_share: headcount_by_dimension_avg_share_resolver,
      record: headcount_by_dimension_record_resolver,
      basic_trend: headcount_by_dimension_basic_trend_resolver,
    },
  };

  return {
    schema,
    resolvers,
  };
}
