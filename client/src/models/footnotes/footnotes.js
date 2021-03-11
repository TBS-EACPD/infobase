import _ from "lodash";

import { mix, staticStoreMixin } from "src/models/storeMixins.js";

import { assign_to_dev_helper_namespace } from "src/core/assign_to_dev_helper_namespace.js";

const footnotes_by_id = {};

export default class FootNote extends mix().with(staticStoreMixin) {
  static create_and_register(def) {
    const { id } = def;
    if (footnotes_by_id[id]) {
      return footnotes_by_id;
    } else {
      const key = def.subject_class ? def.subject_class : def.subject;
      const inst = new this(def);
      let registry_entry = this.__store__.get(key);
      if (_.isUndefined(registry_entry)) {
        registry_entry = [];
        this.__store__.set(key, registry_entry);
      }
      registry_entry.push(inst);
      footnotes_by_id[id] = inst;

      return inst;
    }
  }
  static lookup(subject) {
    return (super.lookup(subject) || []).concat(
      super.lookup(subject.constructor) || []
    );
  }
  static get_for_subject(subject, topics = "*") {
    topics = _.isArray(topics) ? [...topics] : [topics];

    let ret;
    if (_.isEmpty(topics)) {
      ret = [];
    } else if (_.some(topics, (topic) => topic === "*")) {
      ret = this.lookup(subject);
    } else {
      ret = _.filter(this.lookup(subject), (note) =>
        _.some([...topics, "ANY", "MACHINERY"], (topic) =>
          _.includes(note.topic_keys, topic)
        )
      );
    }

    return _.uniqBy(ret, "text");
  }
  static get_all_flat() {
    return _.chain(this.get_all()).flatten().value();
  }
  constructor(def) {
    super();
    Object.assign(this, def);
  }
}

assign_to_dev_helper_namespace({ FootNote });
