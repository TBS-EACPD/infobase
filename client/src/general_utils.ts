import DOMPurify from "dompurify";
import JSURL from "jsurl";
import _ from "lodash";
import { marked } from "marked";

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

export const shallowEqualObjectsOverKeys = <Type, Key extends keyof Type>(
  obj1: Type,
  obj2: Type,
  keys_to_compare: Key[]
) =>
  _.reduce(
    keys_to_compare,
    (memo, key) => memo && obj1[key] === obj2[key],
    true
  );

export const shallowEqualObjectsExceptKeys = <Type, Key extends keyof Type>(
  obj1: Type,
  obj2: Type,
  keys_to_ignore: Key[]
) => {
  return _.isEqualWith(
    obj1,
    obj2,
    (val1, val2, key) => val1 === val2 || _.includes(keys_to_ignore, key)
  );
};

export const retrying_promise = <T>(
  promise_to_try: (retry_count: number) => Promise<T>,
  options: {
    retries?: number;
    min_interval?: number;
    max_interval?: number;
    jitter_magnitude?: number;
  } = {}
): Promise<T> => {
  const {
    retries = 3,
    min_interval = 100,
    max_interval = 500,
    jitter_magnitude = 0.2,
  } = options;

  const retry_promise = (retry_count = 0): Promise<T> => {
    const remaining_retries = retries - retry_count;

    const interval = _.min([
      min_interval * Math.pow(2, retry_count),
      max_interval,
    ]) as number;
    const jitter = interval * _.random(-jitter_magnitude, jitter_magnitude);

    return new Promise((resolve, reject) => {
      promise_to_try(retry_count)
        .then(resolve)
        .catch((error: Error) =>
          setTimeout(() => {
            if (remaining_retries === 0) {
              reject(error);
            } else {
              retry_promise(retry_count + 1).then(resolve, reject);
            }
          }, interval + jitter)
        );
    });
  };

  return retry_promise();
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
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function completeAssign(target: any, ...sources: any[]): any {
  sources.forEach((source) => {
    const descriptors = Object.keys(source).reduce(
      (descriptors: { [key: string]: PropertyDescriptor }, key) => {
        const descriptor = Object.getOwnPropertyDescriptor(source, key);
        if (descriptor) {
          descriptors[key] = descriptor;
        }
        return descriptors;
      },
      {}
    );
    // by default, Object.assign copies enumerable Symbols too
    Object.getOwnPropertySymbols(source).forEach((sym) => {
      const descriptor = Object.getOwnPropertyDescriptor(source, sym);
      if (descriptor && descriptor.enumerable) {
        // Typescript bug that symbol cannot be used as index: https://github.com/microsoft/TypeScript/issues/1863
        descriptors[sym as unknown as string] = descriptor;
      }
    });
    Object.defineProperties(target, descriptors);
  });
  return target;
}

//copied from https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
export const hex_to_rgb = (hex: string) => {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (_m, r, g, b) {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
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
  stringify: (json: { [key: string]: string }) =>
    make_jsurl_safe(JSURL.stringify(json)),
  parse: (safe_jsurl_string: string): { [key: string]: string } | false =>
    JSURL.tryParse(pre_parse_safe_jsurl(safe_jsurl_string), false),
};

export const generate_href = (url: string) =>
  url.startsWith("http") ? url : `https://${url}`;

interface ElementDescriptor {
  kind: string;
  key: string;
  descriptor: PropertyDescriptor;
  extras?: [ElementDescriptorExtra];
}
interface ElementDescriptorExtra extends ElementDescriptor {
  placement: string;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  initializer: (this: any) => any;
}

export function cached_property(elementDescriptor: ElementDescriptor) {
  const { kind, key, descriptor } = elementDescriptor;
  if (kind !== "method") {
    throw new Error("@cached_property decorator can only be used on methods");
  }
  const og_method = descriptor.value;
  const cache_name = `_${key}_cached_val`;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
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
      ? /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        function (this: any) {
          return method.bind(this);
        }
      : // For public and symbol-keyed methods (which are technically public),
        // we defer method lookup until construction to respect the prototype chain.
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
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
