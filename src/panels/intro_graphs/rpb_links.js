const {
  PanelGraph,
  reactAdapter,
  panel_components: {
    PanelText,
  },
  text_maker,
} = require("../shared"); 

const { rpb_link } = require('../../link_utils.js');

const { Table } = require('../../core/TableClass.js');

const { WellList } = require('./WellList.js');


const people_table_ids = [
  'table9',
  'table10',
  'table11',
  'table112',
  'table302',
  'table303',
  'table304',
];

const get_table_type = table => (
  _.includes(people_table_ids, table.id) ?
  text_maker("people") :
  text_maker("finances")
);

new PanelGraph({
  is_old_api: true,
  level: 'dept',
  key : "links_to_rpb",
  title: "links_to_rpb_title",
  text: "links_to_rpb_text",

  layout : {
    full :{  graph : [12]},
    half : { graph : [12]},
  },

  footnotes: false,

  calculate(subject){
    return !_.chain(subject.tables)
      .compact()
      .isEmpty()
      .value();
  },

  render(panel,calculations){
    const { subject } = calculations;

    const list_args = _.chain(subject.tables)
      .map(id => Table.lookup(id) )
      .compact()
      .groupBy(get_table_type)
      .map( (group_of_tables, table_type_title) => ({
        display: <strong dangerouslySetInnerHTML={{__html: table_type_title}} />,
        children: _.chain(group_of_tables)
          .map(table => ({
            href: rpb_link({
              subject: subject.guid,
              table:table.id,
              mode: 'details',
            }),
            display: table.name,
          }))
          .sortBy('display')
          .value(),
      }))
      .value()
    
    const view = <PanelText>
      <div className="medium_panel_text">
        <WellList elements={list_args} />
      </div>
    </PanelText>;


    reactAdapter.render(
      view, 
      panel.areas().graph.node() 
    );
  },
});

new PanelGraph({
  is_old_api: true,
  level: 'gov',
  key : "links_to_rpb",
  footnotes: false,

  layout : {
    full :{  graph : [12]},
    half : { graph : [12]},
  },

  title: "links_to_rpb_title",
  text: "links_to_rpb_text",
  calculate: _.constant(true),

  render(panel,calculations){
    const { subject } = calculations;

    const list_args = _.chain(Table.get_all())
      .reject('reference_table')
      .groupBy(get_table_type)
      .map( (group_of_tables, table_type_title) => ({
        display: <strong dangerouslySetInnerHTML={{__html: table_type_title}} />,
        children: _.chain(group_of_tables)
          .map(table => ({
            href: rpb_link({subject: subject.guid, table:table.id}),
            display: table.name,
          }))
          .sortBy('display')
          .value(),
      }))
      .value()
    
    const view = <PanelText>
      <div className="medium_panel_text">
        <WellList elements={list_args} />
      </div>
    </PanelText>;


    reactAdapter.render(
      view, 
      panel.areas().graph.node() 
    );
  },
});
