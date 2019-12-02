import { get_client } from '../graphql_utils.js';
import gql from 'graphql-tag';
import { log_standard_event } from '../core/analytics.js';
import { 
  Service, 
  ServiceStandard, 
} from './services.js';


const get_dept_services_query = (years_to_load) => gql`
query($lang: String!, $id: String) {
  root(lang: $lang) {
    org(org_id: $id) {
      org_id
      ${_.map(years_to_load,
    year => `
      services${year}: (year: ${_.toInteger(year)}){
        service_id
        program_ids
        is_active

        name
        description
        service_type
        scope
        target_groups
        feedback_channels
        urls
        comment

        last_gender_analysis

        collects_fees
        cra_buisnss_number_is_identifier
        sin_is_identifier
        account_reg_digital_status
        authentication_status
        application_digital_status
        decision_digital_status
        issuance_digital_status
        issue_res_digital_status
        digital_enablement_comment

        telephone_enquires
        website_visits
        online_applications
        in_person_applications
        mail_applications
        other_channel_applications

        standards {
          standard_id
          service_id
          is_active
      
          name
      
          last_gcss_tool_year
          channel
          standard_type
          other_type_comment
      
          target_type
          lower
          upper
          count
          met_count
          is_target_met
          target_comment
          urls
          rtp_urls
        }
      `
  )}
            }
          }
        }
        `;