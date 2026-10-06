import _ from "lodash";

import { compact_finance_rows } from "./finance_utils";
import {
  gov_store_key,
  has_loaded_finance_fields,
  merge_loaded_finance_data,
} from "./loaded_finance_data";
import { finance_slices, slice_variables } from "./queries/slices";

const row_promises = new Map();

const rows_for = (subject_type, field, subject) => {
  const cache_key =
    subject_type === "gov"
      ? `gov:${field}`
      : `${subject_type}:${subject.id}:${field}`;

  if (!row_promises.has(cache_key)) {
    const slice = finance_slices[subject_type]?.[field];
    if (!slice) {
      row_promises.set(cache_key, Promise.resolve([]));
    } else {
      row_promises.set(
        cache_key,
        slice
          .promised(slice_variables[subject_type](subject))
          .then((rows) => compact_finance_rows(rows))
      );
    }
  }

  return row_promises.get(cache_key);
};

export const api_load_finance_data = (subject, panels) => {
  const fields = _.uniq(
    _.flatMap(panels, (panel) => panel.finance_fields || [])
  );
  const gov_fields = _.uniq(
    _.flatMap(panels, (panel) => panel.gov_finance_fields || [])
  );

  if (
    !subject ||
    (fields.length === 0 && gov_fields.length === 0) ||
    has_loaded_finance_fields(subject, fields, gov_fields)
  ) {
    return Promise.resolve();
  }

  const subject_type = subject.subject_type;
  const jobs = [
    ...fields.map((field) =>
      rows_for(subject_type, field, subject).then((rows) => ({
        key: field,
        rows,
      }))
    ),
    ...gov_fields.map((field) =>
      rows_for("gov", field, subject).then((rows) => ({
        key: gov_store_key(field),
        rows,
      }))
    ),
  ];

  return Promise.all(jobs).then((results) => {
    merge_loaded_finance_data(
      subject,
      _.fromPairs(results.map(({ key, rows }) => [key, rows])),
      results.map(({ key }) => key)
    );
  });
};
