import _ from "lodash";

const current_doc_keys_ordered_by_time_period = [
  "drr18",
  "drr19",
  "dp20",
  "dp21",
];

const current_drr_docs = _.filter(
  current_doc_keys_ordered_by_time_period,
  (key) => /^drr/.test(key)
);
const current_dp_docs = _.filter(
  current_doc_keys_ordered_by_time_period,
  (key) => /^dp/.test(key)
);

// Don't change these keys unless you've also updated the results files in data/test-data!
const snapshot_test_ordered_doc_keys = ["drr17", "dp18", "dp19"];

const snapshot_test_drr_docs = _.filter(snapshot_test_ordered_doc_keys, (key) =>
  /^drr/.test(key)
);
const snapshot_test_dp_docs = _.filter(snapshot_test_ordered_doc_keys, (key) =>
  /^dp/.test(key)
);

export const time_period_ordered_doc_keys = process.env.USE_TEST_DATA
  ? snapshot_test_ordered_doc_keys
  : current_doc_keys_ordered_by_time_period;
export const drr_docs = process.env.USE_TEST_DATA
  ? snapshot_test_drr_docs
  : current_drr_docs;
export const dp_docs = process.env.USE_TEST_DATA
  ? snapshot_test_dp_docs
  : current_dp_docs;
