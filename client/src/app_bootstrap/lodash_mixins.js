import _ from "lodash";

const funcs = {
  //This is something that should have been built in, it simply applies a function to your
  // It can be used as _.pipe(obj, func), which is uselessly equivalent to func(obj),
  //But it can also be used as _.chain(obj).pipe(func).value() which can encourage the use of chaining
  pipe: (obj, func) => func(obj),

  //this is ideal for a list of id's in a piece of state that are often toggled
  // _.toggle_list([1,2,3],1) => [1,2]
  // _.toggle_list([1,2,3],4) => [1,2,3,4]
  toggle_list: (arr, el) =>
    _.includes(arr, el) ? _.without(arr, el) : arr.concat([el]),

  //shortcut for Object.assign
  immutate: (obj, ...to_merge) => Object.assign({}, obj, ...to_merge),

  //in an array, return all the indices of elements that match a predicate
  findIndices: (arr, predicate) => {
    return _.chain(arr)
      .map((item, ix) => (predicate(item) ? ix : false))
      .filter(_.isNumber)
      .value();
  },
  sortWith: (arr, custom_func) => _.map(arr).sort(custom_func),

  nonEmpty: (any) => !_.isEmpty(any),

  //simulate underscore's tail because lodash's doesn't allow to define a starting point (defaults to 1)
  tail: (arr, start = 1) =>
    _.isArray(arr) ? _.takeRight(arr, arr.length - start) : [],
};

_.mixin(funcs);

export default _;
