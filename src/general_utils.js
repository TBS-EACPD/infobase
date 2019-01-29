import marked from 'marked';
import DOMPurify from 'dompurify';

export const sanitized_marked = (markdown) => DOMPurify.sanitize(
  marked(
    markdown,
    { sanitize: false, gfm: true }
  )
);

export const sanitized_inner_html = (html) => ({ 
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
  }
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
    node.onchange = () => { onSelect(data[node.value]) };
  }
}

export const escapeRegExp = function(str) {
  /* eslint-disable no-useless-escape */
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

export const escapeSingleQuotes = function(str){
  return str.replace(/'/g, "&#39;")
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