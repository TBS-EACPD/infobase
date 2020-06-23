import mongoose from "mongoose";

/* eslint-disable no-console */

function get_connection_str() {
  if (process.env.USE_REMOTE_DB) {
    console.log("using remote db");
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

// Connect to MongoDB with Mongoose.
export async function connect_db() {
  return await mongoose
    .connect(get_connection_str(), {
      useUnifiedTopology: true,
      useCreateIndex: true,
      useNewUrlParser: true,
      poolSize: 10,
    })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => {
      console.log(err);
    });
}

//make sure this is called after connect_db()
export async function drop_db() {
  return await mongoose.connection.db.dropDatabase();
}
