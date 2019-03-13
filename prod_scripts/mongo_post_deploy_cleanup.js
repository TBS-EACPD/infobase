const metadata_db = db.getSiblingDB('metadata');

const current_metadata_collection = metadata_db.metadata;

const current_metadata = current_metadata_collection.findOne({});

current_metadata_collection.drop();

metadata_db.metadata.insertOne({
  prod: new_prod_db_name,
  rollback: current_metadata.prod,
});

db.getSiblingDB(current_metadata.rollback).drop();