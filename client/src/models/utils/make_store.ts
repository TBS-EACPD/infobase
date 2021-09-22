import _ from "lodash";

// TODO I believe we want this to be limited strictly to strings, eventually
// Allowing numbers is a nod to that big mess with the Dept subject, where org
// ids flip flop between string and number all the time (ugh)
type store_id_type = string | number;

type StoreInstanceBase = { id: store_id_type };

export class Store<definition, instance extends StoreInstanceBase> {
  private store: Map<store_id_type, instance>;
  private register = (instance: instance) => {
    this.store.set(instance.id, instance);

    this.get_alt_ids &&
      _.forEach(this.get_alt_ids(instance), (alt_id) =>
        this.store.set(alt_id, instance)
      );

    return instance;
  };

  create: (def: definition) => instance;
  create_and_register: (def: definition) => instance;
  get_alt_ids?: (inst: instance) => store_id_type[];

  constructor(
    store: Map<store_id_type, instance>,
    create: (def: definition) => instance,
    get_alt_ids?: (inst: instance) => store_id_type[]
  ) {
    this.store = store;
    this.create = create;
    this.get_alt_ids = get_alt_ids;

    this.create_and_register = (def: definition) => this.register(create(def));
  }

  lookup = (id: store_id_type) => this.store.get(id);
  get_all = () => _.uniq(Array.from(this.store.values())); // SUBJECT_TS_TODO why's a unique needed here?
}

export const make_store = <definition, instance extends StoreInstanceBase>(
  create: (def: definition) => instance = _.identity,
  get_alt_ids: (inst: instance) => store_id_type[] = () => []
): Store<definition, instance> => {
  const store = new Map<store_id_type, instance>();
  return new Store(store, create, get_alt_ids);
};
