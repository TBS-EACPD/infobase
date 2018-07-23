import { mix } from '../generalUtils.js';
import { 
  staticStoreMixin, 
  PluralSingular, 
  SubjectMixin,
} from './staticStoreMixin.js';
import { trivial_text_maker } from '../models/text.js';




const common = () => mix().with(staticStoreMixin, PluralSingular, SubjectMixin);

const gov_name = ( 
  window.lang === 'en' ? 
  "Government" : 
  "Gouvernement" 
);

const Subject = {};

Subject.Gov = {
  constructor : {
    type_name : 'gov',
  },
  id: 'gov',
  guid: 'gov_gov',
  is(comparator){
    if (_.isString( comparator)){
      return this.level === comparator;
    }
    return this.constructor === comparator;
  },
  level: 'gov',
  get has_planned_spending(){ return true},
  lookup(){ return this; },
  name: gov_name,
  description : gov_name,
  // the following name-like fields are for compatibility with old APIs and to ensure it's searchable in org-searches
  title: gov_name,
  legal_name: gov_name, //hacky thing to include gov in the search
  sexy_name: gov_name,
};


//TODO: MandateItem class
//class MandateItem extends common() {
//  static get type_name() { return 'mandate_item'; }
//  static get singular(){ return trivial_text_maker("mandate_commitment");}
//  static get plural(){ return trivial_text_maker("mandate_commitments");}
//};

Subject.Ministry = class Ministry extends common(){
  static get type_name() { return 'ministry'; }
  static get singular(){ return trivial_text_maker("ministry") }
  static get plural(){ return trivial_text_maker("ministries")}

  static create_and_register(id,name){
    const inst = new Ministry(id,name);
    this.register(id, inst);
    return inst;
  }
  constructor(id,name){
    super();
    this.id = id;
    this.name = name;
    this.description = "";
    this.orgs = [];
  }
};

Subject.Dept = class Dept extends common(){
  static lookup(org_id){
    return super.lookup(
      _.isNaN(+org_id) ?
      org_id :
      +org_id
    );
  }
  static get type_name() { return 'dept'; }
  static get singular(){ return trivial_text_maker("org") }
  static get plural(){ return trivial_text_maker("orgs")}
  static get dept_code(){ return this.acronym } //TODO: replace all .acronym with dept_code
  static depts_with_data(){ 
    //lazy initialized
    if(!this._depts_with_data){ 
      this._depts_with_data = _.filter(
        this.get_all(),
        dept => !_.isEmpty(dept.table_ids)
      );
    }
    return this._depts_with_data;
  }
  static create_and_register(def){
    const inst = new Dept(def)
    this.register(inst.id,inst)
    if(!_.isEmpty(inst.acronym)){
      this.register(inst.acronym,inst);
    }
    return inst;
  }
  constructor(def){
    super();
    Object.assign(
      this, 
      {
        name : def.legal_name,
        id : def.unique_id,
        minister_objs: [],
        table_ids: [],
        crsos:[],
      },
      def
    );
  }
  get is_first_wave(){
    return this.dp_status === 'fw'
  }

  get programs(){
    return _.chain(this.crsos)
      .map('programs')
      .flatten()
      .compact()
      .value();
  }
  //TODO: has planned spending should be renamed is_rpp_org
  get has_planned_spending(){
    return !(
      _.includes([
        "NSICP", //new org that first appeared in Supps B 17-18
        "CSEC", 
        "CSIS",
        "FCAC",
        "IJC",
        "GG",
      ],this.acronym) ||
      _.includes([ 
        "Crown Corporations", 
        "Sociétés d'État", 
        "Parliamentary Entities",
        "Entités Parlementaires",
      ],this.type)
    );
  }
  get is_rpp_org(){
    return this.dp_status !== false;
  }
  get dp_status(){
    const val = this._dp_status
    if(val === 1){ 
      return "fw";
    } else if(val === 0){
      return "sw";
    } else {
      return false;
    }
  }
  get sexy_name(){
    return this.applied_title || this.name;
  }
  get tables(){
    return this.table_ids; 
  }
  //...LEGACY API
  //TODO: fix external code 
  //(igoc.js, igoc profile and hierarchies are the biggest offenders) 
  get type(){
    return this.inst_form.name;
  }
  get inst_p_group(){
    return this.inst_form.parent_form.name;
  }
  get inst_gp_group(){
    return this.inst_form.parent_form.parent_form.name;
  }
  get min(){
    return this.ministry.name;
  }
  get minister(){
    return _.map(this.ministers, 'name');
  }
  get auditor(){
    return (
      _.isEmpty(this.auditor_str) ?
      [] :
      [ this.auditor_str ]
    );
  }
  get legislation(){
    return (
      _.isEmpty(this._legislation) ?
      [] :
      [ this._legislation ]
    );
  }
  get is_dead(){
    return _.nonEmpty(this.end_yr) || this.status !== trivial_text_maker("active");
  }



  /*
    POPULATION GROUPS:

    fps (schedule I, faa_hr in (IV,V)
      cpa (schedule I, faa_hr IV)
        min_depts (schedule I)
        cpa_other_portion (schedule IV)
      separate_agencies (faa_hr V)
    na (schedule not I, faa_hr NULL)

  */
  get pop_group_gp_key(){
    const { schedule, faa_hr } = this;
    if(schedule==="I" || _.includes(["IV","V"], faa_hr) ){
      return "fps";
    } else {
      return "na";
    }
  }
  get pop_group_parent_key(){
    const { schedule, faa_hr } = this;
    if(this.pop_group_gp_key === 'fps'){
      if(schedule==="I" || faa_hr==="IV"){
        return "cpa";
      } else {
        return "separate_agencies"; 
      }
    }
  }
  get granular_pop_group_key(){
    const { schedule } = this;
    if(this.pop_group_parent_key === "cpa"){
      if(schedule === "I"){
        return "cpa_min_depts";
      } else {
        return "cpa_other_portion";
      }
    }
  }
}

const tag_roots = [];
Subject.Tag = class Tag extends common(){
  static get tag_roots(){ 
    return _.chain(tag_roots)
      .map(tag_root => [ tag_root.id, tag_root ] )
      .fromPairs()
      .value();
  }
  static get type_name() { return 'tag'; }
  static get singular(){ return trivial_text_maker("tag") }
  static get plural(){ return trivial_text_maker("tag")+"s"}
  static create_and_register(def){
    const inst = new Tag(def);
    this.register(inst.id, inst);
    return inst;
  }
  static create_new_root(def){
    const root = this.create_and_register(def);
    root.root = root;
    tag_roots.push(root);
    return root;
  }
  static get gocos_by_spendarea(){
    const goco_root = _.find(tag_roots, {id: "GOCO"});
    return goco_root.children_tags;
  }
  constructor(attrs){
    super();
    Object.assign(
      this,
      {
        programs: [],
        children_tags: [],
      },
      attrs
    );
  }
  singular(){

    if(this.root.id === "GOCO"){
      if (this.parent_tag && _.includes(tag_roots,this.parent_tag)){
        return trivial_text_maker("spend_area");
      } else {
        return trivial_text_maker("goco");
      }
    } else {
      if (_.nonEmpty(this.programs) && _.isEmpty(this.children_tags)){
        return trivial_text_maker("tag");
      } else {
        return trivial_text_maker("tag_category");
      }
    }

  }
  get is_first_wave(){ //in concordance with other subject classes...
    return false;
  }
  plural(){

    if(this.root.id === "GOCO"){
      if (this.parent_tag && _.includes(tag_roots,this.parent_tag)){
        return trivial_text_maker("spend_areas");
      } else {
        return trivial_text_maker("gocos");
      }
    } else if(this.root.id === "MLT"){
      if(!this.is_lowest_level_tag){
        return trivial_text_maker("priorities");
      } else {
        return trivial_text_maker("commitments");
      }
    } else {
      if (_.nonEmpty(this.programs) && _.isEmpty(this.children_tags)){
        return trivial_text_maker("tag")+"(s)";
      } else {
        return trivial_text_maker("tag_categories");
      }
    }

  }
  get number_of_tagged(){ return this.programs.length; }
  get is_lowest_level_tag(){ return _.nonEmpty(this.programs); }
  get has_planned_spending(){ 
    return this.is_lowest_level_tag &&
      _.some(this.programs, program => program.has_planned_spending);
  }
  get planned_spending_gaps(){
    return this.is_lowest_level_tag &&
      _.some(this.programs, program => !program.has_planned_spending);
  }
  tagged_by_org(){
    return _.chain(this.programs)
    //.filter(tagged => tagged.dept)
      .groupBy(prog => prog.dept.id )
      .toPairs()
      .map(([org_id, programs]) => {
        return {
          name : Subject.Dept.lookup(org_id).name,
          programs :   _.sortBy(programs,"name"),
        };
      })
      .sortBy("name")
      .value();
  }
  get sexy_name(){
    return this.name;
  }
  get is_m2m(){
    return this.root.cardinality === 'MtoM';
  }
  related_tags(){
    return _.chain(this.programs)
      .map( prog => prog.tags )
      .flatten()
      .uniqBy()
      .without(this)
      .filter({ root : this.root })
      .value();
  }
};

Subject.CRSO = class CRSO extends common(){
  static get singular(){ return trivial_text_maker("");}
  static get plural(){ return trivial_text_maker(""); }
  static get type_name() { return 'crso'; }
  static create_and_register(def){
    const inst = new CRSO(def);
    this.register(inst.id, inst);
    return inst;
  }
  constructor(attrs){
    super();
    Object.assign(
      this,
      { 
        programs: [], 
      }, 
      attrs
    );
  }
  singular(){ 
    if(this.is_cr){
      return trivial_text_maker("core_resp");
    } else {
      return trivial_text_maker("strategic_outcome");
    }
  }
  plural(){ 
    if(this.is_cr){
      return trivial_text_maker("core_resps");
    } else {
      return trivial_text_maker("strategic_outcomes");
    }
  }
  get sexy_name(){
    return this.name;
  }
  get has_planned_spending(){ 
    return _.some(this.programs, program => program.has_planned_spending);
  }
  //TODO: confirm old SO's are tagged internal service correctly
  // get is_internal_service(){
  //   return _.some(this.programs, 'is_internal_service');
  // }
  get is_cr(){
    return this.is_drf;
  }
  get is_first_wave(){
    return this.dept.is_first_wave;
  }
  get dead_so(){
    return !this.is_active;
  }
};

Subject.Program = class Program extends common(){
  static get type_name(){ return 'program'; }
  static get singular(){ return trivial_text_maker("program") }
  static get plural(){ return trivial_text_maker("programs") }
  static unique_id(dept, activity_code) { //dept can be an object, an acronym or a dept unique_id.
    const dept_acr = _.isObject(dept) ? dept.acronym : Subject.Dept.lookup(dept).acronym;
    return `${dept_acr}-${activity_code}`;
  }
  static get_from_activity_code(dept_code , activity_code){
    return this.lookup(this.unique_id(dept_code,activity_code));
  }
  static create_and_register(def){
    const inst = new Program(def);
    this.register(inst.id, inst);
    return inst;
  }
  constructor(attrs){
    super();
    Object.assign(
      this,
      { 
        tags: [], 
      },
      attrs
    );
    this.id = this.constructor.unique_id(this.dept,this.activity_code);
  }
  get tags_by_scheme(){
    return _.groupBy(this.tags,tag => tag.root.id);
  }
  get has_planned_spending(){
    return this.dept.has_planned_spending;
  }
  get link_to_infographic(){
    return `#orgs/program/${this.id}/infograph`
  }
  get sexy_name(){
    return this.name;
  }
  get is_first_wave(){
    return this.crso.is_cr;
  }
  get dead_program(){
    return !this.is_active;
  }
};


//Currently doesnt do anything, not even link to other departments
Subject.Minister = class Minister extends common(){
  static get type_name() { return 'minister'; }
  static get singular(){ return trivial_text_maker("minister") }
  static get plural(){ return trivial_text_maker("minister")}

  static create_and_register(id,name){
    const inst = new Minister(id,name);
    this.register(inst.id, inst);
    return inst;
  }
  constructor(id,name){
    super();
    this.id = id;
    this.name = name;
    this.description = "";
  }
};


Subject.InstForm = class InstForm extends common(){
  static grandparent_forms(){
    return _.filter(
      this.get_all(), 
      obj => _.isEmpty(obj.parent_forms)
    );
  }
  static parent_forms(){
    return _.filter(
      this.get_all(), 
      obj => (
        obj.parent_form && 
        _.nonEmpty(obj.children_forms)
      )
    );
  }
  static leaf_forms(){
    return _.filter(
      this.get_all(), 
      obj => _.isEmpty(obj.children_forms) 
    );
  }
  static create_and_register(id,name){
    const inst = new InstForm(id,name);
    this.register(inst.id, inst);
    return inst;
  }
  constructor(id,name){
    super();
    Object.assign(this, {
      id,
      name,
      //Below will be populated by the creator
      parent_form: null, 
      children_forms: [],
      orgs: [],
    });
  }
  singular(){
    throw "TODO";
  }
  plural(){
    throw "TODO";
  }
}

const submeasures_by_parent_id = {};
Subject.BudgetMeasure = class BudgetMeasure extends common(){
  static get type_name(){ return 'budget_measure'; }
  static get singular(){ return trivial_text_maker("budget_measure"); }
  static get plural(){ return trivial_text_maker("budget_measures"); }
  
  static make_budget_link(chapter_key, ref_id){
    const valid_chapter_keys_to_page_number = {
      grw: "01",
      prg: "02",
      rec: "03",
      adv: "04",
      oth: "",
    };
  
    const is_chapter_key_valid = _.has(valid_chapter_keys_to_page_number, chapter_key);
    const is_ref_id_valid = !_.isUndefined(ref_id) && !_.isEmpty(ref_id);
  
    if (!is_chapter_key_valid){
      return `https://www.budget.gc.ca/2018/home-accueil-${window.lang}.html`;
    } else if (chapter_key === "oth"){
      return {
        en: "https://www.budget.gc.ca/2018/docs/plan/anx-02-en.html#23-Other-Budget-2018-Measures-(Not-Included-in-Previous-Chapters)",
        fr: "https://www.budget.gc.ca/2018/docs/plan/anx-02-fr.html#23-Autres-mesures-prevues-dans-le-budget-de-2018-(non-incluses-dans-les-chapitres-anterieurs)",
      }[window.lang];
    } else {
      const base_chapter_link = `https://www.budget.gc.ca/2018/docs/plan/chap-${valid_chapter_keys_to_page_number[chapter_key]}-${window.lang}.html`;
  
      if (is_ref_id_valid){
        return base_chapter_link + "#" + ref_id;
      } else {
        return base_chapter_link;
      }
    }
  }
  
  static register_submeasure_to_parent({id, parent_id, name, data}){
    const submeasure = {
      id,
      parent_id,
      name,
      data,
    };
    const submeasures_of_parent = submeasures_by_parent_id[parent_id];

    if ( !_.isUndefined(submeasures_of_parent) && submeasures_of_parent.length > 0){
      submeasures_by_parent_id[parent_id] = [
        ...submeasures_of_parent,
        submeasure,
      ];
    } else {
      submeasures_by_parent_id[parent_id] = [submeasure];
    }
  }
  get submeasures(){
    const submeasures = submeasures_by_parent_id[this.id];
    return _.isUndefined(submeasures) ? [] : submeasures;
  }

  constructor({id, name, chapter_key, ref_id, description, data}){
    super();
    this.id = id;
    this.name = name;
    this.chapter_key = chapter_key;
    this.ref_id = ref_id;
    this.description = description;
    this.orgs = _.map(data, measure_data => measure_data.org_id);
    this.data = data;
    this.funds = data; // TODO legacy key, everying should be using data at the end of this
  }

  static create_and_register(args){
    if ( args.parent_id !== "" ){
      this.register_submeasure_to_parent(args);
    } else {
      const inst = new BudgetMeasure(args);
      this.register(args.id, inst);
    }
  }
};

Subject.get_by_guid = function get_by_guid(guid){
  if(!_.isString(guid)){ return null; }
  let [model_type, model_id] = guid.split('_');
  return Subject[model_type] && Subject[model_type].lookup(model_id);
}

// Duplicate keys in all lower case, for legacy reasons
_.each(Subject, (subject_item, key) => {
  const lower_case_key = _.toLower(key);
  if ( _.chain(Subject).keys().indexOf(lower_case_key).value() === -1 ){
    Subject[lower_case_key] = subject_item;
  }
});


window._Subject = Subject;

export { Subject };

