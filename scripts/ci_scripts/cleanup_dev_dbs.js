const active_db_names = active_branches
  .replace(/^[ ]*origin\//g, "")
  .replace(/\n[ ]*origin\//g, ",")
  .split(",");
const meta_db_names = ["admin", "local"];

const dbs_to_retain = active_db_names.concat(meta_db_names);

const all_dev_db_names = db.adminCommand({
  listDatabases: 1,
  nameOnly: true,
}).databases;

let nothing_to_drop = true;
for (i = 0; i < all_dev_db_names.length; i++) {
  const db_name = all_dev_db_names[i].name;
  // Double underscore branch names are exempt from automatic clean up
  if (
    !dbs_to_retain.includes(db_name) &&
    !/(^__)|(^archived__)/.test(db_name)
  ) {
    print(`Droping stale dev DB "${db_name}"`);
    db.getSiblingDB(db_name).dropDatabase();

    nothing_to_drop = false;
  }
}

if (nothing_to_drop) {
  print("No stale dev DBs to drop");
}
