"use strict";
const {text_maker} = require('../models/text.js');
var hasher = window.hasher;
var crossroads = window.crossroads;
const analytics = require('./analytics.js');

const { reactAdapter } = require('./reactAdapter');
const {get_glossary_item_tooltip_html} = require('../models/glossary.js');

const { 
  should_add_survey_banner, 
  add_survey_banner,
} = require('./survey_link.js');

var _correct_url = function(newHash){
  if(newHash.charAt(0) !== '#')
    newHash = "#"+newHash;
  window.history.replaceState({},"InfoBase",newHash)
}

var router_instance = {
  initialize: function(){
    hasher.prependHash = ''; //default is '/', but we don't want #/start or #/t-AGR-..etc
    var _parseHash = function(newHash,oldHash){ 
      if (newHash === ''){
        _correct_url("#start");
        newHash  = 'start';
      }
      crossroads.parse(newHash); 
    };
    hasher.initialized.add(_parseHash);
    hasher.changed.add(_parseHash);
    hasher.init();
  },
  addRoute: function(){ 
    return crossroads.addRoute.apply(crossroads,arguments);
  },
  _watch_funcs: [],
  add_onChange: function(func){  //funcs that should be run when hash changes. hasher will handle this, except when it's turned off, which is why we keep a copy of these funcs
    this._watch_funcs.push(func); 
    hasher.changed.add(func);
  },
  navigate: function(hash,options){  
    if(hash.charAt(0) === '#') {
      hash = hash.substr(1);
    }
    if(options && options.trigger && options.trigger === true) {
      //cancel async rendering
      if (crossroads._prevMatchedRequest === hash) {
        // By default, crossroads won't re-match the current route. We want it to, bypassing hasher, because
        // we usually mount react in the on matched handler but always unmount it in the on navigate.
        // ie. not letting routes re-match means re-navigating to the current page clears al react
        crossroads.ignoreState = true;
        crossroads.parse(hash);
        crossroads.ignoreState = false;
      } else {
        hasher.setHash(hash);
      }
      
      document.body.id = "";
    }
    else  {  //set Hash silently
      hasher.changed.active = false; //disable changed signal
      hasher.setHash(hash); //set hash without dispatching changed signal
      hasher.changed.active = true; //re-enable signal   
      this._watch_funcs.forEach(function(func){ 
        func.call(null,hash);
      });
    }

  },
};

var page_context = {
  signal(name){ AppRouter._current_page_proms[name].resolve(); },
  register_page_proms(event_names){
    AppRouter._current_page_proms = (
      _.chain(event_names) 
        .map( name => [ name, $.Deferred() ] )
        .fromPairs()
        .value()
    );
  },
  nav_area : null,
  easyaccess: null, 
  bread_crumb: null,
  start_crumb: null,
  add_crumbs : function(crumbs){
    crumbs = crumbs || [];
    crumbs.unshift(this.start_crumb);
    this.reset_crumbs();
    $('head title').html(_.map(crumbs,"html").join(" - "));
    var last = crumbs.pop();
    _.each(crumbs, crumb=>{
      this.bread_crumb.append(
        $('<li>')
          .addClass("infobase-links")
          .append(
            $("<a>")
              .addClass(crumb["class"] || "")
              .attr("href",crumb.href)
              .html(crumb.html)
          )
      );
    });
    this.bread_crumb.append(
      $('<li>')
        .addClass("infobase-links")
        .append(
          $("<span>")
            .html(last.html)
        )
    );
  },
  reset_crumbs : function(title){
    this.bread_crumb.find(".infobase-links").remove();
  },
  add_title : function(title){
    if (_.isString(title)){
      title = $('<h1>').html(text_maker(title));
    }
    $(".nav_area").html("").append(title);
  },
  correct_url : _correct_url,
}

const AppRouter = {
  //navigates then delegates control to func, with a page event listener
  active_route: null,
  navigate_and_listen(hash, func){
    this.navigate(hash, {trigger:true});
    func(this._current_page_proms);
  },
  _current_page_proms: null,
  router_instance : router_instance,
  _routes : [],
  _default_route : '',
  
  add_container_route : function(pattern, func_name,func){
    this._routes.push({
      pattern : pattern,
      func_name : func_name,
      func : func,
    });
  },
  add_default_route : function(pattern, func_name,func){
    this._default_route = {
      pattern : "start",
      func_name : func_name,
      func : func,
    };
  },
  page_context : page_context, //contains add_crumbs, add_title, etc. this will be the context ('this') in the functions passed to add_container_route
  navigate : function(hash,options){
    if(hash.charAt(0) === '#') {
      hash = hash.substr(1);
    }
    if(options && options.trigger && options.trigger === true) {
      reactAdapter.unmountAll();
      //feature still in progress: cancelling any outstanding render tasks
    }
    return this.router_instance.navigate.apply(this.router_instance,arguments);
  },
  _add_route : function(route,options){
    var priority = 0;
    if(options){
      if(options.priority) 
        priority = options.priority
    }
    this.router_instance.addRoute(route.pattern,(...args) => {

      if(
        _.isEmpty(this.active_route) ||  //inital page
        this.active_route !== route.func_name //user changed sub-apps
      ){ 

        this.active_route = route.func_name;
        analytics.log_page_view(route.func_name);

      } else { 
        //navigation within a single sub-app, don't do anything

      }

      //goal: sub-apps will often use their containers to catch delegated events
      //to prevent these from always being run, we get rid of the old container completely 
      reactAdapter.unmountAll();
      var new_container = document.createElement('div');
      new_container.setAttribute('id', route.func_name);
      this.root_container.parentNode.replaceChild(new_container,this.root_container)
      this.root_container = new_container;
      //that.root_container.innerHTML="";
      
      $(".nav_area").children().remove();
      $(".nav_area").html(text_maker("nav_panel"));

      // find the WET breadcrumb element 
      this.page_context.bread_crumb = $('ol.breadcrumb');

      // assumes that the HTML file has the app listed as
      // the last entry in the breadcrumb trail
      this.page_context.bread_crumb.find("li:last").addClass("infobase-links");

      window.scrollTo(0, 0);

      // always pass the raw dom object, the module wlil wrap it in either
      // jquery or d3.select
      route.func.apply(
        this.page_context, 
        [this.root_container]
          .concat(args)
      );
    },priority )
  }, //add standard route def
  update_other_lang: function(newHash){
    var ref = $('#wb-lng a');
    if (ref.length > 0){
      var link = ref.attr("href").split("#")[0];
      ref.attr("href",[link,newHash].join("#"));
    }
  },
  start: function(){
    //note: this function is called only once, and that is after all calls to add_container_route have been done.

    const that = this;

    this.router_instance.add_onChange(this.update_other_lang);


    //enable all tooltips
    $('body').tooltip({
      selector: '[data-toggle=tooltip]',
      title: function(){ 
        if(this.getAttribute('data-glossary-key')){ //this is hacky, but tooltips with inline html as titles were being messed with by markdown =
          return get_glossary_item_tooltip_html(this.getAttribute('data-glossary-key'));
        } else {
          return this.getAttribute('title');
        }
      },
      placement: 'bottom',
    });

    //start listening for clicks
    $(document).on("click", "#app a, nav span:not(#wb-lng) a",function(e){
      //ctrl+click and cmd+click are shortcuts for open in new tab.
      //Since the browser still registers these as a click, we need to explicitly ignore them
      if (e.metaKey || e.ctrlKey){ 
        return;
      }
      var href = $(e.currentTarget).attr("href");
      
      if (href && (href.substr(0,7) === "http://" || href.substr(0,8) === "https://")) {
        return;
      }
      
      try {
        var el = $(href);
        if (el.length === 1){
          scrollTo(0,el.offset().top);
          setTimeout(function(){
            el.focus();
          },50);
        }
        else if (href && href !== '#'){
          that.navigate(href,{trigger:true});
        }
        e.preventDefault();
      } catch (error){
        if (href && href !== '#'){
          that.navigate(href,{trigger:true});
        }     
      }
    });


    if(should_add_survey_banner()){
      add_survey_banner();
    }
    // the router captures all clicks on anchor elements,`<a>`,
    // in order to allow for links which have no href but shouldn't
    // be triggering routers, this event listener will stop
    // the event from propagating further

    // setup the helpful top right hand links 
    that.page_context.easyaccess = $(".easy-access").html(text_maker("help_section_t"));

    // update language link
    this.update_other_lang(window.location.hash.replace("#",""));
   
    // hold reference to DOM
    this.page_context.nav_area =  $(".nav_area")[0];

    // establish two standardized crumbs which will 
    // almost always be present in the bread crumb trail
    // `start_crumb` and `home_crumb`.  
    this.page_context.start_crumb = {
      html : text_maker("title"), 
      href : "#start", 
      "class": "start",
    };
    this.root_container = document.createElement('div');
    $('#app').append(this.root_container);

    this._add_route({pattern:"{*}",func_name:this._default_route.func_name,func:this._default_route.func}, {priority:-1})

    //here, the _routes array has already been populated by numerous calls to add_container_route
    this._routes.forEach(function(route){
      that._add_route(route)
    })

    this.router_instance.initialize();
  
    window.initialize_analytics()   

  
  }, // start def
}; // AppRouter def




module.exports = exports = AppRouter;


