import _ from "lodash";

import { completeAssign } from "src/general_utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

type StoreInstanceBase = { id: string; alt_ids?: string[] };

class StaticStore<definition, instance extends StoreInstanceBase> {
  private store: Map<string, instance>;
  private register = (instance: instance) => {
    this.store.set(instance.id, instance);

    _.forEach(instance.alt_ids, (id) => this.store.set(id, instance));
  };

  create: (def: definition) => instance;
  create_and_register: (definition: definition) => void;

  constructor(
    store: Map<string, instance>,
    create: (def: definition) => instance
  ) {
    this.store = store;

    this.create = create;

    this.create_and_register = (def: definition) => {
      this.register(create(def));
    };
  }

  lookup = (id: string) => this.store.get(id);
  get_all = () => _.uniq(Array.from(this.store.values())); // TODO why's a unique needed here?
}

export const StaticStoreFactory = <
  definition,
  instance extends StoreInstanceBase
>(
  create = _.identity as (def: definition) => instance
): StaticStore<definition, instance> => {
  const store = new Map<string, instance>();
  return new StaticStore(store, create);
};

export const CanHaveServerDataMixinFactory = (data_types: string[]) =>
  class SubjectMixin {
    private _has_data = _.chain(data_types)
      .map((data_type) => [data_type, null])
      .fromPairs()
      .value();

    set_has_data(data_type: string, has_data: boolean) {
      if (_.includes(data_types, data_type)) {
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
      if (_.includes(data_types, data_type)) {
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

//
// TODO legacy code below here, to be refactored on this branch
//

type ConstructorType = { [key: string]: any };

class BaseClass {}
class MixinBuilder {
  superclass: any;
  constructor(superclass: any) {
    this.superclass = superclass;
  }
  with(
    ...mixins: (
      | typeof staticStoreMixin
      | typeof exstensibleStoreMixin
      | typeof PluralSingular
      | typeof SubjectMixin
      | ((superclass: any) => unknown)
    )[]
  ) {
    return mixins.reduce((c, mixin) => mixin(c), this.superclass);
  }
}

// class MyClass extends mix(MyBaseClass).with(Mixin1, Mixin2) { ... }
export const mix = (superclass?: any) => new MixinBuilder(superclass);

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

export const exstensibleStoreMixin = <T>(superclass: any) => {
  const baseclass = superclass || BaseClass;
  const baseclassWithStaticStore = staticStoreMixin(baseclass);
  return class extends baseclassWithStaticStore {
    static extend(id: string, extension_object: { [key: string]: any }) {
      const target_member = this.lookup(id);
      if (target_member) {
        completeAssign(target_member, extension_object);
      } else {
        throw new Error(
          `Can not extend ${id} on ${this}, ${id} is not a registered member`
        );
      }
    }
    static extend_or_register(id: string, object: T) {
      if (this.lookup(id)) {
        this.extend(id, object);
      } else {
        this.register(id, object);
      }
    }
  };
};

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
