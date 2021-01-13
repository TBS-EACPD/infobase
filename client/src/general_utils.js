import DOMPurify from "dompurify";
import JSURL from "jsurl";
import _ from "lodash";
import marked from "marked";

export const sanitized_marked = (markdown) =>
  DOMPurify.sanitize(marked(markdown, { sanitize: false, gfm: true }));

export const sanitized_dangerous_inner_html = (html) => ({
  __html: DOMPurify.sanitize(html),
});

export const text_abbrev = function (text, length) {
  const length_value = _.isFunction(length) ? length() : length || 60;

  return text.length > length_value
    ? text.substring(0, length_value - 4) + "..."
    : text;
};

export const make_unique_func = function () {
  var val = 0;
  return function () {
    return ++val;
  };
};

export const set_session_storage_w_expiry = (key, value, ttl = 5000) => {
  const now = new Date().getTime();
  const item = {
    value: value,
    expiry: now + ttl,
  };
  sessionStorage.setItem(key, JSON.stringify(item));
};
export const get_session_storage_w_expiry = (key) => {
  const itemStr = sessionStorage.getItem(key);

  if (!itemStr) {
    return null;
  }

  const item = JSON.parse(itemStr);
  const now = new Date().getTime();

  if (now > item.expiry) {
    sessionStorage.removeItem(key);
    return null;
  }
  return item.value;
};

// <div id='make_unique'></div>
// consider replacing with _.uniqueId
export const make_unique = make_unique_func();

export const escapeRegExp = function (str) {
  /* eslint-disable no-useless-escape */
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

export const shallowEqualObjectsOverKeys = (obj1, obj2, keys_to_compare) =>
  _.reduce(
    keys_to_compare,
    (memo, key) => memo && obj1[key] === obj2[key],
    true
  );

export const shallowEqualObjectsExceptKeys = (obj1, obj2, keys_to_ignore) => {
  return _.isEqualWith(
    obj1,
    obj2,
    (val1, val2, key) => val1 === val2 || _.includes(keys_to_ignore, key)
  );
};

export const retry_promise = (promise_to_try, retries = 2, interval = 500) => {
  return new Promise((resolve, reject) => {
    promise_to_try()
      .then(resolve)
      .catch((error) =>
        setTimeout(() => {
          if (retries === 0) {
            reject(error);
            return;
          }

          retry_promise(promise_to_try, interval, retries - 1).then(
            resolve,
            reject
          );
        }, interval)
      );
  });
};

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
// "This is an assign function that copies full descriptors"
// Here, used to preserve getters (like d3-selection.event), as opposed to Object.assign which just copies the value once (null for most)
export function completeAssign(target, ...sources) {
  sources.forEach((source) => {
    let descriptors = Object.keys(source).reduce((descriptors, key) => {
      descriptors[key] = Object.getOwnPropertyDescriptor(source, key);
      return descriptors;
    }, {});
    // by default, Object.assign copies enumerable Symbols too
    Object.getOwnPropertySymbols(source).forEach((sym) => {
      let descriptor = Object.getOwnPropertyDescriptor(source, sym);
      if (descriptor.enumerable) {
        descriptors[sym] = descriptor;
      }
    });
    Object.defineProperties(target, descriptors);
  });
  return target;
}

//copied from https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
export const hex_to_rgb = (hex) => {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

// JSURL's use of ~'s is problematic in some cases, use ".-.-" pattern instead. Also handle a bunch of weird JSURL issues seen in logs
const make_jsurl_safe = (jsurl_string) => _.replace(jsurl_string, /~/g, ".-.-");
const pre_parse_safe_jsurl = (safe_jsurl_string) =>
  !_.isEmpty(safe_jsurl_string) &&
  _.chain(safe_jsurl_string)
    .replace(/.-.-/g, "~")
    .replace(/~(&#39;|%E2%80%98|‘)/g, "~'") // seen apostrophes replaced by their raw encoding and even by single quotation marks, possibly formatting applied by email programs etc.
    .thru((jsurl_string) =>
      /\)$/.test(jsurl_string) ? jsurl_string : `${jsurl_string})`
    ) // closing paren often dropped for some reason, again might be url detection in email clients
    .value();
export const SafeJSURL = {
  parse: (safe_jsurl_string) =>
    JSURL.parse(pre_parse_safe_jsurl(safe_jsurl_string)),
  stringify: (json) => make_jsurl_safe(JSURL.stringify(json)),
  tryParse: (safe_jsurl_string) =>
    JSURL.tryParse(pre_parse_safe_jsurl(safe_jsurl_string)),
};

export const generate_href = (url) =>
  url.startsWith("http") ? url : `https://${url}`;

export function cached_property(elementDescriptor) {
  const { kind, key, descriptor } = elementDescriptor;
  if (kind !== "method") {
    throw Error("@cached_property decorator can only be used on methods");
  }
  const og_method = descriptor.value;
  const cache_name = `_${key}_cached_val`;
  function new_method() {
    if (!this[cache_name]) {
      this[cache_name] = og_method.call(this);
    }
    return this[cache_name];
  }
  descriptor.value = new_method;
  return elementDescriptor;
}

export function bound(elementDescriptor) {
  //see https://github.com/mbrowne/bound-decorator/blob/master/src/bound.js
  const { kind, key, descriptor } = elementDescriptor;
  if (kind !== "method") {
    throw Error("@bound decorator can only be used on methods");
  }
  const method = descriptor.value;
  const initializer =
    // check for private method
    typeof key === "object"
      ? function () {
          return method.bind(this);
        }
      : // For public and symbol-keyed methods (which are technically public),
        // we defer method lookup until construction to respect the prototype chain.
        function () {
          return this[key].bind(this);
        };

  // Return both the original method and a bound function field that calls the method.
  // (That way the original method will still exist on the prototype, avoiding
  // confusing side-effects.)
  elementDescriptor.extras = [
    {
      kind: "field",
      key,
      placement: "own",
      initializer,
      descriptor: { ...descriptor, value: undefined },
    },
  ];
  return elementDescriptor;
}

//this is ideal for a list of id's in a piece of state that are often toggled
// toggle_list([1,2,3],1) => [2,3]
// toggle_list([1,2,3],4) => [1,2,3,4]
export const toggle_list = (arr, el) =>
  _.includes(arr, el) ? _.without(arr, el) : arr.concat([el]);
