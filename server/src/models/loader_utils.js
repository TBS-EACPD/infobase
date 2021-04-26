import DataLoader from "dataloader";
import _ from "lodash";

// we need to return matched rows from this loader grouped and ordered by the ids that were matched on
// BUT the target foreign key attr may be a path to a subdocument's foreign key (so we need depth in our group by), and
// any of those subdocuments may have been arrays of subdocuments which may have been matched on by more
// than one of the ids we were looking for (so we need completeness in our final grouping)...
// hence the following
const deep_and_complete_group_by = (attr_path, ids, rows) => {
  const keys_in_attr_path = attr_path.split(".");

  const get_rows_that_matched_on_id = (id) =>
    _.filter(rows, (row) =>
      _(keys_in_attr_path)
        .thru((keys_in_attr_path) =>
          _.reduce(
            keys_in_attr_path,
            (documents, attr) => {
              if (documents.isMongooseArray) {
                return _.flatMap(
                  documents.toObject(),
                  (document) => document[attr]
                );
              } else if (_.isArray(documents)) {
                return _.flatMap(documents, (document) => document[attr]);
              } else {
                return documents[attr];
              }
            },
            row
          )
        )
        .includes(id)
    );

  const groups_of_all_matches_by_id = _.chain(ids)
    .map((id) => [id, get_rows_that_matched_on_id(id)])
    .fromPairs()
    .mapValues((matched_rows) =>
      _.isEmpty(matched_rows) ? null : matched_rows
    )
    .value();

  return groups_of_all_matches_by_id;
};
//dataloaders for fetching children based on parent key
export function create_resource_by_foreignkey_attr_dataloader(model, fk_attr) {
  return new DataLoader(
    async function (fk_ids) {
      const rows = await model.find({
        [fk_attr]: { $in: _.uniq(fk_ids) },
      });
      const rows_by_id = deep_and_complete_group_by(fk_attr, fk_ids, rows);
      return _.map(fk_ids, (id) => rows_by_id[id]);
    },
    { cache: !!process.env.USE_REMOTE_DB }
  );
}

//dataloaders for fetching rows by id
export function create_resource_by_id_attr_dataloader(model, id_attr) {
  return new DataLoader(
    async function (ids) {
      const rows = await model.find({
        [id_attr]: { $in: _.uniq(ids) },
      });
      const rows_by_id = _.keyBy(rows, (row) => _.get(row, id_attr));
      return _.map(ids, (id) => rows_by_id[id]);
    },
    { cache: !!process.env.USE_REMOTE_DB }
  );
}
