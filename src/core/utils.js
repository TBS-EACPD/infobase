if (typeof window !== "undefined"){
  // feature detection
  // 
  // <div id='is_mobile'></div>
  // this is the bit of code for figuring out whether it's a mobile
  // device or not.  It was taken from a stackoverflow post
  // the global variable `window.is_mobile` is set
  var set_mobile = function(){
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.matchMedia("(max-width: 970px)").matches ) {
      window.is_mobile = true;
    } else {
      window.is_mobile = false;
    }
  };

  window.isIE = function() {
    var myNav = navigator.userAgent.toLowerCase();
    return (
      (myNav.indexOf('msie') !== -1) ? 
      parseInt(myNav.split('msie')[1]) : 
      myNav.indexOf('trident') !== -1
    );
  };


  window.has_local_storage = (function(){
    const blah = "blah";
    try {
      localStorage.setItem(blah, blah);
      localStorage.removeItem(blah);
      return true;
    } catch(e) {
      return false;
    }
  })()

  window.windows_os = navigator.appVersion.indexOf("Win") !== -1;

  window.details = 'open' in document.createElement('details');
  window.download_attr = ('download' in document.createElement('a'));
  window.clipboard_access = ('clipboardData' in window);
  // end of feature detection
  window.binary_download = typeof ArrayBuffer !== 'undefined'

  if (!window.details) {
    // stub code for details/summary functionality
    $(document).on("click","details .toggler",function(){
      $(this).parents("details").find(".togglee").toggleClass("hidden");
    });
  }

  set_mobile();
}  

// <div id='abbrev'></div>
// for abbreviating long strings of text on the screen
// but also keeping a hidden version of the full string
// for accessibility purposes 
export const abbrev = function(name,length, add_abbrev){
  //         the get_text function
  // * `name` : the text which needs to be abbreviated
  //  * `length` : the cut-off point in the string
  add_abbrev =  add_abbrev  || false;
  length = length || 60;
  var outerspan = $("<span>");
  if (name.length > length){
    $("<span>")
      .addClass("wb-inv original")
      .html(name)
      .appendTo(outerspan);
    if (add_abbrev) {
      $("<span>")
        .addClass("wb-inv abbrev")
        .html(window.lang === "en" ?  " abbreviated here as:" :  " abrégé ici:")
        .appendTo(outerspan);
    }
    $("<span>")
      .addClass("shortened")
      .html(name.substring(0,length-5)+"...")
      .appendTo(outerspan);
    return outerspan.html();
  } else {
    return name;
  }
};

export const make_unique_func = function(){
  var val = 0;
  return function(){
    return ++val;
  }
};

export const find_parent = (node,condition)=>{
  if (condition(node)){
    return node;
  }
  if (node.parentNode === document) { 
    return false; 
  }
  return find_parent(node.parentNode, condition);
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
class Select {
  constructor(options){
    const { 
      container, 
      data, 
      onSelect, 
      display_func,  //required, unless the items have a display or text field
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
            ${ display_func ?  display_func(val)  : (val.text || val.display || val) }
          </option>`
      )
        .join("")
    );
    node.onchange = ()=>{ onSelect(data[node.value]);};
  }
}

export { Select };

export const escapeRegExp = function(str) {
  /* eslint-disable no-useless-escape */
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

export const escapeSingleQuotes = function(str){
  return str.replace(/'/g, "&#39;")
};

export const shallowEqualObjectsOverKeys = (obj1, obj2, keys_to_compare) => _.reduce(keys_to_compare, (memo, key) => (memo && (obj1[key] === obj2[key]) ), true);



window._UTILS = { abbrev, make_unique_func, find_parent, make_unique, Select, escapeRegExp, escapeSingleQuotes, shallowEqualObjectsOverKeys };
