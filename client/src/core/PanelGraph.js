import { Table } from './TableClass.js';
import { get_info, tables_for_statistics } from './Statistics.js';
import { Subject } from '../models/subject.js';
import FootNote from '../models/footnotes.js';
import { rpb_link, get_appropriate_rpb_subject } from '../rpb/rpb_link.js';

const subjects = _.keys(Subject);

const graphs = {};
const create_graph_key = (key,level) => `${key}:${level}`;

const default_args = {
  depends_on: [],
  info_deps: [],
  machinery_footnotes: true,
  layout: {
    full: {graph: 12, text: 12},
  },
};

class PanelGraph {
  static get graphs() { return graphs; }

  static lookup(key,level){
    const lookup = create_graph_key(key,level);
    if (window.is_dev && !graphs[lookup]) {
      /* eslint-disable no-console */
      console.error(`bad graph key - ${lookup} for level ${level && level.type}`);
      return null;
    }
    return graphs[lookup];
  }

  static graphs_for_table(table_id){
    return _.filter(graphs, graph_obj => {
      const tables_from_info_deps = _.chain(graph_obj.info_deps)
        .compact()
        .map( stat_key => tables_for_statistics(stat_key) )
        .flatten()
        .value();

      return _.chain(graph_obj.depends_on)
        .union(tables_from_info_deps)
        .includes(table_id)
        .value();
          
    });
  }

  static graphs_for_level(level_name){
    return _.filter(graphs, {level: level_name});
  }

  static register_instance(instance){

    const { 
      full_key,
      level,
    } = instance;
    if (!_.includes(subjects, level)){
      throw `graph ${instance.key} has an undefined level`;
    }

    if (full_key in graphs){
      throw `graph ${instance.key} has already been defined`;
    }
    graphs[full_key] = instance;
  }

  new_api_warnings(){
    if(this.is_old_api || !window.is_dev){
      return;
    }
    _.each(["layout_def", "text", "title"], property => {
      if(this[property]){
        console.warning(`PanelGraph redundant property: ${property}`);
      }
    });
  }

  constructor(def){
    this.new_api_warnings();
    
    //note that everything attached to this is read-only
    //Additionally, every graph only has one object like this, so this object contains nothing about 

    //we copy every thing except render and calculate, which follow a specific API
    this._inner_calculate = def.calculate || (()=> true);
    this._inner_render = def.render;
    const to_assign = _.omit(def, [ 'render', 'calculate' ]);
    const full_key = create_graph_key(def.key,def.level);
    Object.assign(
      this,  
      default_args,
      to_assign,
      { full_key }
    );
                     
    this.constructor.register_instance(this);

  }

  get tables(){ //table defs in depends_on indexed by their table ids
    return _.chain(this.depends_on)
      .map( table_id => [table_id, Table.lookup(table_id) ] )
      .fromPairs()
      .value();
  }

  calculate(subject,options={}){ //delegates to the proper level's calculate function
    if (this.level !== subject.level){
      return false;
    }
    const calc_func = this._inner_calculate;
    const info = get_info(subject, this.info_deps);
    if(info.missing_values && this.missing_info !== 'ok'){ // dept is missing from table or an exception ocurred during one of the info_deps' computations
      return false; 
    }

    info.is_a11y_mode = window.is_a11y_mode;

    const graph_args = calc_func.call(this,subject,info, options);
    if(graph_args === false){ return false; }

    //inner_render API : a graph's inner_render fucntion usually wants access to info, graph_args and subject.
    return {subject, info, graph_args};
  }
  
  get_source(subject){
    if(this.source === false){
      return [];
    }
    if(_.isFunction(this.source)){
      return this.source(subject);
    } else { //if it's undefined we'll make one
      /* eslint-disable-next-line no-use-before-define */
      return _.chain(tables_for_graph(this.key, subject.level))
        .map( table => Table.lookup(table))
        .map( table => {

          let appropriate_subject = get_appropriate_rpb_subject(subject);

          return {
            html: table.name,
            href: rpb_link({
              subject: appropriate_subject.guid,
              table: table.id,
              mode: 'details',
            }),
          };
        })
        .value();
    }
  }

  get footnote_concept_keys(){

    if (this.footnotes === false){
      return [];
    } else if(_.isArray(this.footnotes)){
      return _.chain(this.footnotes)
        .concat( this.machinery_footnotes ? ["MACHINERY"] : [] )
        .uniqBy()
        .value();

    } else {
      return _.chain(this.tables)
        .map('tags')
        .compact()
        .flatten()
        .concat( this.machinery_footnotes ? ["MACHINERY"] : [] )
        .uniqBy()
        .value();

    }
  }

  get_footnotes(subject){ //array of footnote strings

    const footnote_concepts = this.footnote_concept_keys;

    return _.chain(
      FootNote.get_for_subject(
        subject,
        footnote_concepts
      )
    )
      .uniqBy('text') //some footnotes are duplicated to support different topics, years, orgs, etc. 
      .compact()
      .value();
  

  }

  render(calculations, options={}){
    const { subject } = calculations;
    const render_func = this._inner_render;
    const footnotes = this.get_footnotes(subject);
    const sources = this.get_source(subject);

    const react_el = render_func({
      calculations,
      footnotes,
      sources,        
    },options);
    
    return react_el;
    
  }
}


function graphs_with_key(key, level){
  let graphs = _.filter(PanelGraph.graphs, { key });
  if(level){
    graphs = _.filter(graphs, { level });
  }
  return graphs;
}

function tables_for_graph( graph_key, subject_level ){
  const graph_objs = graphs_with_key(graph_key, subject_level);
  return _.chain( graph_objs )
    .map('info_deps')
    .flatten()
    .map( tables_for_statistics )
    .flatten()
    .union( 
      _.chain(graph_objs)
        .map('depends_on')
        .flatten()
        .value()
    )
    .uniqBy()
    .value();
}

const layout_types = { full: 'full', half: 'half' };

export {
  layout_types,
  PanelGraph,
  graphs_with_key,
  tables_for_graph,  
};

window._DEV_HELPERS.PanelGraph = PanelGraph;
