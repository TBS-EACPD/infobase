import mongoose, { mongo } from "mongoose";

/* eslint-disable no-console */

function get_connection_str(){

  if(global.IS_DEV_SERVER){
    console.log("using local db")
    return "mongodb://127.0.0.1:27017/infobase";
  }

  console.log("using remote db")
  const {
    MDB_CONNECT_STRING,
    MDB_USERNAME, // different usernames in read-mode vs populate-mode
    MDB_PW,
    MDB_NAME, //using different databases on the same 'cluster' will be how we stage deployments 
  } = process.env;

  //MDB_CONNECT_STRING is the pre-3.0 verson because the gcloud function node.js has old mongodb drivers
  return MDB_CONNECT_STRING
    .replace('{MDB_USERNAME}', MDB_USERNAME)
    .replace('{MDB_PW}', MDB_PW)
    .replace('{MDB_NAME}', MDB_NAME);
}


// Connect to MongoDB with Mongoose.
export async function connect_db(){
  return await mongoose.connect(
    get_connection_str(),
    { 
      useCreateIndex: true,
      useNewUrlParser: true,
    }
  )
    .then( () => console.log("MongoDB connected") )
    .catch(err => {
      console.log(err);
    });
}

//make sure this is called after connect_db()
export async function drop_db(){
  return await mongoose.connection.db.dropDatabase();
}