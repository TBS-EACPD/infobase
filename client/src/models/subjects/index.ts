import _ from "lodash";

import { assign_to_dev_helper_namespace } from "src/core/assign_to_dev_helper_namespace";

import { CRSO } from "./CRSO";
import { Dept } from "./Dept";
import { Gov } from "./Gov";

import { Program, ProgramTag } from "./Program";

export { Gov, Dept, CRSO, Program, ProgramTag };

Dept.subject_type;

const Subjects = { Gov, Dept, CRSO, Program, ProgramTag };

export const api_subject_types = ["service"] as const;
export type ApiSubjectType = typeof api_subject_types[number];
export const is_api_subject_types = (type: string): type is ApiSubjectType =>
  _.includes(api_subject_types, type);

export const class_subject_types = _.map(Subjects, "subject_type");
export type ClassSubjectType = typeof class_subject_types[number];
export const is_class_subject_types = (
  type: string
): type is ClassSubjectType => _.includes(class_subject_types, type);

export const subject_types = [...class_subject_types, ...api_subject_types];
export type SubjectType = typeof subject_types[number];
export const is_subject_types = (type: string): type is SubjectType =>
  _.includes(subject_types, type);

export type SubjectClassInstance = InstanceType<
  typeof Subjects[keyof typeof Subjects]
>;

export type SubjectLike = {
  subject_type: SubjectType;
  id: string;
};

export const is_subject_class = (
  potential_subject: unknown
): potential_subject is typeof Subjects[keyof typeof Subjects] =>
  _.some(Subjects, (Subject) => potential_subject === Subject);

export const is_subject_instance = (
  potential_subject_instance: unknown
): potential_subject_instance is SubjectClassInstance =>
  _.some(Subjects, (Subject) => potential_subject_instance instanceof Subject);

export const get_subject_class_by_type = (subject_type: ClassSubjectType) =>
  _.find(Subjects, { subject_type });

export const get_subject_instance_by_guid = (guid: string) => {
  const [type, id] = guid.split("_") as [ClassSubjectType, string];

  const subject_class = get_subject_class_by_type(type);

  if (subject_class) {
    return subject_class.store.lookup(id);
  }
};

assign_to_dev_helper_namespace({
  Subjects,
  get_subject_instance_by_guid,
});
