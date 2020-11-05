import _ from "lodash";

import { en_fr } from "../schema_utils";

const schema = `
  extend type Root {
    all_subject_search(query:String!): [SubjectI]
    subject_search(query:String!): [SubjectI]
  }
`;

export default function ({ models }) {
  const { SubjectSearch } = models;

  const resolvers = {
    Root: {
      all_subject_search: (_a, { query }) =>
        SubjectSearch.search_subjects(query),
      subject_search: (_a, { query }) =>
        SubjectSearch.search_subjects_with_data(query),
    },
  };

  return {
    resolvers,
    schema,
  };
}
