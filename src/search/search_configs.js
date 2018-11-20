import { Fragment } from 'react';

import { Table } from '../core/TableClass.js';
import { GlossaryEntry } from '../models/glossary.js';

import { Subject } from '../models/subject.js';
import { trivial_text_maker } from '../models/text.js';

import { 
  query_to_reg_exps,
  highlight_search_match,
  InfoBaseHighlighter,
} from './search_utils.js';

const { Dept, Gov, Program, Tag, CRSO } = Subject;

function create_re_matcher(query, accessors, config_name){

  const reg_exps = query_to_reg_exps(query);

  const re_matcher = obj => _.chain(accessors)
    .map(accessor => (
      _.isString(accessor) ? 
        obj[accessor] :
        accessor(obj)
    ))
    .some(str => {
      if( !_.isString(str) ){
        return false;
      } else { 
        str = _.deburr(str)
        return _.every( reg_exps, re => str.match(re) )
      }
    })
    .value();
  
  const nonce = _.random(0.1, 1.1);
  let nonce_use_count = 0;

  return _.memoize(
    re_matcher,
    obj => !_.isUndefined(obj.id) ? obj.id : nonce + (nonce_use_count++),
  );
}
const memoized_re_matchers = _.memoize(
  create_re_matcher,
  (query, accessors, config_name) => query + config_name
);

const org_attributes_to_match = [ 
  'legal_name', 
  'applied_title',
  'fancy_acronym',
  'other_lang_fancy_acronym',
  'other_lang_applied_title',
];

const org_templates = {
  header_function: () => Dept.plural,
  name_function: org => org.applied_title ? `${org.name} (${org.applied_title})` : org.name,
  menu_content_function: function(org, search){
    if ( org.level !== "gov" && _.isEmpty(org.tables) ){
      return (
        <span className="search-grayed-out-hint">
          <InfoBaseHighlighter 
            search={search} 
            content={`${org.name} ${trivial_text_maker("limited_data")}`} 
          />
        </span>
      );
    } else {
      return (
        <InfoBaseHighlighter 
          search={search}
          content={ this.name_function(org) }
        />
      );
    }
  },
};

const orgs_with_data_with_gov = {
  ...org_templates,
  get_data: () => [Gov].concat( Dept.depts_with_data() ),
  filter: (query, datum) => memoized_re_matchers(query, org_attributes_to_match, "orgs_with_data_with_gov")(datum),
};

const all_orgs_without_gov = {
  ...org_templates,
  get_data: () => Dept.get_all(),
  filter: (query, datum) => memoized_re_matchers(query, org_attributes_to_match, "all_orgs_without_gov")(datum),
};

const all_orgs_with_gov = {
  ...org_templates,
  get_data: () => [ Gov ].concat( _.reject(Dept.get_all(), "is_dead") ),
  filter: (query, datum) => memoized_re_matchers(query, org_attributes_to_match, "all_orgs_with_gov")(datum),
};


const all_dp_orgs = {
  ...org_templates,
  get_data: () => _.filter(Dept.get_all(), 'dp_status'),
  filter: (query, datum) => memoized_re_matchers(query, org_attributes_to_match, "all_dp_orgs")(datum),
};

const glossary_attributes_to_match = [
  'definition', 
  'title',
];

const glossary = {
  header_function: ()=> trivial_text_maker('glossary'),
  name_function: _.property('title'),
  menu_content_function: (glossaryItem, search) => (
    <Fragment>
      <div 
        style={{
          fontSize: "14px",
          lineHeight: "1.8em",
          padding: "5px 0px",
        }}
        dangerouslySetInnerHTML={{ __html: highlight_search_match(search, glossaryItem.title) }}
      /> 
      <div 
        style={{
          fontSize: "12px",
          lineHeight: "1",
          padding: "0px 20px 20px 20px",
          borderBottom: "1px solid #CCC",
          color: "#333",
        }}
        dangerouslySetInnerHTML={{ __html: highlight_search_match(search, glossaryItem.definition) }}
      />
    </Fragment>
  ),
  get_data: () => GlossaryEntry.fully_defined_entries,
  filter: (query, datum) => memoized_re_matchers(query, glossary_attributes_to_match, "glossary")(datum),
};

const glossary_lite = {
  header_function: () => trivial_text_maker('glossary'),
  name_function: _.property('title'),
  get_data: () => GlossaryEntry.fully_defined_entries,
  filter: (query, datum) => memoized_re_matchers(query, glossary_attributes_to_match, "glossary_lite")(datum),
};


const gocos = {
  header_function: () => `${Tag.plural} - ${Tag.tag_roots.GOCO.name}`,
  name_function: _.property('name'),
  get_data: () => _.chain(Tag.get_all())
    .filter( ({root}) => root === Tag.tag_roots.GOCO )
    .filter('is_lowest_level_tag')
    .value(),
  filter: (query, datum) => memoized_re_matchers(query, ['name'], "gocos")(datum),
};

const how_we_help = {
  header_function: () => `${Tag.plural} - ${Tag.tag_roots.HWH.name}`,
  name_function: _.property('name'),
  get_data: () => _.filter(Tag.get_all(), {root: Tag.tag_roots.HWH}),
  filter: (query, datum) => memoized_re_matchers(query, ['name'], "how_we_help")(datum),
};

const datasets = {
  header_function: () => trivial_text_maker('build_a_report'),
  name_function: table => table.title,
  get_data: () => _.chain(Table.get_all())
    .reject('reference_table')
    .map( t => ({
      name: t.name,
      title: t.title,
      flat_tag_titles: _.chain(t.tags)
        .map(key => GlossaryEntry.lookup(key))
        .compact()
        .map('title')
        .compact()
        .pipe( titles => titles.join(" ") )
        .value(),
      table: t,
    }))
    .value(),
  filter: (query, datum) => memoized_re_matchers(query, ['name', 'flat_tag_titles'], "datasets")(datum),
};

const programs = {
  header_function: () => trivial_text_maker('programs'),
  name_function: program => `${program.name} (${program.dept.sexy_name})`,
  get_data: () => _.reject(Program.get_all(), 'dead_program'),
  filter: (query, datum) => memoized_re_matchers(query, ['name'], "programs")(datum),
};

//only include CRs because SO's have really really long names
const crsos = {
  header_function: () => trivial_text_maker('core_resps'),
  name_function: crso => `${crso.name} (${crso.dept.sexy_name})`,
  get_data: () => _.filter(CRSO.get_all(), 'is_cr'),
  filter: (query, datum) => memoized_re_matchers(query, ['name'], "crsos")(datum),
};

export {
  highlight_search_match,

  all_orgs_without_gov,
  orgs_with_data_with_gov,
  all_orgs_with_gov,
  glossary,
  glossary_lite,
  how_we_help,
  gocos,
  datasets,
  programs,
  crsos,
  all_dp_orgs,
};
