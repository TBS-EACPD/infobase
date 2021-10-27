import mongoose from "mongoose";

export function get_db_connection_status() {
  return mongoose.connection.states[mongoose.connection.readyState];
}
