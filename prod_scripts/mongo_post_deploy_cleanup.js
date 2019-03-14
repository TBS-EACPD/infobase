// Update prod db metadata after a deploy, delete outgoing rollback db

const metadata_db = db.getSiblingDB('metadata');

const previous_metadata_collection = metadata_db.metadata;

const previous_metadata = previous_metadata_collection.findOne({});

// Drop the previous metadata collection
previous_metadata_collection.drop();

// Create and populate the new metadata collection
metadata_db.metadata.insertOne({
  prod: new_prod_db_name,
  rollback: previous_metadata.prod,
});

// Drop the previoud rollback db
db.getSiblingDB(previous_metadata.rollback).drop();