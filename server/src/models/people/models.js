import { camel_case_headcount_model_names } from "./headcount_model_utils.js";

export default function define_resource_models(model_singleton) {
  const _headcount_records_by_model_and_dept_code = {};

  class HeadcountModel {
    constructor(obj) {
      Object.assign(this, obj);
    }
    static model_name() {
      throw `
        Error: bad OOP alert, don't use HeadcountModels class directly.
        Need to create a new class extending it that overwrites the static 
        model_name() function with one that returns the name of the actual model.
      `;
    }
    static get_model_name() {
      try {
        return this.model_name();
      } catch (e) {
        console.log(e);
      }
    }
    static register(obj) {
      const { dept_code } = obj;

      const inst = new HeadcountModel(obj);

      const model_name = this.get_model_name();

      if (!_headcount_records_by_model_and_dept_code[model_name]) {
        _headcount_records_by_model_and_dept_code[model_name] = {};
      }

      if (!_headcount_records_by_model_and_dept_code[model_name][dept_code]) {
        _headcount_records_by_model_and_dept_code[model_name][dept_code] = [];
      }

      _headcount_records_by_model_and_dept_code[model_name][dept_code].push(
        inst
      );
    }
    static get_dept_records(dept_code) {
      const model_name = this.get_model_name();
      return (
        _headcount_records_by_model_and_dept_code[model_name][dept_code] || []
      );
    }
    static get_gov_records() {
      const model_name = this.get_model_name();
      return (
        _headcount_records_by_model_and_dept_code[model_name]["ZGOC"] || []
      );
    }
  }

  const headcount_model_factory = (model_name) => {
    const ExtendedHeadcountModel = class extends HeadcountModel {
      static model_name() {
        return model_name;
      }
    };
    model_singleton.define(model_name, ExtendedHeadcountModel);
  };

  camel_case_headcount_model_names.forEach((model_name) =>
    headcount_model_factory(model_name)
  );
}
