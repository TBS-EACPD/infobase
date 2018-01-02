//keep this function around in case...
const to_clean_data = data => _.map(
  data, 
  ({
    Comment, //html crap
    Commitment, 
    Highlight,
    Priority,
    PriorityInfo, 
    Status,
    StatusIcon,
    Raw_Comment,
    Raw_Ministers,
  }, ix) => ({
    id: ix,
    ministers: _.compact(Raw_Ministers.split(';')),
    commitment: Commitment,
    status_key: status_to_status_key[Status],
    priority: Priority,
    comment: Raw_Comment,
  })
);


const status_to_status_key =  {
  "Completed - fully met": "met_full",
  "Underway - on track": "ontrack",
  "Not being pursued": "give_up",
  "Completed - modified": "met_changed",
  "Underway - with challenges": "challenging",
  "On-going commitment": "ongoing",
  "Additional commitment": "additional_commitment",
};

const status_key_to_text = _.invert(status_to_status_key);

const status_key_sort_order = [
  'met_full',
  'ontrack',
  'met_changed',
  'ongoing',

  'challenging',
  'give_up',

  'additional_commitment',
];

const sort_by_key_func = ({status_key}) => _.indexOf(status_key_sort_order, status_key);


const row_to_node = ({
  id, 
  ministers, 
  commitment,
  status_key,
  priority,
  comment,
}, parent_id="") => ({
  id: `${parent_id}-${id}`,
  parent_id,
  data:{
    type:'commitment',
    name: commitment,
    ministers,
    commitment,
    status_key,
    priority,
    comment,
    status_name: status_key_to_text[status_key],
  },
});


const create_ml_hierarchy = (data, grouping) => {

  let nodes;
  let is_single_depth = false;
  switch(grouping){
    case 'minister': {
      const all_ministers = _.chain(data)
        .map('ministers')
        .flatten()
        .uniq()
        .value();

      nodes = _.chain(all_ministers)
        .map(minister=> ({
          id: minister,
          parent_id: 'root',
          data: {
            name: minister,
            type: 'minister',
          },
          children: _.chain(data)
            .filter(({ministers}) => _.includes(ministers, minister))
            .map(row=> row_to_node(row, minister))
            .sortBy(sort_by_key_func)
            .value(),
        }))
        .sortBy('id') 
        .value()

      break;
    }
    case 'status': 
      nodes = _.chain(data)
        .groupBy('status_key')
        .map( (group, status_key) => ({
          id: status_key,
          parent_id:'root',
          data: {
            name: status_key_to_text[status_key],
            type: 'status',
          },
          children: _.chain(group)
            .map(row => row_to_node(row, status_key))  
            .sortBy('data.name')
            .value(),

        }))
        .sortBy('data.name')
        .value()

      break;
    case 'priority':
    default:
      nodes = _.chain(data)
        .groupBy('priority')
        .map( (group,priority)=> ({
          id: priority,
          parent_id: 'root',
          data: {
            type:'priority',
            name: priority,
            count: group.length,
          },
          children: _.chain(group)
            .map( row => row_to_node(row,priority))
            .sortBy(sort_by_key_func)
            .value(),
        }))
        .value()
      break;
  }

  const root = {
    id: 'root',
    root: true,
    data: {
      type:'root',
    },
    children: nodes,
  };


  return [ 
    root, 
    ...root.children, 
    ..._.chain(root.children)
      .map('children')
      .flatten()
      .compact()
      .value(),
  ];


}

module.exports = exports = {
  create_ml_hierarchy,
}