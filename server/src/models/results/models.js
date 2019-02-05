import _ from 'lodash';
import mongoose from "mongoose";
const { Schema } = mongoose;

import { 
  str_type, 
  bilingual, 
  pkey_type,
  parent_fkey_type,
} from '../model_utils.js';


export default function(model_singleton){

  //"id","subject_id","name_en","name_fr","is_efficiency","doc"
  const ResultSchema = mongoose.Schema({
    result_id: pkey_type(),
    subject_id: parent_fkey_type(),
    doc: { ...str_type },
    is_efficiency: { type: Boolean },
    ...bilingual('name',str_type),
  });


  //"id","result_id","name_en","name_fr","target_year","target_month","explanation_en","explanation_fr","target_type","target_min","target_max","target_narrative_en","target_narrative_fr","doc","actual_datatype","actual_result_en","actual_result_fr","status_color","status_period"
  const IndicatorSchema = mongoose.Schema({
    indicator_id: pkey_type(),
    result_id: parent_fkey_type(),
  });


  const _subs_by_id = {};
  const _subs_by_parent_id = {};

  const { models } = model_singleton;
  

  class SubProgram {
    constructor(obj){
      Object.assign(this,obj);
    }
    static register(obj){
      const {id, parent_id} = obj;

      const inst = new SubProgram(obj);
      _subs_by_id[id] = inst;

      if(!_subs_by_parent_id[parent_id]){
        _subs_by_parent_id[parent_id] = [];
      }
      _subs_by_parent_id[parent_id].push(inst);

    }
    static get_by_id(id){
      return _subs_by_id[id];
    }
    static get_by_parent_id(id){
      return _subs_by_parent_id[id] || [];
    }

    get sub_programs(){
      return _subs_by_parent_id[this.id] || [];
    }
    get is_sub_sub(){
      return !!(_subs_by_id[this.parent_id]);
    }
  }

  SubProgram.prototype.level = 'sub_program';

  const _results_by_id = {};
  const _results_by_subject_id = {};
  class Result {
    constructor(obj){
      Object.assign(this,obj);
    }
    static register(obj){
      const {id, subject_id} = obj;
      const inst = new Result(obj);
      _results_by_id[id] = inst;

      if(!_results_by_subject_id[subject_id]){
        _results_by_subject_id[subject_id] = [];
      }
      _results_by_subject_id[subject_id].push(inst);

    }
    static get_by_id(id){
      return _results_by_id[id];
    }
    static get_by_parent_id(parent_id){
      return _results_by_subject_id[parent_id];
    }
    
    get indicators(){
      return _indicators_by_result_id[this.id] || [];
    }
    get contributing_programs(){
      return PI_DR_Links.get_contributing_programs(this.id);
    }

  }

  const _indicators_by_id = {};
  const _indicators_by_result_id = {};
  class Indicator {
    constructor(obj){
      Object.assign(this,obj);
    }
    static register(obj){
      const { id, result_id } = obj;

      const inst = new Indicator(obj);

      _indicators_by_id[id] = inst;

      if(!_indicators_by_result_id[result_id]){
        _indicators_by_result_id[result_id] = [];
      }
      _indicators_by_result_id[result_id].push(inst);
      
    }
    static get_by_id(id){
      return _indicators_by_id[id];

    }

  }

  const pi_links_by_dr = {};
  const dr_links_by_program = {};
  const PI_DR_Links = {
    add(program_id, dr_id){
      pi_links_by_dr[dr_id] = program_id;
      dr_links_by_program[program_id] = dr_id;
    },
    get_drs(program_id){
      return _.map(dr_links_by_program[program_id], id => Result.get_by_id(id));
    },
    get_contributing_programs(result_id){
      return _.map(pi_links_by_dr[result_id], id => models.Program.get_by_id(id));
    },
  }

  const { Program } = model_singleton.models;
  _.assign(Program.prototype, {
    get_drs(){
      return _.map(PI_DR_Links.get_drs(this.id), id => Result.get_by_id(id));
    },
  });

  model_singleton.define('SubProgram', SubProgram);
  model_singleton.define('Result',Result)
  model_singleton.define('Indicator',Indicator);
  model_singleton.define("PI_DR_Links",PI_DR_Links);


}
