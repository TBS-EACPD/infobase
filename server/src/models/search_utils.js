import _ from "lodash";
import mongoose from "mongoose";

const search_terms_base_key = "search_terms";

const search_terms_def = _.chain(["en", "fr", "bi"])
  .map((lang) => [
    `${search_terms_base_key}_${lang}`,
    { type: String, index: true },
  ])
  .fromPairs()
  .value();

const flatten_to_string = (searchable_content) => {
  const recursive_flatten_to_string = (content) => {
    if (_.isObject(content)) {
      return _.chain(content)
        .values()
        .reduce(
          (accumulator, value) =>
            accumulator + recursive_flatten_to_string(value),
          ""
        )
        .value();
    } else {
      return _.toString(content);
    }
  };

  return recursive_flatten_to_string(searchable_content);
};

const add_derived_search_terms_to_doc = (doc, searchable_keys_by_lang) =>
  _.chain(search_terms_def)
    .keys()
    .each((search_terms_field_key) => {
      const search_field_lang = /.*_(.*?)$/.exec(search_terms_field_key)?.[1];

      const searchable_fields = (() => {
        if (search_field_lang === "bi") {
          return _.pick(doc, _.flatMap(searchable_keys_by_lang));
        } else {
          return _.pick(
            doc,
            _.chain([
              searchable_keys_by_lang?.[search_field_lang],
              searchable_keys_by_lang?.both,
            ])
              .compact()
              .flatten()
              .value()
          );
        }
      })();

      // important that this stays in sync with the regex construction in get_search_terms_resolver, e.g. pre-deburred, pre-lower-cased
      doc[search_terms_field_key] = _.chain(searchable_fields)
        .flatMap((searchable_content) =>
          _.chain(searchable_content)
            .thru(flatten_to_string)
            .deburr()
            .toLower()
            .words()
            .value()
        )
        .uniq()
        .sortBy((word) => -word.length)
        .join(" ")
        .value();
    })
    .value();

export const make_schema_with_search_terms = (
  schema_def,
  ...searchable_keys
) => {
  const searchable_keys_by_lang = _.groupBy(
    searchable_keys,
    (field) => /.*_(en|fr)$/.exec(field)?.[1] || "both"
  );

  const schema = mongoose.Schema({
    ...schema_def,
    ...search_terms_def,
  });

  schema.pre("save", function (next) {
    const doc = this;

    add_derived_search_terms_to_doc(doc, searchable_keys_by_lang);

    next();
  });

  // insertMany operations do not call save middleware, needs its own
  schema.pre("insertMany", function (next, docs) {
    _.each(docs, (doc) =>
      add_derived_search_terms_to_doc(doc, searchable_keys_by_lang)
    );

    next();
  });

  return schema;
};

export const get_search_terms_resolver =
  (model, bilingual = false) =>
  async (_x, { search_phrase }, { lang }) => {
    const search_terms_key = `${search_terms_base_key}_${
      bilingual ? "bi" : lang
    }`;

    const results = await model.find({
      [search_terms_key]: {
        $regex: _.chain(search_phrase)
          .deburr()
          // optimization note: pre-lowercasing both the content and regex should be better than using a case insensitive regex in mongo
          .toLower()
          // eslint-disable-next-line no-useless-escape
          .replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
          .words()
          .uniq()
          // optimization note: should exit early on first unmatched word, check for longest words first since smaller could be common partials
          .sortBy((word) => -word.length)
          .reduce((pattern, word) => pattern + `(?=.*?${word})`, "^")
          .value(),
      },
    });

    return _.sortBy(
      results,
      (result) => result?.id || result[search_terms_key]
    );
  };
