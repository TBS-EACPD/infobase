import mongoose from "mongoose";

/* eslint-disable no-console */

const get_connection_str = () => {
  if (process.env.USE_REMOTE_DB) {
    console.log("using remote db");
    const { MDB_CONNECT_STRING, MDB_USERNAME, MDB_PW, MDB_NAME } = process.env;

    return MDB_CONNECT_STRING.replace("{MDB_USERNAME}", MDB_USERNAME)
      .replace("{MDB_PW}", MDB_PW)
      .replace("{MDB_NAME}", MDB_NAME);
  } else {
    console.log("using local db");
    return "mongodb://127.0.0.1:27018/email_backend";
  }
};

export const connect_db = async () => {
  return mongoose
    .connect(get_connection_str(), {
      useCreateIndex: true,
      useNewUrlParser: true,
      poolSize: 10,
    })
    .then(() => console.log("MongoDB connected"));
};
