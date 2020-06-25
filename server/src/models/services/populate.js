import _ from "lodash";

import { get_standard_csv_file_rows } from "../load_utils.js";

const multi_value_string_fields_to_arrays = (list_fields, seperator = ",") =>
  _.mapValues(list_fields, (array_string) => _.split(array_string, seperator));

export default async function ({ models }) {
  const { ServiceStandard, Service } = models;

  const service_standard_rows = _.map(
    get_standard_csv_file_rows("service_standards.csv"),
    ({
      id: standard_id,
      service: service_id,
      comment_en,
      comment_fr,

      urls_en,
      urls_fr,
      rtp_urls_en,
      rtp_urls_fr,

      ...other_fields
    }) => ({
      standard_id,
      service_id,
      target_comment_en: comment_en,
      target_comment_fr: comment_fr,

      ...multi_value_string_fields_to_arrays({
        urls_en,
        urls_fr,
        rtp_urls_en,
        rtp_urls_fr,
      }),

      ...other_fields,
    })
  );

  const service_rows = _.map(
    get_standard_csv_file_rows("services.csv"),
    ({
      id: service_id,
      dept: org_id,

      program_ids,
      scope_en,
      scope_fr,
      target_groups_en,
      target_groups_fr,
      feedback_channels_en,
      feedback_channels_fr,

      ...other_fields
    }) => ({
      service_id,
      org_id,

      ...multi_value_string_fields_to_arrays({
        program_ids,
        scope_en,
        scope_fr,
        target_groups_en,
        target_groups_fr,
        feedback_channels_en,
        feedback_channels_fr,
      }),

      ...other_fields,

      standards: _.filter(
        service_standard_rows,
        (service_standard) => service_standard.service_id === service_id
      ),
    })
  );

  return await Promise.all([
    ServiceStandard.insertMany(service_standard_rows),
    Service.insertMany(service_rows),
  ]);
}
