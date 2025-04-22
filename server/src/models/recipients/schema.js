import _ from "lodash";

const schema = `  
  extend type Root {
    recipients(id: String!): Recipients
  }
  extend type Org {
    recipients: [Recipients]
    recipients_general_stats: [RecipientsGeneralStats]
    has_recipients: Boolean
  }

  type RecipientsGeneralStats {
    year: String
    org_id: String
    recipient: String
    total_exp: Float
    num_transfer_payments: Float
  }
  type Recipients {
   year: String,
   department: String,
   org_id: String,
   org: Org,
   program: String,
   record_type: String,
   recipient: String,
   city: String,
   province: String,
   country: String,
   expenditure: Float,
  }
`;

export default function ({ models, loaders }) {
  const { Recipients } = models;

  const {
    org_id_loader,
    recipients_loader,
    recipients_by_org_id,
    recipients_general_stat_by_org_id,
  } = loaders;

  const org_has_recipients = async (org_id) => {
    const has_recipients = await Recipients.findOne({ org_id: org_id });
    return !_.isNull(has_recipients);
  };

  const resolvers = {
    Root: {
      recipients: (_x, { id }) => recipients_loader.load(id).then(_.first),
    },
    Org: {
      recipients: ({ org_id }) => recipients_by_org_id.load(org_id),
      recipients_general_stats: ({ org_id }) =>
        recipients_general_stat_by_org_id.load(org_id),
      has_recipients: ({ org_id }) => org_has_recipients(org_id),
    },
    Recipients: {
      org: ({ org_id }) => org_id_loader.load(org_id),
    },
  };
  return {
    schema,
    resolvers,
  };
}
