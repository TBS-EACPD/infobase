import _ from "lodash";

const schema = `
  extend type Org {
    org_recipients: RecipientsSummary
  }

  type RecipientsSummary {
    id: String
    recipients: [Recipients]
    recipients_general_stats: [RecipientsGeneralStats]
  }
  type Recipients {
    year: String
    department: String
    org_id: String
    program: String
    record_type: String
    recipient: String
    city: String
    province: String
    country: String
    expenditure: Float
  }
  type RecipientsGeneralStats {
    year: String
    org_id: String
    recipient: String
    total: Float
  }
`;

export default function ({ loaders }) {
  const { org_recipients_loader } = loaders;

  const resolvers = {
    Org: {
      org_recipients: ({ org_id }) => org_recipients_loader.load(org_id),
    },
  };
  return {
    schema,
    resolvers,
  };
}
