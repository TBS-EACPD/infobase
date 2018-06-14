const { text_maker, TM } = require('./intro_graph_text_provider');
const {
  PanelGraph,
  TextPanel,
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
  level: 'dept',
  key : "links_to_rpb",
  footnotes: false,

  calculate(subject){
    return !_.chain(subject.tables)
      .compact()
      .isEmpty()
      .value();
  },

  render({calculations}){
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

    return <TextPanel title={text_maker("links_to_rpb_title")}>
      <TM k="links_to_rpb_text"/>
      <WellList elements={list_args} />
    </TextPanel>;
  },
});

new PanelGraph({
  level: 'gov',
  key : "links_to_rpb",
  footnotes: false,
  calculate: _.constant(true),

  render({calculations}){
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
    
    return <TextPanel title={text_maker("links_to_rpb_title")}>
      <TM k="links_to_rpb_text"/>
      <WellList elements={list_args} />
    </TextPanel>;

  },
});
