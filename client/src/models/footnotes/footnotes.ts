import _ from "lodash";

import { Subject, get_subject_by_guid } from "src/models/subject_index";
import { make_store } from "src/models/utils/make_store";

import { assign_to_dev_helper_namespace } from "src/core/assign_to_dev_helper_namespace";

type FootNoteDef = {
  id: string;
  subject_class: string;
  subject_id: string;
  topic_keys: string[];
  text: string;
  year1?: number;
  year2?: number;
};

export const create_footnote = (def: FootNoteDef) => ({
  ...def,
  // TODO would prefer to drop this weird mixed property that can be either a subject class OR a subject instance, but will be a pain to hunt down the code relying on it
  subject:
    def.subject_id === "*"
      ? Subject[def.subject_class as keyof typeof Subject] // eslint-disable-line import/namespace
      : get_subject_by_guid(`${def.subject_class}_${def.subject_id}`),
});

export const footNoteStore = make_store(create_footnote);

export const get_footnotes_by_subject_and_topic = (
  subject: { id: string; subject_type: string },
  topics = ["*"]
): ReturnType<typeof create_footnote>[] => {
  const can_skip_topic_check = _.some(topics, (topic) => topic === "*");
  return _.chain(footNoteStore.get_all())
    .filter(({ subject_class, subject_id, topic_keys }) => {
      const subject_match =
        subject_id === "*"
          ? subject_class === subject.subject_type
          : subject_id === subject.id;

      const topic_match =
        can_skip_topic_check ||
        _.some([...topics, "ANY", "MACHINERY"], (topic) =>
          _.includes(topic_keys, topic)
        );

      return subject_match && topic_match;
    })
    .uniqBy("text")
    .value();
};

assign_to_dev_helper_namespace({
  footNoteStore,
  get_footnotes_by_subject_and_topic,
});
