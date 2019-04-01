import { create_models, populate_models } from "./index.js";
import { connect_db, drop_db } from "../db_utils.js";
global.IS_DEV_SERVER = !process.env.SHOULD_USE_REMOTE_DB;
global.USE_TEST_DATA = process.env.USE_TEST_DATA;

// Properly exit on any unhandled promise rejections, for failing-fast in CI
process.on('unhandledRejection', unhandledRejectionException => { throw unhandledRejectionException });

(async ()=> {
  await connect_db();
  await drop_db();
  create_models();
  await populate_models();
  console.log("done"); /* eslint-disable-line no-console */

  // TODO: I think a write stream is holding the process open after the above finishes, maybe?
  // For now, just exiting explicitly, but if possible should sort out why the process is held open without the next line
  process.exit(); /* eslint-disable-line no-process-exit */
})();

