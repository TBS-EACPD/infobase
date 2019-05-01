import { completeAssign } from '../general_utils.js';

class BaseClass {}
class MixinBuilder {
  constructor(superclass){
    this.superclass = superclass;
  }
  with(...mixins){
    return mixins.reduce((c,mixin) => mixin(c), this.superclass);
  }
}

// class MyClass extends mix(MyBaseClass).with(Mixin1, Mixin2) { ... }
export const mix = (superclass) => new MixinBuilder(superclass);

export const staticStoreMixin = superclass => {
  const _storeMap = new Map();
  const baseclass = superclass || BaseClass;
  return class extends baseclass {
    static register(id,instance){
      _storeMap.set(+id || id, instance);
    }
    static lookup(id){
      return _storeMap.get(+id || id);
    }
    static get_all(){
      return _.uniqBy(Array.from(_storeMap.values()));
    }
    static get __store__(){ return _storeMap; } //allow access to the underlying map
  };
};

export const exstensibleStoreMixin = superclass => {
  const baseclass = superclass || BaseClass;
  const baseclassWithStaticStore = staticStoreMixin(baseclass);
  return class extends baseclassWithStaticStore {
    static extend(id, extension_object){
      const target_member = this.lookup(id);
      if ( target_member ){
        completeAssign(target_member, extension_object);
      } else {
        throw `Can not extend ${id} on ${this}, ${id} is not a registered member`;
      }
    }
    static extend_or_register(id, object){
      if ( this.lookup(id) ){
        this.extend(id, object)
      } else {
        this.register(id, object)
      }
    }
  };
};

export const PluralSingular = superclass => {
  const baseclass = superclass || BaseClass;
  return (
    class extends baseclass {
      singular(context){
        return this.__singular__? this.__singular__ : this.constructor.singular;
      }
      plural(context){
        return this.__plural__? this.__plural__ : this.constructor.plural;
      }
    }
  );
};

export const SubjectMixin = superclass => {
  const baseclass = superclass || BaseClass;
  return class SubjectMixin extends baseclass{
    constructor(){ super(); }
    get guid(){ return this.level + "_" + this.id; }
    get level(){ return this.constructor.type_name; }
    is(comparator){
      if (_.isString(comparator)){
        return this.level === comparator;
      }
      return this.constructor === comparator;
    }
  };
};

export const CanHaveAPIData = superclass => {
  const baseclass = superclass || BaseClass;
  return class SubjectMixin extends baseclass{
    constructor(){ 
      super(); 
      this._has_data = {
        results_data: null,
        budget2018_data: null,
        budget2019_data: null,
      };
      this._API_data_types = _.keys(this._has_data);
    }
    set_has_data(data_type, has_data){
      if ( _.includes(this._API_data_types, data_type) ){
        this._has_data[data_type] = has_data;
      } else {
        throw `"${data_type}" is not a valid API data type for "has data" checks`;
      }
    }
    has_data(data_type){
      if ( _.includes(this._API_data_types, data_type) ){
        if ( _.isNull(this._has_data[data_type]) ){
          throw `"has data" status for data type "${data_type}" has yet to be loaded!`;
        } else {
          return this._has_data[data_type];
        }
      } else {
        throw `"${data_type}" is not a valid API data type for "has data" checks`;
      }
    }
  };
};