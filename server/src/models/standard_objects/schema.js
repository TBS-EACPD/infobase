import _ from "lodash";

const schema = `
  extend type Org {
    standard_object_data: StandardObjectData
  }
  extend type Program {
    standard_object_data: StandardObjectData
  }
  extend type Gov {
    standard_object_data: StandardObjectData
  }
  type StandardObjectRecord {
    so_num: Int
    amount: Float
    year: String
  }
  type StandardObjectData {
    data(so_num: Int, year: String): [StandardObjectRecord]
    top_n_with_other(n: Int!, year: String!): [StandardObjectRecord]
  }
`;

export default function ({ models }) {
  const { OrgSobj, ProgSobj } = models;

  const resolvers = {
    StandardObjectData: {
      data(subject, { year, so_num }) {
        const { subject_type } = subject;

        let data;
        if (subject_type === "org") {
          data = OrgSobj.get_flat_records(subject.dept_code);
        } else if (subject_type === "gov") {
          data = OrgSobj.get_flat_records("ZGOC");
        } else if (subject_type === "program") {
          data = ProgSobj.get_flat_records(subject.id);
        }

        if (year) {
          data = _.filter(data, { year });
        }
        if (so_num) {
          data = _.filter(data, { so_num });
        }
        return data;
      },
      top_n_with_other(subject, { n, year }) {
        const { subject_type } = subject;

        if (subject_type === "org") {
          return OrgSobj.get_top_n_sobjs(subject.dept_code, year, n);
        } else if (subject_type === "gov") {
          return OrgSobj.get_top_n_sobjs("ZGOC", year, n);
        } else if (subject_type === "program") {
          return ProgSobj.get_top_n_sobjs(subject.id, year, n);
        }
      },
    },
    Org: {
      standard_object_data: _.identity,
    },
    Program: {
      standard_object_data: _.identity,
    },
    Gov: {
      standard_object_data: _.identity,
    },
  };

  return {
    schema,
    resolvers,
  };
}
