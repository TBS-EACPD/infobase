import _ from "lodash";

import { Store } from "./make_store";

export const BaseSubjectFactory = <SubjectDef extends { id: string }>(
  subject_type: string,
  subject_singular: string,
  subject_plural: string,
  api_data_types = [] as string[]
) =>
  class BaseSubject {
    id: string;

    constructor(def: SubjectDef) {
      /*
        Blind spot in the type system with `Object.assign` to `this` inside a constructor. Watch https://github.com/microsoft/TypeScript/issues/26792

        We want this factory to create BaseSubjects that are generic against SubjectDef, which we in practice achieve with the Object.assign below...
        but TS doesn't pick up on that yet.
        
        Implementing subjects must fill in this blind spot with interface merging, e.g.:
        ```
          interface SubjectDef {
            ...
          }
          export interface Subject extends SubjectDef {} // // eslint-disable-line @typescript-eslint/no-empty-interface
          export class Subject extends BaseSubjectFactory<SubjectDef>...
        ```

        ... the aternative is a LOT of boilerplate, effectively repeating SubjectDef block three times (interface itself, internal class property typing,
        AND individual assignment of each property inside the class' constructor) 
      */
      Object.assign(this, def);

      // redundant to the above, but necessary to locally fill in type system blind spot
      this.id = def.id;
    }

    static subject_type = subject_type;
    get subject_type() {
      return subject_type;
    }

    // TODO want to deprecate this as redundant to subject_type, but lots of legacy code to sift through for that
    static level = subject_type;
    get level() {
      return subject_type;
    }

    static subject_singular = subject_singular;
    get subject_singular() {
      return subject_singular;
    }

    static subject_plural = subject_plural;
    get subject_plural() {
      return subject_plural;
    }

    get guid() {
      return subject_type + "_" + this.id;
    }

    /*
      can't cleanly (complile time) enforce that the child class declares a static store property...
        - using abstract is out (can't mix with or use for static methods)
        - can't pass a store instance in to the factory because that'd be a circular reference to the child class from the parent class
    */
    static store = {
      create: get_store_method_placeholder(subject_type),
      create_and_register: get_store_method_placeholder(subject_type),
      lookup: get_store_method_placeholder(subject_type),
      get_all: get_store_method_placeholder(subject_type),
      // ommit private methods from Store, TODO would be handy to have a util type for that, or at least for multi-key omits
    } as Omit<Omit<Store<any, any>, "store">, "register">; // eslint-disable-line @typescript-eslint/no-explicit-any

    private _has_data = _.chain(api_data_types)
      .map((data_type) => [data_type, null])
      .fromPairs()
      .value();
    set_has_data(data_type: string, has_data: boolean) {
      if (_.includes(api_data_types, data_type)) {
        const store_value = this._has_data[data_type];

        const store_value_is_unset = _.isNull(store_value);
        if (store_value_is_unset) {
          this._has_data[data_type] = has_data;
        } else {
          throw new Error(
            `"${data_type}" has_data already set with value of "${store_value}" for this instance`
          );
        }
      } else {
        throw new Error(
          `"${data_type}" is not a valid API data type for this subject`
        );
      }
    }
    has_data(data_type: string) {
      if (_.includes(api_data_types, data_type)) {
        if (_.isNull(this._has_data[data_type])) {
          throw new Error(
            `"has data" status for data type "${data_type}" has yet to be loaded!`
          );
        } else {
          return this._has_data[data_type];
        }
      } else {
        throw new Error(
          `"${data_type}" is not a valid API data type for this subject`
        );
      }
    }
  };

const get_store_method_placeholder = (subject_type: string) => () => {
  throw new Error(
    `Subject class of type "${subject_type}" does not properly implement a store property.`
  );
};

//
// SUBJECT_TS_TODO legacy code below here, to be refactored on this branch
//

type ConstructorType = { [key: string]: any }; // eslint-disable-line @typescript-eslint/no-explicit-any

class BaseClass {}
class MixinBuilder {
  superclass: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(superclass: any) {
    this.superclass = superclass;
  }
  with(
    ...mixins: (
      | typeof staticStoreMixin
      | typeof PluralSingular
      | typeof SubjectMixin
      | ((superclass: any) => unknown) // eslint-disable-line @typescript-eslint/no-explicit-any
    )[]
  ) {
    return mixins.reduce((c, mixin) => mixin(c), this.superclass);
  }
}

// class MyClass extends mix(MyBaseClass).with(Mixin1, Mixin2) { ... }
export const mix = (superclass?: any) => new MixinBuilder(superclass); // eslint-disable-line @typescript-eslint/no-explicit-any

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const staticStoreMixin = <T>(superclass: any) => {
  const _storeMap = new Map();
  const baseclass = superclass || BaseClass;
  return class extends baseclass {
    static register(id: string, instance: T) {
      _storeMap.set(+id || id, instance);
    }
    static lookup(id: string) {
      return _storeMap.get(+id || id);
    }
    static get_all() {
      return _.uniq(Array.from(_storeMap.values()));
    }
    static get __store__() {
      return _storeMap;
    } //allow access to the underlying map
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PluralSingular = (superclass: any) => {
  const baseclass = superclass || BaseClass;
  return class extends baseclass {
    singular() {
      return this.__singular__
        ? this.__singular__
        : (this.constructor as ConstructorType).singular;
    }
    plural() {
      return this.__plural__
        ? this.__plural__
        : (this.constructor as ConstructorType).plural;
    }
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SubjectMixin = (superclass: any) => {
  const baseclass = superclass || BaseClass;
  return class SubjectMixin extends baseclass {
    constructor() {
      super();

      const required_constructor_keys = ["subject_type", "singular", "plural"];
      const missing_required_constructor_properties = _.filter(
        required_constructor_keys,
        (key: string) =>
          _.chain(this.constructor as ConstructorType)
            .get(key)
            .isUndefined()
            .value()
      );

      if (!_.isEmpty(missing_required_constructor_properties)) {
        throw new Error(
          `${
            this.constructor.name
          } subject constructor is missing the required properties {${_.join(
            missing_required_constructor_properties,
            ", "
          )}}`
        );
      }
    }
    get guid() {
      return this.level + "_" + this.id;
    }
    get level() {
      return (this.constructor as ConstructorType).subject_type;
    }
    is(comparator: string | ConstructorType) {
      if (_.isString(comparator)) {
        return this.level === comparator;
      }
      return this.constructor === comparator;
    }
  };
};

export const CanHaveServerData =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (data_types: string[]) => (superclass: any) => {
    const baseclass = superclass || BaseClass;
    return class SubjectMixin extends baseclass {
      constructor() {
        super();
        this._API_data_types = data_types;
        this._has_data = _.chain(data_types)
          .map((data_type) => [data_type, null])
          .fromPairs()
          .value();
      }
      set_has_data(data_type: string, has_data: boolean) {
        if (_.includes(this._API_data_types, data_type)) {
          const store_value = this._has_data[data_type];

          const store_value_is_unset = _.isNull(store_value);
          if (store_value_is_unset) {
            this._has_data[data_type] = has_data;
          } else {
            throw new Error(
              `"${data_type}" has_data already set with value of "${store_value}" for this instance`
            );
          }
        } else {
          throw new Error(
            `"${data_type}" is not a valid API data type for this subject`
          );
        }
      }
      has_data(data_type: string) {
        if (_.includes(this._API_data_types, data_type)) {
          if (_.isNull(this._has_data[data_type])) {
            throw new Error(
              `"has data" status for data type "${data_type}" has yet to be loaded!`
            );
          } else {
            return this._has_data[data_type];
          }
        } else {
          throw new Error(
            `"${data_type}" is not a valid API data type for this subject`
          );
        }
      }
    };
  };
