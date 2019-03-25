import { sanitized_marked } from '../general_utils.js';
import { businessConstants } from './businessConstants.js';
import { Subject } from '../models/subject.js';
import { trivial_text_maker } from './text.js';

const { Program, CRSO } = Subject;
const { months } = businessConstants;

const parent_indexed_sub_program_entities = {};
const sub_program_entities_by_id = {};
class SubProgramEntity {
  static sub_programs(program_id){
    return parent_indexed_sub_program_entities[program_id] || [];
  } 
  static lookup(id){
    return sub_program_entities_by_id[id];
  }
  static create_and_register(def){
    const { id, parent_id } = def;

    if(sub_program_entities_by_id[id]){
      return;
    }

    const inst = new SubProgramEntity(def)

    if(!parent_indexed_sub_program_entities[parent_id]){
      parent_indexed_sub_program_entities[parent_id] = [];
    }
    parent_indexed_sub_program_entities[parent_id].push(inst);
    sub_program_entities_by_id[id] = inst;

  }
  constructor(def){
    Object.assign(this,def);
  }
  resources(doc){
    const records = (
      doc === 'drr17' ?
        [ 
          {
            year: "pa_last_year_planned",
            ftes: this.planned_spend_pa_last_year,
            spending: this.planned_fte_pa_last_year,
          },
          {
            year: "pa_last_year",
            ftes: this.fte_pa_last_year,
            spending: this.spend_pa_last_year,
          },
        ] :
        [
          { 
            year: 'planning_year_1',
            ftes: this.fte_planning_year_1,
            spending: this.spend_planning_year_1,
          },
          { 
            year: 'planning_year_2',
            ftes: this.fte_planning_year_2,
            spending: this.spend_planning_year_2,
          },
          { 
            year: '{{planning_year_3}}',
            ftes: this.fte_planning_year_3,
            spending: this.spend_planning_year_3,
          },
        ]
    );

    return _.map(records, ({ year, ftes, spending }) => ({
      year, 
      ftes: _.isNumber(ftes) ? ftes : trivial_text_maker('unknown'), 
      spending: _.isNumber(spending) ? spending : trivial_text_maker('unknown'),
    }));
  }
  resource_notes(doc){
    return _.chain(this)
      .pick(
        doc === 'dp18' ? 
          [
            'dp_no_spending_expl',
            'dp_spend_trend_expl',
            'dp_no_fte_expl',
            'dp_fte_trend_expl',
          ] : 
          [ 
            'drr_spend_expl',
            'drr_fte_expl',
          ]
      )
      .values()
      .compact()
      .map( txt => sanitized_marked(txt) )
      .value();
  }
  children(){
    return parent_indexed_sub_program_entities[this.id] || [];
  }
  //currently not being used
  static get_all(){
    return _.chain(parent_indexed_sub_program_entities)
      .map(_.identity)
      .flatten()
      .value();
  }
  get level(){
    const { parent_id } = this;
    return (
      this.constructor.lookup(parent_id) ?
        'sub_sub_program' :
        'sub_program'
    );
  }
  singular(){
    return trivial_text_maker(this.level);
  }
  plural(){
    return trivial_text_maker(this.level+"s");
  }
  get guid(){
    return `${this.level}_${this.id}`;
  }
  get has_dp_resources(){
    return _.chain(this)
      .pick([
        'spend_planning_year_1',
        'spend_planning_year_2',
        'spend_planning_year_3',
        'fte_planning_year_1',
        'fte_planning_year_2',
        'fte_planning_year_3',
      ])
      .some(num => _.isNumber(num) && !_.isNaN(num) )
      .value();
  }
  get has_drr_resources(){
    return _.chain(this)
      .pick([
        "spend_pa_last_year",
        "planned_spend_pa_last_year",

        "fte_pa_last_year",
        "planned_fte_pa_last_year",
      ])
      .some(num => _.isNumber(num) && !_.isNaN(num) )
      .value();
  }
}



//critical assumption: ids are unique accross programs, CRs, sub-programs and sub-sub-programs
//FIXME data issue:
// Note that Finance BLJ's programs will all share the same result, 
//this makes it impossible 
//and it introduces the potential of problem of double counting.
const entity_indexed_results = {};
const id_indexed_results = {};
class Result {
  static get_all(){
    return _.map(id_indexed_results, _.identity);
  }
  static lookup(id){
    return id_indexed_results[id];
  }
  static get_entity_results(id){
    return entity_indexed_results[id] || [];
  }
  static create_and_register(def){

    const { 
      id,
      subject_id,
      name,
    } = def;

    //ignore anything too empty
    if( _.isEmpty(id) || _.isEmpty(subject_id) || _.isEmpty(name) ){ 
      return;
    }

    //if it already exists, ignore it
    if(id_indexed_results[id]){
      return; 
    }

    const inst = new Result(def);

    //keep structures in sync with what's loaded
    if(!entity_indexed_results[subject_id]){
      entity_indexed_results[subject_id] = [];
    }
    entity_indexed_results[subject_id].push(inst);

    id_indexed_results[id] = inst;
  }
  static get_departmental_results(dept_obj){
     
    return _.chain(dept_obj.crsos)
      .filter('is_cr')
      .map( ({id}) => Result.get_entity_results(id) )
      .flatten()
      .filter('is_dr')
      .value();

  }
  constructor(fields){
    Object.assign(this, fields);
  }
  get indicators(){
    return Indicator.lookup_by_result_id(this.id);
  }
  //HACKY: this implies an internal service but not does catch all internal services
  isInternalService(){
    return parseInt(this.id.split('-')[1]) > 9000;
  }
  singular(){
    return trivial_text_maker('result');
  }  
  plural(){
    return trivial_text_maker('results');
  }
  get level(){
    return "result";
  }
  get guid(){
    return `result_${this.id}`;
  }
  get subject(){
    const { subject_id } = this;
    let program = Program.lookup(subject_id);
    let crso = CRSO.lookup(subject_id);
    let sub_prog = SubProgramEntity.lookup(subject_id);

    return program || crso || sub_prog;
  }
  get parent_level(){
    const subject = this.subject;
    if(subject.level === 'crso'){
      return subject.is_cr ? 'cr' : 'so';
    } else {
      return subject.level;
    }
  }
  get is_dr(){
    return this.parent_level === 'cr';
  }
  get contributing_programs(){
    return _.chain(PI_DR_Links.get_contributing_program_ids_for_result(this.id))
      .map(prog_id => Program.lookup(prog_id) )
      .compact()
      .value();
  }
  static get_flat_results(subject){
    return _get_flat_results(subject);
  }
}

//currently only supports dept, crso, programs, subs and sub-subs
function _get_flat_results(subject){
  switch(subject.level){
    case 'sub_sub_program':
      return Result.get_entity_results(subject.id);

    case 'sub_program':
    case 'program':
      return _.chain( SubProgramEntity.sub_programs(subject.id) )
        .map( _get_flat_results )
        .flatten()
        .concat( Result.get_entity_results(subject.id) )
        .uniqBy('id')
        .compact()
        .value();
          
    case 'crso':
      return _.chain(subject.programs)
        .map(_get_flat_results)
        .flatten()
        .concat( Result.get_entity_results(subject.id) )
        .compact()
        .value();
      
    case 'dept':
      return _.chain(subject.crsos)
        .map(_get_flat_results)
        .flatten()
        .compact()
        .value();

    default:
      return [];

  }
}


const result_indexed_indicators = {};
const id_indexed_indicators = {};
class Indicator {
  static get_all(){
    return _.map(id_indexed_indicators, _.identity);
  }
  static lookup(id){
    return id_indexed_indicators[id];
  }
  static lookup_by_result_id(result_id){
    return result_indexed_indicators[result_id] || [];
  }
  constructor(def){
    Object.assign(this,def);
  }
  static create_and_register(def){
    const { id, result_id } = def;

    if(this.lookup(id)){
      return;
    }

    const inst = new Indicator(def);

    id_indexed_indicators[id] = inst;

    if(!result_indexed_indicators[result_id]){
      result_indexed_indicators[result_id] = [];
    } 
    result_indexed_indicators[result_id].push(inst);

  }
  get level(){
    return "indicator";
  }
  singular(){
    return trivial_text_maker('indicator');
  }
  plural(){
    return trivial_text_maker('indicators');
  }
  get guid(){
    return `indicator_${this.id}`;
  }
  get target_date(){
    const { target_month, target_year } = this;
    if( _.isNumber(target_month) && _.isNumber(target_year) ){
      return `${months[target_month].text} ${target_year}`;
    } else if( _.isNumber(target_year) ){
      return target_year;
    } else if( _.nonEmpty(target_year) ){
      return trivial_text_maker(target_year);
    } else {
      return trivial_text_maker("unspecified_date_to_achieve");
    }
  }
  static get_flat_indicators(subject){
    return _.chain(Result.get_flat_results(subject))
      .map('indicators')
      .flatten()
      .compact()
      .uniqBy('id')
      .value();
  }
  //dont use this on multiple indicators, it'll be super slow!
  get _result(){
    return Result.lookup(this.result_id)
  }

}


//does not use staticStoreMixin because it's a linkage table, there's no primary key
const links = [];
const id_indexed_links = {}; //IDs === <PI_ID>-<DR_ID>

const PI_DR_Links = {
  add(program_id, result_id){
    const unique_id = `${program_id}-${result_id}`;
    if(!id_indexed_links[unique_id]){
      const obj = {program_id, result_id};
      id_indexed_links[unique_id] = obj;
      links.push(obj);
    }
  },
  get_tagged_results_for_program(program_id){
    return _.chain(links)
      .filter({ program_id})
      .map(({result_id})=> Result.lookup(result_id))
      .compact()
      .value();
  },
  get_contributing_program_ids_for_result(result_id){
    return _.chain(links)
      .filter({ result_id})
      .map('program_id')
      .value();
  },
  _all(){ return links; }, //debugging purposes
};

//assumes ensure_loaded: results_summary has been called
const results_counts_not_loaded_error = "result counts have not yet been loaded!";
const ResultCounts = {
  data: null,
  get_dept_counts(org_id){
    if(_.isEmpty(this.data)){
      throw results_counts_not_loaded_error;
    }
    return _.chain(this.data)
      .find({ id: org_id.toString() })
      .value();
  },
  get_gov_counts(){
    if(_.isEmpty(this.data)){
      throw results_counts_not_loaded_error;
    }
    return _.chain(this.data)
      .find({ id: 'total' })
      .value();
  },
  get_data(){
    if(_.isEmpty(this.data)){
      throw results_counts_not_loaded_error;
    }
    return this.data;
  },
  set_data(data){
    if(!_.isEmpty(this.data)){
      throw "data has already been set";
    }
    this.data = data;

  },
  get_all_dept_counts(){
    return _.filter(this.data, {level: 'dept'}); 
  },
};

//assumes ensure_loaded: results_summary has been called
const granular_results_counts_not_loaded_error = "granular result counts have not yet been loaded!";
const GranularResultCounts = {
  data: null,
  get_subject_counts(subject_id){
    if(_.isEmpty(this.data)){
      throw granular_results_counts_not_loaded_error;
    }
    return _.chain(this.data)
      .find({ id: subject_id })
      .value();
  },
  get_data(){
    if(_.isEmpty(this.data)){
      throw granular_results_counts_not_loaded_error;
    }
    return this.data;
  },
  set_data(data){
    if(!_.isEmpty(this.data)){
      throw "data has already been set";
    }
    this.data = data;
  },
  get_all_crso_counts(){
    return _.filter(this.data, {level: 'crso'}); 
  },
  get_all_program_counts(){
    return _.filter(this.data, {level: 'program'}); 
  },
};

const ordered_status_keys = ['met', 'not_met', 'not_available', 'future'];
const status_key_to_glossary_key = {
  met: "RESULTS_MET",
  not_met: "RESULTS_NOT_MET",
  not_available: "RESULTS_NOT_AVAILABLE",
  future: "RESULTS_ONGOING",
};
const status_key_to_svg_name = {
  met: "met",
  not_met: "attention-req",
  not_available: "not-applicable",
  future: "on-track",
};

export {
  Result,
  Indicator,
  SubProgramEntity,
  PI_DR_Links,
  ResultCounts,
  GranularResultCounts,
  status_key_to_glossary_key,
  status_key_to_svg_name,
  ordered_status_keys,
};

Object.assign(window._DEV_HELPERS, {
  Result,
  Indicator,
  SubProgramEntity,
  PI_DR_Links,
  ResultCounts,
  GranularResultCounts,
});
