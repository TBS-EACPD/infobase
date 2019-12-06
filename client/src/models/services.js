import { 
  mix,
  staticStoreMixin,
  PluralSingular, 
  SubjectMixin,
} from './storeMixins.js';
import { trivial_text_maker } from '../models/text.js';

// dependencies are tangled up too much here, disable it for the whole file
/* eslint-disable no-use-before-define */

const static_subject_store = () => mix().with(staticStoreMixin, PluralSingular, SubjectMixin);

const Service = class Service extends static_subject_store(){
  static get type_name(){ return 'service'; }
  static get singular(){ return trivial_text_maker("service"); }
  static get plural(){ return trivial_text_maker("services"); }
  get level(){ return "service"; }
  get guid(){ return `service_${this.id}`; }

  static create_and_register(def){
    const { service_id } = def;
    // duplicate service_id as id since it makes sense
    def.id = def.service_id;
    const inst = new Service(def);
    this.register(service_id, inst );
  }

  get standards(){
    return ServiceStandard.lookup(this.id);
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


const ServiceStandard = class ServiceStandard extends static_subject_store(){
  static get type_name(){ return 'service_standard'; }
  static get singular(){ return trivial_text_maker("service_standard"); }
  static get plural(){ return trivial_text_maker("service_standards"); }
  get level(){ return "service_standard"; }
  get guid(){ return `standard_${this.id}`; }

  static create_and_register(def){
    const {id, serv} = def;
    const inst = new Service(serv);
    this.register(id, inst );
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