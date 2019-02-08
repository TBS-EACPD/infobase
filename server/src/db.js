import mongoose, { mongo } from "mongoose";

/* eslint-disable no-console */

function get_connection_str(){

  if(global.IS_DEV_SERVER){
    console.log("using local db")
    return "mongodb://127.0.0.1:27017/infobase";
  }

  console.log("using remote db")
  const { MDB_CONNECTION_STR } = process.env;
  return MDB_CONNECTION_STR;
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