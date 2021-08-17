import _ from "lodash";

import { StaticStoreFactory } from "src/models/storeMixins";

import { assign_to_dev_helper_namespace } from "src/core/assign_to_dev_helper_namespace";

type FootNoteDef = {
  id: string;
  subject: any; // SUBJECT_TS_TODO, either work around this or type better once other subjects are on ts
  topic_keys: string[];
  text: string;
  year1?: number;
  year2?: number;
};

// just an identity right now, but some outside code makes "fake" footnotes so it seems safer to export and use this
// in case additional logic is added here in the future (plus, it will cover the typing at the same time)
export const create_footnote = (def: FootNoteDef) => def;

export const footNoteStore = StaticStoreFactory(create_footnote);

export const get_footnotes_by_subject_and_topic = (
  subject: any,
  topics = ["*"]
): ReturnType<typeof create_footnote>[] => {
  const can_skip_topic_check = _.some(topics, (topic) => topic === "*");
  return _.chain(footNoteStore.get_all())
    .filter(({ subject: footnote_subject, topic_keys }) => {
      // SUBJECT_TS_TODO weird quirk of footnote population that subject can be either an instance or a class, will cause problems if any subjects stop being classes
      const exact_subject_match = footnote_subject.id === subject.id;
      const class_subject_match = footnote_subject === subject.constructor;

      const topic_match =
        can_skip_topic_check ||
        _.some([...topics, "ANY", "MACHINERY"], (topic) =>
          _.includes(topic_keys, topic)
        );

      return (exact_subject_match || class_subject_match) && topic_match;
    })
    .uniqBy("text")
    .value();
};

assign_to_dev_helper_namespace({
  footNoteStore,
  get_footnotes_by_subject_and_topic,
});
