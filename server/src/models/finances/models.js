import _ from 'lodash';
import { financial_cols, fte_cols } from './constants';
/*
  This is table6/12, the main 2 tables. We'll probably want methods or helper funcs to do the following

  * internal service resource
  * resource by GOCA
  * trends (year-over-year, historical, planning_year_3 vs pa_last_year, 8 year)
  * % of parent spending 
  * whole-of-government  


*/ 




export default function define_resource_models(model_singleton){

  const _spending_records_by_dept_code = {};
  const _spending_records_by_program_id = {};

  class ProgramSpending {
    constructor(obj){
      Object.assign(this,obj)
    }
    static register(obj){
      const { program_id, dept_code } = obj;

      const inst = new ProgramSpending(obj);

      _spending_records_by_program_id[program_id] = inst;

      if(!_spending_records_by_dept_code[dept_code]){
        _spending_records_by_dept_code[dept_code] = [];
      }
      _spending_records_by_dept_code[dept_code].push(inst)


    }
    static get_program_record(program_id){
      return _spending_records_by_program_id[program_id]
    }
    static get_dept_records(dept_code){
      return _spending_records_by_dept_code[dept_code] || [];
    }

    static get_totals(subject){

      const records = this.get_flat_data(subject);

      return _.chain(records)
        .groupBy('year')
        .map( (group, year) => ({
          year,
          amount: _.sumBy(group, "amount"),
        }))
        .value();
    }

    static get_gov_record(){
      return _.first(_spending_records_by_dept_code["ZGOC"]);
    }

    static get_flat_data(subject){
      let records;
      if(subject.level === "program"){
        
        records = this.get_program_record(subject.id);
        if(records){
          records = [ records ];
        } else {
          return [];
        }
      } else if(subject.level === "org"){
        records = this.get_dept_records(subject.dept_code);
  
      } else if(subject.level === 'gov'){
        records = [ this.get_gov_record() ];
  
      }
  
      return _.chain(records)
        .flatMap( row =>  _.map(financial_cols, year => ({
          year,
          amount: row[year],
        }))
        )
        .compact("amount")
        .value();
    }




  }




  const _fte_records_by_dept_code = {};
  const _fte_records_by_program_id = {};

  class ProgramFte {
    constructor(obj){
      Object.assign(this,obj)
    }
    static register(obj){
      const { program_id, dept_code } = obj;


      const inst = new ProgramFte(obj);
      
      _fte_records_by_program_id[program_id] = inst;

      if(!_fte_records_by_dept_code[dept_code]){
        _fte_records_by_dept_code[dept_code] = [];
      }
      _fte_records_by_dept_code[dept_code].push(inst)
    }
    static get_program_record(program_id){
      return _fte_records_by_program_id[program_id];
    }
    static get_dept_records(dept_code){
      return _fte_records_by_dept_code[dept_code] || [];
    }
    static get_gov_record(){
      return _.first(_fte_records_by_dept_code["ZGOC"]);
    }

    static get_totals(subject){

      const flat_records = this.get_flat_data(subject);
      
      return _.chain(flat_records)
        .groupBy('year')
        .map( (group, year) => ({
          year,
          amount: _.sumBy(group, 'amount'),
        }))
        .value();
    }


    static get_flat_data(subject){
      let records;
      if(subject.level === "program"){
  
        records = this.get_program_record(subject.id);
        if(records){
          records = [ records ];
        } else {
          return [];
        }
      } else if(subject.level === "org"){
        records = this.get_dept_records(subject.dept_code);
  
      } else if(subject.level === 'gov'){
        records = [ this.get_gov_record() ];
  
      }
  
      return _.chain(records)
        .flatMap( row =>  _.map(fte_cols, year => ({
          year,
          amount: row[year],
        })) )
        .compact("amount")
        .value();
    }
  }

  model_singleton.define('ProgramSpending', ProgramSpending);
  model_singleton.define('ProgramFte', ProgramFte);
}
