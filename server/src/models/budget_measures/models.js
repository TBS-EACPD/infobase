import _ from "lodash";

export default function define_resource_models(model_singleton){

  const _budget_measures_by_measure_id = {};

  class BudgetMeasures {
    constructor(obj){
      Object.assign(this,obj)
    }
    static register(obj){
      const { measure_id } = obj;

      const inst = new BudgetMeasures(obj);

      _budget_measures_by_measure_id[measure_id] = inst;
    }
    static get_measure_by_id(measure_id){
      return _budget_measures_by_measure_id[measure_id] || [];
    }
    static get_all_measures(){
      return _.flatMap(_budget_measures_by_measure_id) || [];
    }
  }
  
  BudgetMeasures.prototype.level = "budget_measure";

  model_singleton.define('BudgetMeasures', BudgetMeasures);


  const _budget_funds_records_by_measure_id = {};
  const _budget_funds_records_by_org_id = {};

  class BudgetFunds {
    constructor(obj){
      Object.assign(this,obj)
    }
    static register(obj){
      const { measure_id, org_id } = obj;

      const inst = new BudgetFunds(obj);

      if(!_budget_funds_records_by_measure_id[measure_id]){
        _budget_funds_records_by_measure_id[measure_id] = [];
      }
      _budget_funds_records_by_measure_id[measure_id].push(inst);

      if(!_budget_funds_records_by_org_id[org_id]){
        _budget_funds_records_by_org_id[org_id] = [];
      }
      _budget_funds_records_by_org_id[org_id].push(inst);

    }
    static get_measure_records(measure_id){
      return _budget_funds_records_by_measure_id[measure_id] || [];
    }
    static get_org_records(org_id){
      return _budget_funds_records_by_org_id[org_id] || [];
    }
    static get_all_records(){
      return _.flatMap(_budget_funds_records_by_org_id) || [];
    }
  }

  model_singleton.define('BudgetFunds', BudgetFunds);


  const _special_funding_case_records_by_id = {};

  class SpecialFundingCase {
    constructor(obj){
      Object.assign(this,obj)
    }
    static register(obj){
      const { id } = obj;

      const inst = new SpecialFundingCase(obj);

      if(!_special_funding_case_records_by_id[id]){
        _special_funding_case_records_by_id[id] = {};
      }
      _special_funding_case_records_by_id[id] = inst;

    }
    static get_by_id(id){
      return _special_funding_case_records_by_id[id] || [];
    }
    static get_all_records(org_id){
      return _.flatMap(_special_funding_case_records_by_id) || [];
    }
  }

  model_singleton.define('SpecialFundingCase', SpecialFundingCase);
}