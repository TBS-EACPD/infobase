const PANEL =  require("./panel");
const {Table} = require('./TableClass.js');
const {text_maker} =   require("../models/text.js");
const {get_info} = require('./Statistics.js');
const Subject = require('../models/subject.js');
const subjects = _.keys(Subject);
const FootNote = require('../models/footnotes.js');
const {  tables_for_statistics } = require('./Statistics.js');
const {rpb_link } = require('../rpb/rpb_link.js');
const { Details } = require('../components/Details.js');
const { FootnoteList } = require('../util_components.js');
const { reactAdapter } = require('./reactAdapter.js')

const graphs = {}
const create_graph_key = (key,level) => `${key}:${level}`;

const default_args = {
  depends_on: [],
  info_deps: [],
  machinery_footnotes: true,
};

class PanelGraph {
  static get graphs() { return graphs; }

  static lookup(key,level){
    const lookup =  create_graph_key(key,level);
    if (DEV && !graphs[lookup]) {
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
    return _.filter(graphs, {level : level_name});
  }

  static register_instance(instance){
    if (!_.includes(subjects, instance.level)){
      throw `graph ${instance.key} has an undefined level`;
    }
    const lookup =  create_graph_key(instance.key,instance.level);
    if (lookup in graphs){
      throw `graph ${instance.key} has already been defined`;
    }
    graphs[lookup] = instance;
  }

  constructor(def){
    //note that everything attached to this is read-only
    //Additionally, every graph only has one object like this, so this object contains nothing about 

    //we copy every thing except render and calculate, which follow a specific API
    this._inner_calculate = def.calculate || (()=> true)
    this._inner_render = def.render;
    const to_assign  = _.omit(def, [ 'render', 'calculate' ])
    Object.assign(
      this,  
      default_args,
      to_assign
    );
                     
    this.constructor.register_instance(this);

  }

  get tables(){ //table defs in depends_on indexed by their table ids
    return _.chain(this.depends_on)
      .map( table_id => [table_id,  Table.lookup(table_id) ] )
      .fromPairs()
      .value();
  }

  calculate(subject,options={}){ //delegates to the proper level's calculate function
    if (this.level !== subject.level){
      return false;
    }
    const calc_func = this._inner_calculate;
    const info = get_info(subject, this.info_deps)
    if(info.missing_values && this.missing_info !== 'ok'){  // dept is missing from table or an exception ocurred during one of the info_deps' computations
      return false; 
    }

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
      return _.chain(tables_for_graph(this.key, subject.level))
        .map( table => Table.lookup(table))
        .map( table => {

          let appropriate_subject = subject;
          if(subject.is('program')){ //rpb is useless at the program level
            appropriate_subject = subject.dept;
          } else if( subject.is('tag') && !table.programs) {
            appropriate_subject = Subject.Gov
          }

          return {
            html: table.name,
            href: rpb_link({
              subject: appropriate_subject.guid,
              table: table.id,
              mode: 'details',
            }),
          };
        })
        .value()
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

    return FootNote.get_for_subject(
      subject,
      footnote_concepts
    );
  

  }
  
  render(container, calculations, options={}) {
    const {subject, info}  = calculations;
    const render_func = this._inner_render;
    const layout_def = this.layout;
    const layout = layout_def[ (options.layout || 'full') ] ;
    const panel_args = Object.assign(
      {
        target : container,
        off : this.panel_off | [],
        panel_layout: layout,
        colmd : options.colmd || 12,
        title_el : "h3",
        text_class: 'medium_panel_text',
      },
      options.panel_args,
      this.panel_args
    );
    const panel = PANEL.panel(panel_args);
    //allow default titles and text in case multiple levels want the same title
    //TODO: dummy text fallback is for quick development ONLY
    const title = this.title || "dummy_text";
    const text_to_use = this.text || [];

    if (title) {
      panel.areas().title.html(text_maker(title,info));
    }
    [].concat(text_to_use).forEach(text => panel.add_text(text_maker(text,info)));


    const footnotes = this.get_footnotes(subject);
    if( !_.isEmpty(footnotes) ){
      reactAdapter.render(
        <Details
          summary_content={text_maker("footnotes")}
          content={
            <FootnoteList
              footnotes={_.map(footnotes, 'text')}
            />
          }
        />,
        panel.areas().footnotes.node()
      );
    }

    
    const sources = this.get_source(subject);

    if(_.isEmpty(sources)){
      panel.areas().source.remove();
    } else {
      panel.add_source(sources)
    }

    //TODO: maybe this override should be its own function, like the custom footnotes
    const ret =  render_func.call(this,panel,calculations,options);
    if(ret && ret.override){
      if(ret.override.text){
        ret.override.text.forEach(text => panel.add_text(text));
      }
    }
    //PANEL.center_text(panel.el); 
  }
};


function graphs_with_key(key, level){
  let graphs =  _.filter(PanelGraph.graphs, { key });
  if(level){
    graphs = _.filter(graphs, { level });
  }
  return graphs;
}

function tables_for_graph( graph_key, subject_level  ){
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
  


exports = module.exports = {
  layout_types : {
    full : "full",
    half : "half",
  },
  PanelGraph,
  graphs_with_key,
  tables_for_graph,  
}
window._PanelGraph = PanelGraph;
