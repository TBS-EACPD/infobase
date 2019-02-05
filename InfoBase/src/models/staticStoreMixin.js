
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
