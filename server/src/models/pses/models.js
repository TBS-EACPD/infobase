import _ from 'lodash';
import { en_fr } from '../schema_utils';

export default function define_resource_models(model_singleton){
  
  const { models } = model_singleton;

  const _pses_questions_by_id = {};
  class PsesQuestion {
    constructor(obj){
      Object.assign(this, obj);
    }
    static register(obj){
      const inst = new PsesQuestion(obj);
      _pses_questions_by_id[inst.id] = inst;
    }
    static get_all(){
      return _.values(_pses_questions_by_id);
    }
    static get_by_id(id){
      return _pses_questions_by_id[id];
    }
  }

  const _pses_data_by_dept_code = {};
  class PsesData {
    constructor(obj){
      Object.assign(this, obj);
    }
    static register(obj){
      const inst = new PsesData(obj);
      if(!_pses_data_by_dept_code[inst.dept_code]){
        _pses_data_by_dept_code[inst.dept_code] = [];
      }
      _pses_data_by_dept_code[inst.dept_code].push(inst);
    }
    static get_by_dept_code(dept_code){
      return _pses_data_by_dept_code[dept_code];
    }
    static get_gov(){
      return _pses_data_by_dept_code["ZGOC"];
    }
    
  }

  model_singleton.define('PsesQuestion', PsesQuestion);
  model_singleton.define('PsesData', PsesData);
  


}
