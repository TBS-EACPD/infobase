// Update metadata following a rollback

const metadata_db = db.getSiblingDB('metadata');

const current_metadata_collection = metadata_db.metadata;

const current_metadata = current_metadata_collection.findOne({});

// Drop the previous metadata collection
current_metadata_collection.drop();

// Create and populate the new (rolled back) metadata collection
metadata_db.metadata.insertOne({
  prod: current_metadata.rollback,
  rollback: current_metadata.prod,
});
// Note: the previous prod is re-identified as the new rollback, but running the rollback script a second time
// will not actually put it back in production correctly since the client doesn't swap the same way.
// Re-identifying the previous prod as the current rollback here is mainly so that the next deploy will
// automatically drop it to clean up.