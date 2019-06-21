import { text_maker, TM } from './intro_graph_text_provider';
import { PanelGraph, TextPanel } from '../shared';
import { rpb_link } from '../../link_utils.js';
import { Table } from '../../core/TableClass.js';
import { WellList } from './WellList.js';


const people_table_ids = [
  'orgEmployeeType',
  'orgEmployeeRegion',
  'orgEmployeeAgeGroup',
  'orgEmployeeExLvl',
  'orgEmployeeGender',
  'orgEmployeeFol',
  'orgEmployeeAvgAge',
];

const get_table_type = table => (
  _.includes(people_table_ids, table.id) ?
  text_maker("people") :
  text_maker("finances")
);

new PanelGraph({
  level: 'dept',
  key: "links_to_rpb",
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
              table: table.id,
              mode: 'details',
            }),
            display: table.name,
          }))
          .sortBy('display')
          .value(),
      }))
      .value();

    return <TextPanel title={text_maker("links_to_rpb_title")}>
      <TM k="links_to_rpb_text"/>
      <WellList elements={list_args} />
    </TextPanel>;
  },
});

new PanelGraph({
  level: 'gov',
  key: "links_to_rpb",
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
            href: rpb_link({subject: subject.guid, table: table.id}),
            display: table.name,
          }))
          .sortBy('display')
          .value(),
      }))
      .value();
    
    return <TextPanel title={text_maker("links_to_rpb_title")}>
      <TM k="links_to_rpb_text"/>
      <WellList elements={list_args} />
    </TextPanel>;

  },
});
