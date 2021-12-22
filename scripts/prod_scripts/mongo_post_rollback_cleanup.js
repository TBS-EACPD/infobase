// Update metadata following a rollback

const metadata_db = db.getSiblingDB("metadata"); // eslint-disable-line no-undef

const current_metadata_collection = metadata_db.metadata;

const current_metadata = current_metadata_collection.findOne({});

// Drop the previous metadata collection
current_metadata_collection.drop();

// Create and populate the new (rolled back) metadata collection
metadata_db.metadata.insertOne({
  prod: current_metadata.rollback,
  rollback: current_metadata.prod,
});
