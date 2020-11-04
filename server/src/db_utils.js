import mongoose from "mongoose";

/* eslint-disable no-console */

function get_connection_str() {
  if (process.env.USE_REMOTE_DB) {
    const {
      MDB_CONNECT_STRING,
      MDB_USERNAME, // different usernames in read-mode vs populate-mode
      MDB_PW,
      MDB_NAME,
    } = process.env;

    return MDB_CONNECT_STRING.replace("{MDB_USERNAME}", MDB_USERNAME)
      .replace("{MDB_PW}", MDB_PW)
      .replace("{MDB_NAME}", MDB_NAME);
  } else {
    console.log("using local db");
    return "mongodb://127.0.0.1:27017/infobase";
  }
}

// Connect to MongoDB with Mongoose. Note that this is async, but generally doesn't need to be awaited when called.
// It's safe to let the connection happen fully async because further mongoose opperations are also async and will
// buffer until the connection's made
export async function connect_db() {
  return await mongoose
    .connect(get_connection_str(), {
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 7500,
      heartbeatFrequencyMS: 10000,
      useCreateIndex: true,
      useNewUrlParser: true,
      poolSize: 10,
    })
    .then(() => console.log("MongoDB connected"));
}

export function get_db_connection_status() {
  return mongoose.connection.states[mongoose.connection.readyState];
}

export async function drop_db() {
  return await mongoose.connection.db.dropDatabase();
}
