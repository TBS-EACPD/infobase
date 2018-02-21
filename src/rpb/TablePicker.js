require('./table_picker.scss');
const {Table} = require('../core/TableClass.js');
const {GlossaryEntry } = require('../models/glossary.js');
const ReactCSSTransitionGroup  = require('react-addons-css-transition-group');
const classNames = require('classnames');
const concepts_to_display_filter = require('./table_picker_concept_filter.js');
const { 
  TextMaker,
} = require('../util_components.js');


function toggleArrayElement(arr,el){
  return _.includes(arr,el) ?
  _.without(arr,el)  :
  arr.concat(el);
}

function get_concepts_for_table(table_obj){
  return _.chain(table_obj.tags)
    .filter(concepts_to_display_filter)
    .map( tag => GlossaryEntry.lookup(tag) )
    .compact()
    .value();
}


/* 
  props:
    onSelect : table_id =>  
*/

class TablePicker extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      active_concepts: [],
    };
  
    this.fadeOutAndSelectTable = _.bind(this.fadeOutAndSelectTable, this)


    this.tables = _.chain(Table.get_all())
      .reject('reference_table')
      .map(t => ({
        id: t.id, 
        display: t.name, 
        description: <div dangerouslySetInnerHTML={{__html: t.short_description }} />,
      }))
      .value();
    
    //note that a concept without tables will not get included here.
    this.linkage = _.chain(Table.get_all())
      .reject('reference_table')
      .map(table_obj => (
        _.map(
          get_concepts_for_table(table_obj),
          concept => ({table_id: table_obj.id, concept_id: concept.id }) 
        )
      ))
      .flatten()
      .value();


    //note that this will only include concepts that are actually linked to stuff. 
    this.concepts = _.chain(this.linkage)
      .map('concept_id')
      .uniqBy()
      .map( concept_id => ({ 
        id: concept_id, 
        display: GlossaryEntry.lookup(concept_id).title,
      }))
      .value();

  }
  render(){
    const { 
      active_concepts, 
    } = this.state;

    const { 
      linkage, 
      concepts, 
      tables, 
    } = this;


    const tables_to_render = (
      _.isEmpty(active_concepts) ?
      tables : 
      _.chain(active_concepts)
        .map( concept_id => _.chain(linkage)
          .filter({concept_id})
          .map('table_id')
          .value()
        ) 
        .pipe( groups => _.intersection.apply(null, groups) )
        .map(id=> _.find(tables, { id }) )
        .compact()
        .value()
    );


    const concepts_to_display = _.chain(linkage)
      .filter( ({table_id}) => _.find( tables, {id: table_id} ) )
      .map('concept_id')
      .uniqBy()
      .map( id => _.find(concepts, { id }) )
      .map( ({id, display }) => ({
        id,
        display,
        active: _.includes(active_concepts, id),
      }))
      .sortBy('display')
      .value();

    const relevant_linkage = _.chain(linkage)
      .filter(({ table_id }) => _.find( tables_to_render, {id: table_id}) )
      .map(({concept_id, table_id}) => ({
        tag_id: concept_id,
        item_id: table_id,
      }))
      .value()

    return <div ref="main">
      <h3 id="tbp-title"> <TextMaker text_key="table_picker_title" /> </h3>
      <p className="medium_panel_text"><TextMaker text_key="table_picker_top_instructions" /></p>
      <div>
        <TaggedItemCloud 
          exiting={this.state.exiting}
          items={tables_to_render } 
          tags={concepts_to_display}
          item_tag_linkage={relevant_linkage}
          onSelectTag={concept_id=>{this.selectConcept(concept_id)}}
          onSelectItem={table_id=>{this.fadeOutAndSelectTable(table_id)}}
          noItemsMessage={ <TextMaker text_key="table_picker_no_tables_found" /> }
        />
      </div>
    </div>;
  }
  fadeOutAndSelectTable(table_id){
    this.setState({ exiting: true })
    const initialHeight = this.refs.main.offsetHeight;
    d4.select(this.refs.main)
      .style('max-height',initialHeight+'px')
      .style('opacity', 1)
      .transition()
      .duration(750)
      .style('max-height','1px')
      .style('opacity', 1e-6)
      .on('end', ()=>{
        this.props.onSelect(table_id);
      });

  }
  selectConcept(concept_id){
    const new_active_concepts = toggleArrayElement(this.state.active_concepts, concept_id)
    this.setState({active_concepts : new_active_concepts})
  }
  selectTable(selected_table){
    const { onSelect } = this.props;
    this.setState({ selected_table })
    if(_.isFunction(onSelect)){
      onSelect(selected_table); 
    }
  }
}

//stateless presentational component
class TaggedItemCloud extends React.Component {
  render(){
    const {
      tags,
      items,
      item_tag_linkage,
      onSelectItem,
      onSelectTag,
      noItemsMessage,
    } = this.props;

    const flat_items = _.map(items, ({display,id, description}) => (
      <div key={id}>
        <div className="item-card">
          <div className="item-title centerer">
            {display}
          </div>
          <div className="item-card-John-fixed-it">
            <div>
              <div className="item-card-footer">
                <div className="item-tag-container">
                  <span role="heading" className="sr-only"><u> <TextMaker text_key='covered_concepts' /> </u></span>
                  <div className="item-tags">
                    {_.chain(item_tag_linkage)
                      .filter({item_id: id})
                      .map( ({tag_id}) => _.find(tags, {id:tag_id} ) )
                      .map( ({id, display, active}) => 
                        <div key={id} className={classNames(active && "active", active && "active", 'item-tag')}>
                          {display}
                        </div>
                      )
                      .value()
                    }
                  </div>
                </div>
                <div className="item-select">
                  <button onClick={()=>onSelectItem(id)} className="btn btn-ib-primary btn-xs"> <TextMaker text_key="select_table" /> </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ));

    const items_split = _.chain(flat_items)
      .map( (item,ix) => ({item,ix}) )
      .groupBy( ({item,ix})=> ix%3 )
      .map( group => _.map(group, 'item') )
      .value();
    
    return <div>
      <div style={{padding: '0px'}}>
        <ul className="tag-cloud tag-cloud-main">
          {_.map(tags, ({display, id, active}) => 
            <li 
              key={id}
              className={classNames(active && 'active')}
            >
              <button 
                role="checkbox"
                aria-checked={!!active}
                className="button-unstyled"
                onClick={()=>onSelectTag(id)}
              >
                { display }
              </button>
            </li>
          )} 
        </ul> 
      </div>
      { _.isEmpty(items) ? 
        <div className="centerer" style={{minHeight: '300px'}}> 
          <p className="large_panel_text"> {noItemsMessage} </p> 
        </div> :
        <div>
          <div className="row item-cloud-row">
            <ReactCSSTransitionGroup 
              className="col-md-4 item-cloud-col" 
              component="div"
              transitionName="transi-height"
              transitionEnterTimeout={500}
              transitionLeaveTimeout={500}
            >
              {items_split[0]}
            </ReactCSSTransitionGroup>
            <ReactCSSTransitionGroup 
              className="col-md-4 item-cloud-col"
              component="div"
              transitionName="transi-height"
              transitionEnterTimeout={500}
              transitionLeaveTimeout={500}
            >
              {items_split[1]}
            </ReactCSSTransitionGroup>
            <ReactCSSTransitionGroup 
              className="col-md-4 item-cloud-col"
              component="div"
              transitionName="transi-height"
              transitionEnterTimeout={500}
              transitionLeaveTimeout={500}
            >
              {items_split[2]}
            </ReactCSSTransitionGroup>
            <div className="clearfix" />
          </div>
        </div>
      }
    </div>;
  }
}

module.exports = exports = { 
  TablePicker,
}
