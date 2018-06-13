const {
  Dept,
  Gov,
  Program,
  Tag,
  CRSO,
} = require('../models/subject.js');
const { Table } = require('../core/TableClass.js');

const { GlossaryEntry } = require('../models/glossary.js');
const {trivial_text_maker} = require('../models/text.js');

const {
  escapeRegExp,
} = require('../core/utils.js');

function create_re_matcher(query, accessors){

  const raw_tokens = query.split(" ");

  const reg_exps = _.map(raw_tokens, token => new RegExp(escapeRegExp(_.deburr(token)), 'gi') );

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
  header: ()=> Dept.plural,
  suggestion:  org => (
    org.applied_title ? 
    `${org.name} (${org.applied_title})` :
    org.name
  ),
};

const orgs_with_data_with_gov = {
  query_matcher: () => {
    const to_search = [ Gov ].concat(Dept.depts_with_data() )
    return query => _.filter(
      to_search,
      create_re_matcher(query, org_attributes_to_match)
    )
  },
  templates: org_templates,
};

const all_orgs_without_gov = {
  query_matcher: () => {
    const to_search = Dept.get_all()
    return query => _.filter(
      to_search,
      create_re_matcher(query, org_attributes_to_match)
    )
  },
  templates: org_templates,
};

const all_orgs_with_gov = {
  query_matcher: () => {
    const to_search = [Gov].concat(Dept.get_all());
    return query => _.filter(
      to_search,
      create_re_matcher(query, org_attributes_to_match)
    )
  },
  templates: org_templates,
};

const glossary_attributes_to_match = [
  'definition', 
  'title',
];

const glossary = {
  query_matcher: () => {
    const to_search = GlossaryEntry.fully_defined_entries;
    return query => _.filter(
      to_search,
      create_re_matcher(query, glossary_attributes_to_match)
    );
  },
  templates: {
    suggestion: glossaryItem => (
      `<div style="font-size:14px"> 
         <a class="typeahead scroll" href="#">${glossaryItem.title}</a> 
       </div>
       <div  style='padding: 0px 20px 20px 20px;font-size:12px;line-height:1;border-bottom:1px solid #CCC'> 
         ${glossaryItem.definition}
       </div>`
    ),
    header: ()=> trivial_text_maker('glossary'),
  },
};

const glossary_lite = {
  query_matcher: () => {
    const to_search = GlossaryEntry.fully_defined_entries;
    return query => query.length > 10 && _.filter(
      to_search,
      create_re_matcher(query, glossary_attributes_to_match)
    );
  },
  templates: {
    suggestion: _.property('title'),
    header: ()=> trivial_text_maker('glossary'),
  },
};


const gocos = {
  query_matcher: () => {
    const goco_root =Tag.tag_roots.GOCO; 
    const to_search = _.chain(Tag.get_all())
      .filter( ({root}) => root === goco_root )
      .filter('is_lowest_level_tag')
      .value();
    return query => _.filter(
      to_search,
      create_re_matcher(query, ['name', 'description'])
    );
  },
  templates: {
    header: ()=> `${Tag.plural} - ${Tag.tag_roots.GOCO.name}`,
    suggestion: _.property('name'),
  },
};

const how_we_help = {
  query_matcher: () => {
    const to_search = _.filter(Tag.get_all(), {root: Tag.tag_roots.HWH});
    return query => _.filter(
      to_search,
      create_re_matcher(query, ['name', 'description'])
    );
  },
  templates: {
    header: ()=> `${Tag.plural} - ${Tag.tag_roots.HWH.name}`,
    suggestion: _.property('name'),
  },
};

const datasets = {
  query_matcher: ()=> {
    const to_search = _.chain(Table.get_all())
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
      .value();
    
    return query => _.filter(
      to_search,
      create_re_matcher(query, ['name', 'flat_tag_titles']) 
    );

  },
  templates: {
    header: ()=> trivial_text_maker('build_a_report'),
    suggestion: table => table.title,
  },
};

const programs = {
  query_matcher: () => {
    const to_search = _.reject(Program.get_all(), 'dead_program');
    return query => _.filter(
      to_search,
      create_re_matcher(query, ['name', 'description'])
    );
  },
  templates: {
    suggestion: program => `${program.name} (${program.dept.sexy_name})`,
    header: ()=> trivial_text_maker('programs'),
  },
}

//only include CRs because SO's have really really long names
const crsos = {
  query_matcher: () => {
    const to_search = _.filter(CRSO.get_all(), 'is_cr');
    return query => _.filter(
      to_search,
      create_re_matcher(query, ['name'])
    );
  },
  templates: {
    suggestion: crso => `${crso.name} (${crso.dept.sexy_name})`,
    header: ()=> trivial_text_maker('core_resps'),
  },
}

module.exports = exports = {
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
};
