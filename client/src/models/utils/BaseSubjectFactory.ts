import _ from "lodash";

import { Store } from "./make_store";

export const BaseSubjectFactory = <SubjectDef extends { id: string }>(
  subject_type: string,
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

    // SUBJECT_TS_TODO want to deprecate this as redundant to subject_type, but lots of legacy code to sift through for that
    static level = subject_type;
    get level() {
      return subject_type;
    }

    get guid() {
      return subject_type + "_" + this.id;
    }

    /*
      can't cleanly (complile time) enforce that the child class declares a static store property...
        - using abstract is out (can't mix with/use for static methods)
        - can't pass a store instance in to the factory because that'd be a circular reference to the child class from the parent class
      this is a middle ground. Typing to guide implementors that try to add stores and clear run time errors thrown when trying to use a store
      on a subject that failed to implement it. 
    */
    static store = {
      create: get_store_method_placeholder(subject_type),
      create_and_register: get_store_method_placeholder(subject_type),
      lookup: get_store_method_placeholder(subject_type),
      get_all: get_store_method_placeholder(subject_type),
      // omit private methods from Store, TODO would be handy to have a util type for that, or at least for multi-key omits
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
