'use strict';
const ROUTER = require('../core/router.js')

const default_time_out = 1000;

const qs = (sel)=> document.querySelector(sel);

function navigate_and_wait(url, id){
  ROUTER.navigate(url, {trigger: true})
  return wait_for( ()=> document.querySelector('body#'+id), 10000).then(()=>{
    document.body.id="";  
  });
}

function wait_for( predicate, time_out=1000){
  const ret = $.Deferred();
  const interval = setInterval(()=>{
    if(predicate()){
      clearInterval(interval);
      ret.resolve();
    } 
  },100)
  setTimeout(()=> { 
    if(ret.state() !== 'resolved'){ 
      throw 'too slow'; 
    } 
  }, time_out);
  return ret;
}

function select_eventually( selector,time_out=1000){
  const ret = $.Deferred();
  wait_for( ()=> document.querySelector(selector), time_out ).then( ()=>{
    ret.resolve(document.querySelector(selector));
  });
  return ret;
}

module.exports = exports = { navigate_and_wait, wait_for, select_eventually, qs };
