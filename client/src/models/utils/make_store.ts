import _ from "lodash";

type StoreInstanceBase = { id: string; alt_ids?: string[] };

class Store<definition, instance extends StoreInstanceBase> {
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
  get_all = () => _.uniq(Array.from(this.store.values())); // SUBJECT_TS_TODO why's a unique needed here?
}

export const make_store = <definition, instance extends StoreInstanceBase>(
  create = _.identity as (def: definition) => instance
): Store<definition, instance> => {
  const store = new Map<string, instance>();
  return new Store(store, create);
};
