import _ from "lodash";

import { get_standard_csv_file_rows } from '../load_utils.js';

export default async function({models}){
  const { 
    ServiceStandard,
    Service,
  } = models;

  const service_standard_rows = _.map(
    get_standard_csv_file_rows("service_standards.csv"),
    ({
      id: standard_id,
      service: service_id,
      comment_en,
      comment_fr,
      ...other_fields
    }) => ({
      standard_id,
      service_id,
      target_comment_en: comment_en,
      target_comment_fr: comment_fr,
      ...other_fields,
    }),
  );

  const service_rows = _.map(
    get_standard_csv_file_rows("services.csv"),
    ({
      id: service_id,
      dept: org_id,
      ...other_fields
    }) => ({
      service_id,
      org_id,
      ...other_fields,
      standards: _.filter(
        service_standard_rows,
        (service_standard) => service_standard.service_id === service_id
      ),
    }),
  );

  return await Promise.all([
    ServiceStandard.insertMany(service_standard_rows),
    Service.insertMany(service_rows),
  ]);
}