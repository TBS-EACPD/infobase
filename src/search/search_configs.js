import { Table } from '../core/TableClass.js';
import { GlossaryEntry } from '../models/glossary.js';
import { escapeRegExp } from '../core/utils.js';
import { Subject } from '../models/subject.js';
import { trivial_text_maker } from '../models/text.js';

const { Dept, Gov, Program, Tag, CRSO } = Subject;

function create_re_matcher(query, accessors){

  const raw_tokens = query.split(" ");

  const reg_exps = _.map(raw_tokens, token => new RegExp( escapeRegExp(_.deburr(token) ), 'gi') );

  return obj => _.chain(accessors)
    .map(accessor => (
      _.isString(accessor) ? 
        obj[accessor] :
        accessor(obj)
    ))
    .some(str => {
      if(!_.isString(str)){
        return false;
      } else { 
        str = _.deburr(str)
        return _.every(reg_exps, re => str.match(re))
      }
    })
    .value();
}

const org_attributes_to_match = [ 
  'legal_name', 
  'applied_title',
  'fancy_acronym',
  'other_lang_fancy_acronym',
  'other_lang_applied_title',
];

const org_templates = {
  header_function: ()=> Dept.plural,
  name_function:  org => {
    if(org.level !== "gov" && _.isEmpty(org.tables)){
      return `<span class="search-grayed-out-hint"> ${org.name} ${trivial_text_maker("limited_data")} </span>`
    }
    return (
      org.applied_title ? 
        `${org.name} (${org.applied_title})` :
        org.name
    );
  },
};

const orgs_with_data_with_gov = {
  ...org_templates,
  get_data: () => [Gov].concat( Dept.depts_with_data() ),
  filter: (query, datum) => create_re_matcher(query, org_attributes_to_match)(datum),
};

const all_orgs_without_gov = {
  ...org_templates,
  get_data: () => Dept.get_all(),
  filter: (query, datum) => create_re_matcher(query, org_attributes_to_match)(datum),
};

const all_orgs_with_gov = {
  ...org_templates,
  get_data: () => [ Gov ].concat( _.reject(Dept.get_all(), "is_dead") ),
  filter: (query, datum) => create_re_matcher(query, org_attributes_to_match)(datum),
};


const all_dp_orgs = {
  ...org_templates,
  get_data: () => _.filter(Dept.get_all(), 'dp_status'),
  filter: (query, datum) => create_re_matcher(query, org_attributes_to_match)(datum),
};

const glossary_attributes_to_match = [
  'definition', 
  'title',
];

const glossary = {
  header_function: ()=> trivial_text_maker('glossary'),
  name_function: glossaryItem => `
    <div style="font-size:14px; line-height:1.8em; padding:5px 0px;"> 
      ${glossaryItem.title}
    </div>
    <div style='color:#333; padding:0px 20px 20px 20px; font-size:12px; line-height:1; border-bottom:1px solid #CCC;'> 
      ${glossaryItem.definition}
    </div>
  `,
  get_data: () => GlossaryEntry.fully_defined_entries,
  filter: (query, datum) => create_re_matcher(query, glossary_attributes_to_match)(datum),
};

const glossary_lite = {
  header_function: () => trivial_text_maker('glossary'),
  name_function: _.property('title'),
  get_data: () => GlossaryEntry.fully_defined_entries,
  filter: (query, datum) => create_re_matcher(query, glossary_attributes_to_match)(datum),
};


const gocos = {
  header_function: () => `${Tag.plural} - ${Tag.tag_roots.GOCO.name}`,
  name_function: _.property('name'),
  get_data: () => _.chain(Tag.get_all())
    .filter( ({root}) => root === Tag.tag_roots.GOCO )
    .filter('is_lowest_level_tag')
    .value(),
  filter: (query, datum) => create_re_matcher(query, ['name', 'description'])(datum),
};

const how_we_help = {
  header_function: () => `${Tag.plural} - ${Tag.tag_roots.HWH.name}`,
  name_function: _.property('name'),
  get_data: () => _.filter(Tag.get_all(), {root: Tag.tag_roots.HWH}),
  filter: (query, datum) => create_re_matcher(query, ['name', 'description'])(datum),
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
  filter: (query, datum) => create_re_matcher(query, ['name', 'flat_tag_titles'])(datum),
};

const programs = {
  header_function: () => trivial_text_maker('programs'),
  name_function: program => `${program.name} (${program.dept.sexy_name})`,
  get_data: () => _.reject(Program.get_all(), 'dead_program'),
  filter: (query, datum) => create_re_matcher(query, ['name', 'description'])(datum),
}

//only include CRs because SO's have really really long names
const crsos = {
  header_function: () => trivial_text_maker('core_resps'),
  name_function: crso => `${crso.name} (${crso.dept.sexy_name})`,
  get_data: () => _.filter(CRSO.get_all(), 'is_cr'),
  filter: (query, datum) => create_re_matcher(query, ['name'])(datum),
}

export {
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
