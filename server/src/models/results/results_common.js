const current_drr_docs = [
  "drr18",
];
const current_dp_docs = [
  "dp19",
];


const snapshot_test_drr_docs = [
  "drr17",
];
const snapshot_test_dp_docs = [
  "dp18",
  "dp19",
];


export const drr_docs = process.env.USE_TEST_DATA ? snapshot_test_drr_docs : current_drr_docs;
export const dp_docs = process.env.USE_TEST_DATA ? snapshot_test_dp_docs : current_dp_docs;