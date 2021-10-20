/*
  Warning: you might be tempted to just directly dynamically import these, but as far as I know the 
  @babel/preset-env useBuiltIns: entry optimization won't transform the core-js import if you do. Unless 
  that changes (or we switch to a different useBuiltIns option) leave these as imports inside their own
  .side-effects.js module!
*/
import "core-js/stable";
import "regenerator-runtime/runtime";
