import DOMPurify from "dompurify";
import JSURL from "jsurl";
import _ from "lodash";
import marked from "marked";

export const sanitize_html = (markup: string | Node) => {
  // a little tedious, but this is the safe way to enforce safe usage of target="_blank" with DOMPurify
  // note: add and then pop the hook, don't want the side effect of leaving hooks on DOMPurify (ugh)

  DOMPurify.addHook("afterSanitizeAttributes", function (node) {
    if (node) {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }
  });

  const sanitized_markup = DOMPurify.sanitize(markup, {
    ADD_ATTR: ["target"],
  });

  DOMPurify.removeHook("afterSanitizeAttributes");

  return sanitized_markup;
};

export const sanitized_marked = (markdown: string) =>
  sanitize_html(marked(markdown, { sanitize: false, gfm: true }));

export const sanitized_dangerous_inner_html = (html: string) => ({
  __html: sanitize_html(html),
});

export const text_abbrev = function (text: string, length: number) {
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

export const set_session_storage_w_expiry = (
  key: string,
  value: string,
  ttl = 5000
) => {
  const now = new Date().getTime();
  const item = {
    value: value,
    expiry: now + ttl,
  };
  sessionStorage.setItem(key, JSON.stringify(item));
};
export const get_session_storage_w_expiry = (key: string) => {
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

export const escapeRegExp = function (str: string) {
  /* eslint-disable no-useless-escape */
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

type ObjectAny = {
  [key: string]: any;
};

export const shallowEqualObjectsOverKeys = (
  obj1: ObjectAny,
  obj2: ObjectAny,
  keys_to_compare: string[]
) =>
  _.reduce(
    keys_to_compare,
    (memo, key) => memo && obj1[key] === obj2[key],
    true
  );

export const shallowEqualObjectsExceptKeys = (
  obj1: ObjectAny,
  obj2: ObjectAny,
  keys_to_ignore: string[]
) => {
  return _.isEqualWith(
    obj1,
    obj2,
    (val1, val2, key) => val1 === val2 || _.includes(keys_to_ignore, key)
  );
};

export const retry_promise = (
  promise_to_try: Function,
  retries = 2,
  interval = 500
) => {
  return new Promise((resolve, reject) => {
    promise_to_try()
      .then(resolve)
      .catch((error: Error) =>
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

/*
  From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
  "This is an assign function that copies full descriptors"
  It's also copied lodash type signatue from _.assign 
  Here, used to preserve getters (like d3-selection.event), as opposed to Object.assign which just copies the value once (null for most)
*/
export function completeAssign<TObject, TSource>(
  object: TObject,
  source: TSource
): TObject & TSource;
export function completeAssign<TObject, TSource1, TSource2>(
  object: TObject,
  source1: TSource1,
  source2: TSource2
): TObject & TSource1 & TSource2;
export function completeAssign<TObject, TSource1, TSource2, TSource3>(
  object: TObject,
  source1: TSource1,
  source2: TSource2,
  source3: TSource3
): TObject & TSource1 & TSource2 & TSource3;
export function completeAssign<TObject, TSource1, TSource2, TSource3, TSource4>(
  object: TObject,
  source1: TSource1,
  source2: TSource2,
  source3: TSource3,
  source4: TSource4
): TObject & TSource1 & TSource2 & TSource3 & TSource4;
export function completeAssign<TObject>(object: TObject): TObject;
export function completeAssign(target: any, ...sources: any[]): any {
  sources.forEach((source) => {
    let descriptors = Object.keys(source).reduce(
      (descriptors: { [key: string]: PropertyDescriptor }, key) => {
        descriptors[key] = Object.getOwnPropertyDescriptor(source, key)!;
        return descriptors;
      },
      {}
    );
    // by default, Object.assign copies enumerable Symbols too
    Object.getOwnPropertySymbols(source).forEach((sym) => {
      let descriptor = Object.getOwnPropertyDescriptor(source, sym);
      if (descriptor && descriptor.enumerable) {
        // Typescript bug that symbol cannot be used as index: https://github.com/microsoft/TypeScript/issues/1863
        descriptors[(sym as unknown) as string] = descriptor;
      }
    });
    Object.defineProperties(target, descriptors);
  });
  return target;
}

//copied from https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
export const hex_to_rgb = (hex: string) => {
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
const make_jsurl_safe = (jsurl_string: string) =>
  _.replace(jsurl_string, /~/g, ".-.-");
const pre_parse_safe_jsurl = (safe_jsurl_string: string) =>
  !_.isEmpty(safe_jsurl_string) &&
  _.chain(safe_jsurl_string)
    .replace(/.-.-/g, "~")
    .replace(/~(&#39;|%E2%80%98|‘)/g, "~'") // seen apostrophes replaced by their raw encoding and even by single quotation marks, possibly formatting applied by email programs etc.
    .thru((jsurl_string) =>
      /\)$/.test(jsurl_string) ? jsurl_string : `${jsurl_string})`
    ) // closing paren often dropped for some reason, again might be url detection in email clients
    .value();
export const SafeJSURL = {
  parse: (safe_jsurl_string: string) =>
    JSURL.parse(pre_parse_safe_jsurl(safe_jsurl_string)),
  stringify: (json: { [key: string]: any }) =>
    make_jsurl_safe(JSURL.stringify(json)),
  tryParse: (safe_jsurl_string: string) =>
    JSURL.tryParse(pre_parse_safe_jsurl(safe_jsurl_string)),
};

export const generate_href = (url: string) =>
  url.startsWith("http") ? url : `https://${url}`;

interface ElementDescriptor {
  kind: string;
  key: string;
  descriptor: PropertyDescriptor;
  extras?: [{ [key: string]: any }];
}

export function cached_property(elementDescriptor: ElementDescriptor) {
  const { kind, key, descriptor } = elementDescriptor;
  if (kind !== "method") {
    throw new Error("@cached_property decorator can only be used on methods");
  }
  const og_method = descriptor.value;
  const cache_name = `_${key}_cached_val`;
  function new_method(this: any) {
    if (!this[cache_name]) {
      this[cache_name] = og_method.call(this);
    }
    return this[cache_name];
  }
  descriptor.value = new_method;
  return elementDescriptor;
}

export function bound(elementDescriptor: ElementDescriptor) {
  //see https://github.com/mbrowne/bound-decorator/blob/master/src/bound.js
  const { kind, key, descriptor } = elementDescriptor;
  if (kind !== "method") {
    throw new Error("@bound decorator can only be used on methods");
  }
  const method = descriptor.value;
  const initializer =
    // check for private method
    typeof key === "object"
      ? function (this: any) {
          return method.bind(this);
        }
      : // For public and symbol-keyed methods (which are technically public),
        // we defer method lookup until construction to respect the prototype chain.
        function (this: any) {
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
export const toggle_list = <Type>(arr: Type[], el: Type): Type[] =>
  _.includes(arr, el) ? _.without(arr, el) : arr.concat([el]);
