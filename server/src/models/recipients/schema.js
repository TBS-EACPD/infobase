import _ from "lodash";

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
    has_recipients: Boolean
    years_with_recipient_data: [String]
    recipient_summary(year: String!): TopTen
  }

  type TopTen {
    id: String
    year: String
    top_ten: [TopTenSummary]
    total_exp: Float
  }
  type TopTenSummary {
    index: String
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
    program: String
    recipient: String
    city: String
    province: String
    country: String
    expenditure: Float
  }
`;

export default function ({ models, loaders }) {
  const { Recipients } = models;

  const { recipients_loader, recipients_by_org_id, recipient_summary_loader } =
    loaders;

  const org_has_recipients = async (org_id) => {
    const has_recipients = await Recipients.findOne({ org_id: org_id });
    return !_.isNull(has_recipients);
  };

  const get_report_years = _.curry((data) => {
    return _.map(data, "year");
  });

  const filter_for_year = _.curry((year, data) => {
    return _.find(data, { year: year });
  });

  const resolvers = {
    Root: {
      recipients: (_x, { id }) => recipients_loader.load(id).then(_.first),
    },
    Gov: {
      years_with_recipient_data: () =>
        recipient_summary_loader.load("gov").then(get_report_years()),
      recipient_summary: (_x, { year }) =>
        recipient_summary_loader.load("gov").then(filter_for_year(year)),
    },
    Org: {
      recipients: ({ org_id }) => recipients_by_org_id.load(org_id),
      has_recipients: ({ org_id }) => org_has_recipients(org_id),
      years_with_recipient_data: ({ org_id }) =>
        recipient_summary_loader.load(org_id).then(get_report_years()),
      recipient_summary: ({ org_id }, { year }) =>
        recipient_summary_loader.load(org_id).then(filter_for_year(year)),
    },
  };
  return {
    schema,
    resolvers,
  };
}
