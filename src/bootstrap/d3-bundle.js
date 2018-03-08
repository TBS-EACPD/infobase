import * as a from  "d3-array";
import * as b from  "d3-axis";
import * as c from  "d3-collection";
import * as d from  "d3-color";
import * as e from  "d3-dispatch";
import * as f from  "d3-dsv";
import * as g from  "d3-ease";
import * as h from  "d3-hierarchy";
import * as i from  "d3-interpolate";
import * as j from  "d3-path";
import * as k from  "d3-scale";
import * as l from  "d3-selection";
import * as m from  "d3-selection-multi";
import * as n from  "d3-shape";
import * as o from  "d3-transition";

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
// "This is an assign function that copies full descriptors"
// Here, used to preserve getters (like d3-selection.event), as opposed to Object.assign which just copies the value once (null for most)
function completeAssign(target, ...sources) {
  sources.forEach(source => {
    let descriptors = Object.keys(source).reduce((descriptors, key) => {
      descriptors[key] = Object.getOwnPropertyDescriptor(source, key);
      return descriptors;
    }, {});
    // by default, Object.assign copies enumerable Symbols too
    Object.getOwnPropertySymbols(source).forEach(sym => {
      let descriptor = Object.getOwnPropertyDescriptor(source, sym);
      if (descriptor.enumerable) {
        descriptors[sym] = descriptor;
      }
    });
    Object.defineProperties(target, descriptors);
  });
  return target;
}

const d4 = completeAssign({}, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o );
if(typeof window !== 'undefined'){
  window.d4 = d4;
  window.d3 = d4;
}
