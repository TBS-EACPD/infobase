const metadata_db = db.getSiblingDB('metadata');

const current_metadata_collection = db.getSiblingDB('metadata').metadata;

const current_metadata = current_metadata_collection.findOne({});

current_metadata_collection.drop();

metadata_db.metadata.insertOne({
  prod: current_metadata.rollback,
  rollback: current_metadata.prod,
});