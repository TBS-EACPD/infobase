const { Table } = require('./TableClass.js');
const { 
  PanelGraph,
  tables_for_graph,
} = require('./PanelGraph.js');

const { 
  Statistics,
  tables_for_statistics,
} = require('./Statistics.js');

const {
  load_results_bundle,
  load_results_counts,
} = require('../models/populate_results.js');

const { load_footnotes_bundle } = require('../models/populate_footnotes.js');

const { BudgetMeasure } = require('../models/subject.js'); 
const { load_budget_measures } = require('../models/populate_budget_measures.js');

// given an array of tables, returns a promise when they are all loaded.
function load(table_objs){
  return $.when.apply( 
    null,
    _.chain( table_objs ) 
      .reject( _.property('loaded') ) //ignore tables that are already loaded 
      .map( table => table.load() )
      .value()
  );
}

function ensure_loaded({ 
  graph_keys, 
  stat_keys, 
  table_keys, 
  subject_level, 
  results, 
  subject,
  require_result_counts, 
  footnotes_for: footnotes_subject,
}){
  const table_set = _.chain( table_keys )
    .union(
      _.chain(graph_keys)
        .map(key => tables_for_graph(key, subject_level))
        .flatten()
        .value()
    )
    .union(
      _.chain(stat_keys)
        .map(tables_for_statistics)
        .flatten()
        .value()
    )
    .uniqBy()
    .map( table_key => Table.lookup(table_key) )
    .value();

  //results can be required explicitly, or be a dependency of a graph/statistic
  const should_load_results = (
    results || 
    _.chain(graph_keys)
      .map(key => PanelGraph.lookup(key, subject_level))
      .map('requires_results')
      .concat( 
        _.chain(stat_keys)
          .map(key => Statistics.lookup(key))
          .map('requires_results')
          .value()
      )
      .some()
      .value()
  );

  const should_load_result_counts = (
    require_result_counts ||
    _.chain(graph_keys)
      .map(key => PanelGraph.lookup(key, subject_level))
      .map('requires_result_counts')
      .concat( 
        _.chain(stat_keys)
          .map(key => Statistics.lookup(key))
          .map('requires_result_counts')
          .value()
      )
      .some()
      .value()
  );

  const should_load_budget_measures = (
    (
      subject && subject.type_name === "budget_measure" ||
      _.chain(graph_keys)
        .map(key => PanelGraph.lookup(key, subject_level))
        .map('requires_budget_measures')
        .some()
        .value()
    ) &&
      _.isEmpty(BudgetMeasure.get_all())
      
  );

  const results_prom = (
    should_load_results ?
      load_results_bundle(subject) :
      $.Deferred().resolve()
  ) 

  const result_counts_prom = (
    should_load_result_counts ?
      load_results_counts() :
      $.Deferred().resolve()
  );

  const footnotes_prom = (
    footnotes_subject ?
      load_footnotes_bundle(footnotes_subject) :
      $.Deferred().resolve()
  );

  const budget_measures_prom = (
    should_load_budget_measures ?
      load_budget_measures() :
      $.Deferred().resolve()
  );
  
  return $.when(
    load(table_set),
    results_prom,
    result_counts_prom,
    footnotes_prom,
    budget_measures_prom
  );

}

module.exports = exports = { 
  ensure_loaded,
};
window._ensure_loaded = ensure_loaded;
