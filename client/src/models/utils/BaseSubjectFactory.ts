import _ from "lodash";

export const BaseSubjectFactory = (
  subject_type: string,
  subject_singular: string,
  subject_plural: string,
  api_data_types = [] as string[]
) =>
  class BaseSubject {
    id: string;
    constructor({ id }: { id: string }) {
      this.id = id;
    }

    static subject_type = subject_type;
    get subject_type() {
      return subject_type;
    }
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

    // eslint-disable-next-line @typescript-eslint/ban-types
    is(comparator: string | Function) {
      if (_.isString(comparator)) {
        return subject_type === comparator;
      }
      return this.constructor === comparator;
    }

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

//
// SUBJECT_TS_TODO legacy code below here, to be refactored on this branch
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
