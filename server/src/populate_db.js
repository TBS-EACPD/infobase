import { connect_db, drop_db } from "./db_utils.js";
import { create_models, populate_all_models } from "./models/index.js";

// Properly exit on any unhandled promise rejections, for failing-fast in CI
process.on("unhandledRejection", (unhandledRejectionException) => {
  throw unhandledRejectionException;
});

(async () => {
  await connect_db();
  await drop_db();
  create_models();
  await populate_all_models();
  console.log("done"); /* eslint-disable-line no-console */

  // TODO: I think a write stream is holding the process open after the above finishes, maybe?
  // For now, just exiting explicitly, but if possible should sort out why the process is held open without the next line
  process.exit(); /* eslint-disable-line no-process-exit */
})();
