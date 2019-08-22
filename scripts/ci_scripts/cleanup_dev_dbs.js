const active_db_names = active_branches.replace(/^[ ]*origin\//g, "").replace(/\n[ ]*origin\//g, ",").split(",");
const meta_db_names = ["admin", "local"];

const dbs_to_retain = active_db_names.concat(meta_db_names);

const all_dev_db_names = db.adminCommand( { listDatabases: 1, nameOnly: true} ).databases;

if (all_dev_db_names.length === 0){
  print("No stale dev DBs to drop");
} else {
  for (i=0; i < all_dev_db_names.length; i++){
    const db_name = all_dev_db_names[i].name;
    if ( !dbs_to_retain.includes(db_name) ){
      print(`Droping stale dev DB "${db_name}"`);
      db.getSiblingDB(db_name).dropDatabase();
    }
  }
}