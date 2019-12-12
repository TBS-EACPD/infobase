import { 
  mix,
  staticStoreMixin,
  PluralSingular, 
  SubjectMixin,
} from './storeMixins.js';
import { trivial_text_maker } from '../models/text.js';

import { Program, Dept } from './organizational_entities.js';

// dependencies are tangled up too much here, disable it for the whole file
/* eslint-disable no-use-before-define */

const static_subject_store = () => mix().with(staticStoreMixin, PluralSingular, SubjectMixin);

const Service = class Service extends static_subject_store(){
  static get type_name(){ return 'service'; }
  static get singular(){ return trivial_text_maker("service"); }
  static get plural(){ return trivial_text_maker("services"); }
  static get_by_dept(org_id){
    return _.filter(Service.get_all(), serv => serv.subject.id === org_id);
  }
  get level(){ return "service"; }
  get guid(){ return `service_${this.id}`; }

  get subject(){ return Dept.lookup(this.org_id); }

  static create_and_register(def){
    const { service_id } = def;
    // duplicate service_id as id since it makes sense for each subject-like object to have an id
    def.id = def.service_id;
    const inst = new Service(def);
    this.register(service_id, inst );
  }

  get contributing_programs(){
    return _.map(this.program_ids, prog_id => Program.lookup(prog_id) );
  }

  get standards(){
    return service_indexed_standards[this.id];
  }

  constructor(serv){
    super();

    _.assign(
      this,
      {
        ...serv,
      }
    );
  }
};

const service_indexed_standards = [];
const ServiceStandard = class ServiceStandard extends static_subject_store(){
  static get type_name(){ return 'service_standard'; }
  static get singular(){ return trivial_text_maker("service_standard"); }
  static get plural(){ return trivial_text_maker("service_standards"); }
  get level(){ return "service_standard"; }
  get guid(){ return `standard_${this.id}`; }

  static create_and_register(def){
    const { standard_id, service_id } = def;
    // duplicate service_id as id since it makes sense for each subject-like object to have an id
    def.id = def.standard_id;

    const inst = new ServiceStandard(def);
    this.register(standard_id, inst);

    if(!service_indexed_standards[service_id]){
      service_indexed_standards[service_id] = [];
    } 
    service_indexed_standards[service_id].push(inst);
  }

  get service(){
    return Service.lookup(this.service_id);
  }

  constructor(serv){
    super();

    _.assign(
      this,
      {
        ...serv,
      }
    );
  }
};

export { Service, ServiceStandard };