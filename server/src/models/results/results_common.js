import _ from "lodash";

const current_ordered_doc_keys = [ 'drr18', 'dp19' ];

const current_drr_docs = _.filter( current_ordered_doc_keys, (key) => /^drr/.test(key) );
const current_dp_docs = _.filter( current_ordered_doc_keys, (key) => /^dp/.test(key) );


const snapshot_test_ordered_doc_keys = [ 'drr17', 'dp18', 'dp19' ];

const snapshot_test_drr_docs = _.filter( snapshot_test_ordered_doc_keys, (key) => /^drr/.test(key) );
const snapshot_test_dp_docs = _.filter( snapshot_test_ordered_doc_keys, (key) => /^dp/.test(key) );

export const ordered_doc_keys = process.env.USE_TEST_DATA ? snapshot_test_ordered_doc_keys : current_ordered_doc_keys;
export const drr_docs = process.env.USE_TEST_DATA ? snapshot_test_drr_docs : current_drr_docs;
export const dp_docs = process.env.USE_TEST_DATA ? snapshot_test_dp_docs : current_dp_docs;