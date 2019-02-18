import _ from 'lodash';
import DataLoader from 'dataloader';

//dataloaders for fetching children based on parent key
export function create_resource_by_foreignkey_attr_dataloader(model,fk_attr){
  return new DataLoader(async function(fk_ids){
    const rows = await model.find({
      [ fk_attr ] : { "$in" : _.uniq(fk_ids) },
    })
    const rowgroups_by_fk = _.groupBy(rows,fk_attr)
    return _.map(fk_ids, fk => rowgroups_by_fk[fk])
  })
}

//dataloaders for fetching rows by id
export function create_resource_by_id_attr_dataloader(model, id_attr){
  return new DataLoader(async function(ids){
    const uniq_ids = _.uniq(ids);
    const rows = await model.find({
      [id_attr]: { "$in": uniq_ids },
    })
    const rows_by_id = _.keyBy(rows,id_attr)
    return _.map(ids, id => rows_by_id[id])
  })
}
