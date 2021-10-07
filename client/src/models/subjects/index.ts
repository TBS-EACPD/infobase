import _ from "lodash";

import { assign_to_dev_helper_namespace } from "src/core/assign_to_dev_helper_namespace";

import { CRSO } from "./CRSO";
import { Dept } from "./Dept";
import { Gov } from "./Gov";

import { Program, ProgramTag } from "./Program";

export { Gov, Dept, CRSO, Program, ProgramTag };

const Subjects = { Gov, Dept, CRSO, Program, ProgramTag };

export type SubjectInstance = InstanceType<
  typeof Subjects[keyof typeof Subjects]
>;

export const is_subject_class = (
  potential_subject: unknown
): potential_subject is typeof Subjects[keyof typeof Subjects] =>
  _.some(Subjects, (Subject) => potential_subject === Subject);
export const is_subject_instance = (
  potential_subject_instance: unknown
): potential_subject_instance is SubjectInstance =>
  _.some(Subjects, (Subject) => potential_subject_instance instanceof Subject);

export const subject_types = _.map(Subjects, "subject_type");

export const get_subject_class_by_type = (subject_type: string) =>
  _.find(Subjects, { subject_type });

export const get_subject_by_guid = (guid: string) => {
  const [type, id] = guid.split("_");

  const subject_class = get_subject_class_by_type(type);

  if (subject_class) {
    return subject_class.store.lookup(id);
  }
};

assign_to_dev_helper_namespace({
  Subjects,
  get_subject_by_guid,
});
