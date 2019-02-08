import { create_models, populate_models } from "./index.js";
import { connect_db, drop_db } from "../db.js";
global.IS_DEV_SERVER = !(process.env.SHOULD_USE_REMOTE_DB);
(async ()=> {
  await connect_db();
  await drop_db();
  create_models();
  await populate_models();
  console.log("done"); /* eslint-disable-line no-console */
  return;
})()

