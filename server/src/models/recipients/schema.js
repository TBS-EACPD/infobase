import _ from "lodash";

import { bilingual_field } from "../schema_utils.js";

const schema = `  
  extend type Root {
    recipients(id: String!): Recipients
  }
  extend type Gov {
    years_with_recipient_data: [String]
    recipient_summary(year: String!): TopTen
  }
  extend type Org {
    recipients: [Recipients]
    years_with_recipient_data: [String]
    recipient_summary(year: String!): TopTen
  }

  type TopTen {
    id: String
    subject_id: String
    year: String
    top_ten: [TopTenSummary]
    total_exp: Float
  }
  type TopTenSummary {
    row_id: String
    recipient: String
    total_exp: Float
    num_transfer_payments: Float
    transfer_payments: [Recipients]
  }
  type Recipients {
    id: Float
    year: String
    org_id: String
    transfer_payment: String
    recipient: String
    city: String
    province: String
    country: String
    expenditure: Float
  }
`;

export default function ({ loaders }) {
  const {
    recipients_loader,
    recipients_by_org_id,
    recipient_summary_by_subject_year_loader,
    recipient_years_loader,
  } = loaders;

  const get_report_years = _.curry((data) => {
    return _.map(data, "year");
  });

  const resolvers = {
    Root: {
      recipients: (_x, { id }) => recipients_loader.load(id).then(_.first),
    },
    Gov: {
      years_with_recipient_data: () =>
        recipient_years_loader.load("gov").then(get_report_years()),
      recipient_summary: (_x, { year }) =>
        recipient_summary_by_subject_year_loader.load(`gov::${year}`),
    },
    Org: {
      recipients: ({ org_id }) => recipients_by_org_id.load(org_id),
      years_with_recipient_data: ({ org_id }) =>
        recipient_years_loader.load(org_id).then(get_report_years()),
      recipient_summary: ({ org_id }, { year }) =>
        recipient_summary_by_subject_year_loader.load(`${org_id}::${year}`),
    },
    Recipients: {
      transfer_payment: bilingual_field("transfer_payment"),
      city: bilingual_field("city"),
      province: bilingual_field("province"),
      country: bilingual_field("country"),
    },
  };
  return {
    schema,
    resolvers,
  };
}
