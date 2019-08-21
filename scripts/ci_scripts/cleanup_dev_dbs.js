const active_db_names = active_branches.replace(/^origin\//g, "").replace(/\norigin\//g, ",").split(",");

const all_dev_db_names = db.adminCommand( { listDatabases: 1, nameOnly: true} );

Promise.all(
  all_dev_db_names.map(
    (dev_db_name)  => {
      if ( !active_db_names.includes(dev_db_name) ){
        return db.getSiblingDB(dev_db_name).dropDatabase();
      } else {
        return Promise.resolve();
      }
    }
  )
);