import _ from "lodash";

const schema = `  
  extend type Root {
    recipients(id: String!): Recipients
  }
  extend type Gov {
    recipient_summary: RecipientSummary
  }
  extend type Org {
    recipients: [Recipients]
    recipients_general_stats: [RecipientsGeneralStats]
    has_recipients: Boolean
    recipient_summary: RecipientSummary
  }

  type RecipientSummary {
    id: String
    recipient_overview: [RecipientOverview]
    recipient_exp_summary: [RecipientExpSummary]
    recipient_location: [RecipientLocation]
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
  type RecipientOverview {
    year: String,
    total_tf_exp: Float,
  }
  type RecipientExpSummary {
    year: String
    recipient: String
    total_exp: Float
    num_transfer_payments: Float
    programs: [String]
  }
  type RecipientLocation {
    year: String
    qc: Float
    nb: Float
    bc: Float
    on: Float
    ns: Float
    mb: Float
    nl: Float
    nu: Float
    na: Float
    pe: Float
    nt: Float
    yk: Float
    abroad: Float
    sk: Float
    ab: Float   
  }
`;

export default function ({ models, loaders }) {
  const { Recipients } = models;

  const {
    org_id_loader,
    recipients_loader,
    recipients_by_org_id,
    recipients_general_stat_by_org_id,
    gov_recipient_summary_loader,
    org_recipient_summary_loader,
  } = loaders;

  const org_has_recipients = async (org_id) => {
    const has_recipients = await Recipients.findOne({ org_id: org_id });
    return !_.isNull(has_recipients);
  };

  const resolvers = {
    Root: {
      recipients: (_x, { id }) => recipients_loader.load(id).then(_.first),
    },
    Gov: {
      recipient_summary: () => gov_recipient_summary_loader.load("gov"),
    },
    Org: {
      recipients: ({ org_id }) => recipients_by_org_id.load(org_id),
      recipients_general_stats: ({ org_id }) =>
        recipients_general_stat_by_org_id.load(org_id),
      has_recipients: ({ org_id }) => org_has_recipients(org_id),
      recipient_summary: ({ org_id }) =>
        org_recipient_summary_loader.load(org_id),
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
