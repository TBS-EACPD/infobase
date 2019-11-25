import { 
  bilingual_field, 
} from '../schema_utils';

const schema = `
  extend type Org{
    services: [Service]
  }
  
  type Service{
    service_id: String
    org_id: String
    year: String
    is_active: Boolean

    name: String
    description: String
    service_type: String
    scope: String

    last_gender_analysis: String

    collects_fees: Boolean

    account_reg_digital_status: String
    authentication_status: String
    application_digital_status: String
    decision_digital_status: String
    issuance_digital_status: String
    issue_res_digital_status: String
    digital_enablement_comment: String

    standards: [ServiceStandard],
  }
  type ServiceStandard{
    standard_id: String
    service_id: String
    is_active: Boolean

    name: String

    last_gcss_tool_year: String,
    channel: String
    standard_type: String
    other_type_comment: String

    target_type: String
    lower: Float
    upper: Float
    count: Float
    met_count: Float
    is_target_met: Boolean
    target_comment: String
    urls: [String],
    rtp_urls: [String],
  }
`;


export default function({models, loaders}){
  const {
    services_by_org_id,
  } = loaders;

  const resolvers = {
    Org: {
      services: ({org_id}) => services_by_org_id.load(org_id),
    },
    Service: {
      name: bilingual_field("name"),
      description: bilingual_field("description"),
      service_type: bilingual_field("service_type"),
      scope: bilingual_field("scope"),
      digital_enablement_comment: bilingual_field("digital_enablement_comment"),
    },
    ServiceStandard: {
      name: bilingual_field("name"),
      other_type_comment: bilingual_field("other_type_comment"),
      target_comment: bilingual_field("target_comment"),
      urls: bilingual_field("urls"),
      rtp_urls: bilingual_field("rtp_urls"),
    },
  };

  return {
    schema,
    resolvers,
  };
}
