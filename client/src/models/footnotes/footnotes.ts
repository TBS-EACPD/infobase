import _ from "lodash";

import type { ClassSubjectType } from "src/models/subjects";
import {
  is_subject_instance,
  get_subject_class_by_type,
} from "src/models/subjects";
import { make_store } from "src/models/utils/make_store";

import { assign_to_dev_helper_namespace } from "src/core/assign_to_dev_helper_namespace";

// Aside from the wildcard *, all of these MUST have corrsponding text in footnote_topics.yaml!
// ... TODO would be nice to get fancier type generation for yaml files some time so this can be infered
export type TopicKey =
  | "*"
  | "PA"
  | "EST_PROC"
  | "AUTH"
  | "VOTED"
  | "STAT"
  | "EXP"
  | "PLANNED_EXP"
  | "FTE"
  | "PLANNED_FTE"
  | "DRR_EXP"
  | "DRR_FTE"
  | "DP_EXP"
  | "DP_FTE"
  | "SOBJ10"
  | "PEOPLE"
  | "GENDER"
  | "AGE"
  | "SOBJ"
  | "PROG"
  | "GEO"
  | "TP_GEO"
  | "FOL"
  | "ESTIMATES"
  | "EX_LVL"
  | "SUPPRESSED_DATA"
  | "GOCO"
  | "ANNUAL"
  | "QUARTERLY"
  | "DP"
  | "DRR"
  | "RESULTS"
  | "MACHINERY"
  | "DIGITAL_STATUS"
  | "OTHER_TYPE_COMMENT"
  | "ANY"
  | "COVID"
  | "COVID_AUTH"
  | "COVID_EXP"
  | "COVID_MEASURE"
  | "SERVICES";

type FakeFootNoteDef = {
  topic_keys: TopicKey[];
  text: string;
  year1?: number;
  year2?: number;
};

export type FootNoteDef = {
  id: string;
  subject_type: ClassSubjectType; // TODO footnotes currently only work for class subjects, make allowances for API only subjects later
  subject_id: string;
  topic_keys: TopicKey[];
  text: string;
  year1?: number;
  year2?: number;
};

export const create_fake_footnote = (def: FakeFootNoteDef) => {
  const { text, topic_keys } = def;
  if (text === undefined || topic_keys === undefined) {
    throw new Error(
      `Can't create fake footnote where "text" and "topic_key" is undefined`
    );
  }
  return { ...def };
};

export const create_footnote = (def: FootNoteDef) => {
  const subject =
    def.subject_id === "*"
      ? get_subject_class_by_type(def.subject_type)
      : get_subject_class_by_type(def.subject_type)?.store.lookup(
          def.subject_id
        );

  if (typeof subject === "undefined") {
    throw new Error(
      `Can't create footnote with subject_type "${def.subject_type}", not a valid subject type`
    );
  }

  return {
    ...def,

    // reconcile alternate ids, such as dept codes, that may be in the input csv
    subject_id: is_subject_instance(subject) ? subject.id : def.subject_id,

    // TODO would prefer to drop this weird mixed property that can be either a subject class OR a subject instance, but will be a pain to hunt down the code relying on it
    subject,
  };
};

export const footNoteStore = make_store(create_footnote);

export const get_footnotes_by_subject_and_topic = (
  subject: { id: string; subject_type: string },
  topics = ["*"]
): ReturnType<typeof create_footnote>[] => {
  const can_skip_topic_check = _.some(topics, (topic) => topic === "*");
  return _.chain(footNoteStore.get_all())
    .filter(({ subject_type, subject_id, topic_keys }) => {
      const subject_match =
        subject_id === "*"
          ? subject_type === subject.subject_type
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
