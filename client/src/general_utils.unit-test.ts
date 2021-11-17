import _ from "lodash";

import {
  sanitize_html,
  sanitized_marked,
  sanitized_dangerous_inner_html,
  set_session_storage_w_expiry,
  get_session_storage_w_expiry,
  shallowEqualObjectsOverKeys,
  shallowEqualObjectsExceptKeys,
  retrying_promise,
  completeAssign,
  hex_to_rgb,
  SafeJSURL,
  generate_href,
  cached_property,
  bound,
  toggle_list,
} from "./general_utils";

// describe("sanitize_html", () => {
//   it("should expose a function", () => {
//     // const retValue = sanitize_html(markup);
//     expect(false).toBeTruthy();
//   });
// });

// describe("sanitized_marked", () => {
//   it("should expose a function", () => {
//     // const retValue = sanitized_marked(markdown);
//     expect(false).toBeTruthy();
//   });
// });

// describe("sanitized_dangerous_inner_html", () => {
//   it("should expose a function", () => {
//     // const retValue = sanitized_dangerous_inner_html(html);
//     expect(false).toBeTruthy();
//   });
// });

// describe("set_session_storage_w_expiry", () => {
//   it("should expose a function", () => {
//     // const retValue = set_session_storage_w_expiry(key,value,ttl);
//     expect(false).toBeTruthy();
//   });
// });

// describe("get_session_storage_w_expiry", () => {
//   it("should expose a function", () => {
//     // const retValue = get_session_storage_w_expiry(key);
//     expect(false).toBeTruthy();
//   });
// });

// describe("shallowEqualObjectsOverKeys", () => {
//   it("should expose a function", () => {
//     // const retValue = shallowEqualObjectsOverKeys(obj1,obj2,keys_to_compare);
//     expect(false).toBeTruthy();
//   });
// });

// describe("shallowEqualObjectsExceptKeys", () => {
//   it("should expose a function", () => {
//     // const retValue = shallowEqualObjectsExceptKeys(obj1,obj2,keys_to_ignore);
//     expect(false).toBeTruthy();
//   });
// });

// describe("retrying_promise", () => {
//   it("should expose a function", () => {
//     // const retValue = retrying_promise(promise_to_try,options);
//     expect(false).toBeTruthy();
//   });
// });

// describe("completeAssign", () => {
//   it("should expose a function", () => {
//     // const retValue = completeAssign(object,source);
//     expect(false).toBeTruthy();
//   });
// });
// describe("completeAssign", () => {
//   it("should expose a function", () => {
//     // const retValue = completeAssign(object,source1,source2);
//     expect(false).toBeTruthy();
//   });
// });
// describe("completeAssign", () => {
//   it("should expose a function", () => {
//     // const retValue = completeAssign(object,source1,source2,source3);
//     expect(false).toBeTruthy();
//   });
// });
// describe("completeAssign", () => {
//   it("should expose a function", () => {
//     // const retValue = completeAssign(object,source1,source2,source3,source4);
//     expect(false).toBeTruthy();
//   });
// });
// describe("completeAssign", () => {
//   it("should expose a function", () => {
//     // const retValue = completeAssign(object);
//     expect(false).toBeTruthy();
//   });
// });
// describe("completeAssign", () => {
//   it("should expose a function", () => {
//     // const retValue = completeAssign(target,sources);
//     expect(false).toBeTruthy();
//   });
// });

describe("hex_to_rgb", () => {
  it("coverts a hex colour string to an rgb object", () => {
    return expect(hex_to_rgb("c54636")).toEqual({ r: 197, g: 70, b: 54 });
  });
});

describe("SafeJSURL", () => {
  it("Contains methods for stringify, tryParse, and parse", () => {
    expect(typeof SafeJSURL.stringify).toBe("function");
    expect(typeof SafeJSURL.tryParse).toBe("function");
    expect(typeof SafeJSURL.parse).toBe("function");
    expect(_.omit(SafeJSURL, ["tryParse", "parse", "stringify"])).toBe({});
  });
});
// describe("SafeJSURL.stringify", () => {
//   it("Encodes JS objects as URL safe strings", () => {
//     expect(false).toBeTruthy();
//   });
// });
// describe("SafeJSURL.tryParse", () => {
//   it("Returns true for SafeJSURL-encoded strings", () => {
//     expect(false).toBeTruthy();
//   });
//   it("Returns false for non-SafeJSURL-encoded strings", () => {
//     expect(false).toBeTruthy();
//   });
// });
// describe("SafeJSURL.parse", () => {
//   it("Parses SafeJSURL-encoded strings in to objects", () => {
//     expect(false).toBeTruthy();
//   });
// });

// describe("generate_href", () => {
//   it("should expose a function", () => {
//     // const retValue = generate_href(url);
//     expect(false).toBeTruthy();
//   });
// });

// describe("cached_property", () => {
//   it("should expose a function", () => {
//     // const retValue = cached_property(elementDescriptor);
//     expect(false).toBeTruthy();
//   });
// });

// describe("bound", () => {
//   it("should expose a function", () => {
//     // const retValue = bound(elementDescriptor);
//     expect(false).toBeTruthy();
//   });
// });

// describe("toggle_list", () => {
//   it("should expose a function", () => {
//     // const retValue = toggle_list(arr,el);
//     expect(false).toBeTruthy();
//   });
// });
