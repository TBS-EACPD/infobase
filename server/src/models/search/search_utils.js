import _ from "lodash";

function escapeRegExp(str) {
  /* eslint-disable no-useless-escape */
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

export function create_re_matcher(query, accessors) {
  const raw_tokens = query.split(" ");

  const reg_exps = _.map(
    raw_tokens,
    (token) => new RegExp(escapeRegExp(_.deburr(token)), "gi")
  );

  return (obj) =>
    _(accessors)
      .map((accessor) => (_.isString(accessor) ? obj[accessor] : accessor(obj)))
      .some((str) => {
        if (!_.isString(str)) {
          return false;
        } else {
          str = _.deburr(str);
          return _.every(reg_exps, (re) => str.match(re));
        }
      });
}
