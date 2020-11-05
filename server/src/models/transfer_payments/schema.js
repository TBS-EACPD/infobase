import _ from "lodash";

import { en_fr } from "../schema_utils";

const schema = `
  extend type Org {
    transfer_payments_data: TransferPaymentsData
  }

  type TransferPaymentsData {
    data(year: PublicAccountsYear): [TransferPaymentsRecord]
    top_n_with_other(n: Int!, year: PublicAccountsYear!): [TransferPaymentsRecord]
    collapsed(year: PublicAccountsYear): [ TransferPaymentsRecord ]
  }


  type TransferPaymentsRecord {
    type: TransferPaymentType
    name: String
    auth: Float
    exp: Float
    year: PublicAccountsYear
  }


  enum TransferPaymentType { 
    c # contribution
    g # grants/subvention
    o # other/autre
  }
  
`;

export default function ({ models }) {
  const { TransferPayments } = models;

  const resolvers = {
    TransferPaymentsData: {
      data(org, { year }) {
        let data = TransferPayments.get_flat_records(org.dept_code);

        if (year) {
          data = _.chain(data)
            .filter({ year })
            .filter((record) => record.auth && record.exp)
            .value();
        }

        return data;
      },
      top_n_with_other(org, { n, year }) {
        return TransferPayments.get_top_n(org.dept_code, year, n);
      },
      collapsed(org, { year }) {
        let data = TransferPayments.get_flat_records(org.dept_code);

        if (year) {
          data = _.filter(data, { year });
        }

        return _.chain(data)
          .groupBy((record) => `${record.type}-${record.year}`)
          .map((group) => ({
            type: group[0].type,
            year: group[0].year,
            exp: _.sumBy(group, "exp"),
            auth: _.sumBy(group, "auth"),
          }))
          .value();
      },
    },
    Org: {
      transfer_payments_data: _.identity,
    },
    TransferPaymentsRecord: { name: en_fr("name_en", "name_fr") },
  };

  return {
    schema,
    resolvers,
  };
}
