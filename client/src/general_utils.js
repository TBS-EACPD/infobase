import marked from 'marked';
import DOMPurify from 'dompurify';
import JSURL from 'jsurl';

export const sanitized_marked = (markdown) => DOMPurify.sanitize(
  marked(
    markdown,
    { sanitize: false, gfm: true }
  )
);

export const sanitized_dangerous_inner_html = (html) => ({ 
  __html: DOMPurify.sanitize(html),
});

export const text_abbrev = function(text, length){
  const length_value = _.isFunction(length) ? length() : length || 60;

  return text.length > length_value ? 
    text.substring(0, length_value-4) + "..." :
    text;
};

export const make_unique_func = function(){
  var val = 0;
  return function(){
    return ++val;
  };
};


// <div id='make_unique'></div>
// consider replacing with _.uniqueId
export const make_unique = make_unique_func();

//simple, re-usable select tag component
//should probably be moved elsewhere
//if container is a select tag, uses that, if not, appends a child <select>
//data can be of many form 
//array/hash of strings (kinda kills the point of having this component)
//array/hash of objects with a text or display property
//note that onSelect will be called with the data associated to the key, not the key itself
export class Select {
  constructor(options){
    const { 
      container, 
      data, 
      onSelect, 
      display_func, //required, unless the items have a display or text field
      selected, //optional
      selected_key, //optional
      disabled_key, //optional
    } = options;

    container.innerHTML = "";
    let node = container;
    if(container.nodeName !== 'SELECT'){
      node = document.createElement('select');
      node.classList.add('form-control');
      container.appendChild(node);
    }
    node.innerHTML = (
      _.map(
        data, 
        (val,key)=> `
          <option 
            ${ disabled_key === key ? 'disabled' : ''}
            ${ (selected_key === key || selected === val) ? 'selected' : ''}
            value='${key}'
          >
            ${ display_func ? display_func(val) : (val.text || val.display || val) }
          </option>`
      ).join("")
    );
    node.onchange = () => { onSelect(data[node.value]); };
  }
}

export const escapeRegExp = function(str) {
  /* eslint-disable no-useless-escape */
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

export const escapeSingleQuotes = function(str){
  return str.replace(/'/g, "&#39;");
};

export const shallowEqualObjectsOverKeys = (obj1, obj2, keys_to_compare) => _.reduce(keys_to_compare, (memo, key) => ( memo && (obj1[key] === obj2[key]) ), true);

export const retry_promise = (promise_to_try, retries = 2, interval = 500) => {
  return new Promise( (resolve, reject) => {
    promise_to_try()
      .then(resolve)
      .catch( (error) => setTimeout(
        () => {
          if (retries === 0) {
            reject(error);
            return;
          }

          retry_promise(promise_to_try, interval, retries - 1).then(resolve, reject);
        }, 
        interval
      ));
  });
};


// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
// "This is an assign function that copies full descriptors"
// Here, used to preserve getters (like d3-selection.event), as opposed to Object.assign which just copies the value once (null for most)
export function completeAssign(target, ...sources) {
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

// JSURL's use of ~'s is problematic in some cases, use ".-.-" pattern instead. Also handle a bunch of weird JSURL issues seen in logs
const make_jsurl_safe = (jsurl_string) => _.replace(jsurl_string, /~/g, ".-.-");
const pre_parse_safe_jsurl = (safe_jsurl_string) => !_.isEmpty(safe_jsurl_string) &&
  _.chain(safe_jsurl_string)
    .replace(/.-.-/g, "~")
    .replace(/~(&#39;|%E2%80%98|‘)/g, "~'") // seen apostrophes replaced by their raw encoding and even by single quotation marks, possibly formatting applied by email programs etc.
    .thru( (jsurl_string) => /\)$/.test(jsurl_string) ? jsurl_string : `${jsurl_string})` ) // closing paren often dropped for some reason, again might be url detection in email clients
    .value();
export const SafeJSURL = {
  parse: (safe_jsurl_string) => JSURL.parse( pre_parse_safe_jsurl(safe_jsurl_string) ),
  stringify: (json) => make_jsurl_safe( JSURL.stringify(json) ),
  tryParse: (safe_jsurl_string) => JSURL.tryParse( pre_parse_safe_jsurl(safe_jsurl_string) ),
};