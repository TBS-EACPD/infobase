const { Table } = require('../core/TableClass.js');
const {GlossaryEntry} = require('../models/glossary.js');
const concepts_to_display_filter = require('../rpb/table_picker_concept_filter.js');

const FlipMove = require('react-flip-move');
const {
  TextMaker,
  Select,
} = require('../util_components.js');


const initial_datasets_state = {};


function get_concepts_for_table(table_obj){
  return _.chain(table_obj.tags)
    .filter(concepts_to_display_filter)
    .map( tag => GlossaryEntry.lookup(tag) )
    .compact()
    .value();
}

function create_dataset_hierarchy(args){

  const table_concept_links = _.chain(Table.get_all())
    .map(table => _.map(get_concepts_for_table(table), concept => ({
      concept_id: concept.id,
      table_id: table.id, 
    })))
    .flatten()
    .value();

  const tables = _.map(Table.get_all(), table => ({
    parent_id: 'root',
    id: table.id,
    data: {
      type: 'table',
      table,
      name: table.name,
      description: table.short_description,
      tags: _.chain(table_concept_links)
        .filter({table_id: table.id})
        .map( ({concept_id}) => GlossaryEntry.lookup(concept_id).title )
        .value(),
    },
  }))

  //const children = [
  //  {
  //    parent_id: 'root',
  //    id: 'financial',
  //    children: _.chain(Table.get_all())
  //      .filter(table => table.data_type.id === 'financial')
  //      .sortBy('name')
  //      .map(table => Object.assign(
  //        table_to_node(table), 
  //        {parent_id:'financial'}
  //      ))
  //      .value(),
  //    data: {
  //      name: "Financial Data",
  //    },
  //    isExpanded: true,
  //  },
  //  {
  //    parent_id: 'root',
  //    id: 'people',
  //    children: _.chain(Table.get_all())
  //      .filter(table => table.data_type.id === 'people')
  //      .sortBy('name')
  //      .map(table => Object.assign(
  //        table_to_node(table), 
  //        {parent_id:'people'}
  //      ))
  //      .value(),
  //    data: {
  //      name: "People Data",
  //    },
  //    isExpanded: true,
  //  },
  //];

  const root = {
    id: 'root',
    root: true,  
    data: {},
    children: tables, 
  };

  return [
    root,
    ...tables,
  ];

  //return [
  //  root, 
  //  ...concept_nodes,
  //  ...(
  //    _.chain(concept_nodes)
  //      .map('children')
  //      .flatten()
  //      .value()
  //  ),
  //];

}


function table_node_renderer({ node, onToggleNode, children, index }){
  const {
    data: {
      type,
    },
    id,
  } = node;

  if(id==='root'){
    return (
      <FlipMove
        staggerDurationBy="50"
        duration={500}
        typeName="ul"
        className="list-unstyled colcount-lg-2"
      > 
        {_.map(children, ({element, node}) => 
          <li key={node.id}>
            {element}
          </li>
        )}
      </FlipMove>
    );
  } else if(type==='table'){

    return (
      <div 
        style={{
          width:'100%',
          display: 'inline-block',
          marginBottom: "20px",
        }}
      >
        <TableCard {...node.data} />
      </div>
    );

  } else { 
    return null;
  }

}

const TableCard = ({description, tags, name }) => (
  <div className="item-card">
    <div className="item-title centerer">
      {name}
    </div>

    <div>
      <div className="item-description">
        <div dangerouslySetInnerHTML={{__html: description}} />  
      </div>

      <div className="item-card-footer">
        <div className="item-tag-container">
          <span role="heading"><u> <TextMaker text_key='covered_concepts' /> </u></span>
          <div className="item-tags">
            {_.map(tags, tag=> <div className='item-tag'>
              {tag}
            </div>)}
          </div>
        </div>

        <div className="item-select">
          <a 
            onClick={()=>{ alert('TODO: make this click do something') }} 
            className="btn btn-ib-primary btn-xs"
          >
              Build a report 
          </a>
        </div>

      </div>
    </div>
  </div>
);

const datasets_sidebar = () => (
  <div>
    <div>
      <label>
        Arrange by 
        <Select
          selected='data_type'
          options={[
            {id: 'data_type', display: 'type of data'},
            {id: 'source', display: 'source'},
            {id: 'tags', display: 'Covered Concepts'},
          ]}
          style={{fontSize:'1em'}}
          className="form-control"
        />
      </label>
    </div>
    <div className="checkbox">
      <label>
        <input type="checkbox" value=""/>
          Public accounts
      </label>
    </div>
    <div className="checkbox">
      <label>
        <input type="checkbox" value=""/>
          Estimates
      </label>
    </div>
    <div className="checkbox">
      <label>
        <input type="checkbox" value=""/>
          Planning documents
      </label>
    </div>
    <div className="checkbox">
      <label>
        <input type="checkbox" value=""/>
          Federal Public service demographics
      </label>
    </div>
  </div>
)

const datasets_scheme = {
  key: 'datasets',
  tree_renderer: table_node_renderer,
  title: 'data sets',
  get_props_selector: () => _.constant({}),
  get_base_hierarchy_selector: () => ()=> create_dataset_hierarchy(),
  get_sidebar_content: datasets_sidebar,
  reducer: (state=initial_datasets_state, action)=> state,
  dispatch_to_props: dispatch => ({

  }),
  initial_state: initial_datasets_state,
  get_filter_func_selector: () => () => _.identity,
}

module.exports = exports = {
  create_dataset_hierarchy,
  datasets_scheme,
}