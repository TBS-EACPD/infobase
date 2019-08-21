const active_db_names = active_branches.replace(/^origin\//g, "").replace(/\norigin\//g, ",").split(",");

const all_dev_db_names = db.adminCommand( { listDatabases: 1, nameOnly: true} );

for (dev_db_name in all_dev_db_names){
  if ( !active_db_names.includes(dev_db_name) ){
    db.getSiblingDB(dev_db_name).dropDatabase();
  }
}