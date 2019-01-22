import './table_picker.scss';
import '../components/LabeledBox.scss';
import { Table } from '../core/TableClass.js';
import { GlossaryEntry,
  get_glossary_item_tooltip_html } from '../models/glossary.js';
import { CSSTransitionGroup } from 'react-transition-group';
import classNames from 'classnames';
import { 
  categories,
  concepts_by_category,
  concept_filter,
} from './table_picker_concept_filter.js';
import { TextMaker } from './rpb_text_provider.js';
import { get_static_url } from '../core/request_utils.js';


function toggleArrayElement(arr,el){
  return _.includes(arr,el) ?
  _.without(arr,el) :
  arr.concat(el);
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
          _.filter(table_obj.tags, concept_filter),
          concept => ({table_id: table_obj.id, concept_id: concept }) 
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
      .map( ({id }) => ({
        id,
        active: _.includes(active_concepts, id),
      }))
      .sortBy('topic')
      .value();

    const relevant_linkage = _.chain(linkage)
      .filter(({ table_id }) => _.find( tables_to_render, {id: table_id}) )
      .map(({concept_id, table_id}) => ({
        tag_id: concept_id,
        item_id: table_id,
      }))
      .value()


    return <div ref="main">
      <h2 id="tbp-title"> <TextMaker text_key="table_picker_title" /> </h2>
      <p className="medium_panel_text"><TextMaker text_key="table_picker_top_instructions" /></p>
      <div>
        <TaggedItemCloud 
          exiting={this.state.exiting}
          items={tables_to_render} 
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
    d3.select(this.refs.main)
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
    this.setState({active_concepts: new_active_concepts})
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
          <div className="item-card-mat">
            <div>
              <div className="item-card-footer">
                <div className="item-tag-container">
                  <span className="sr-only"><u> <TextMaker text_key='covered_concepts' /> </u></span>
                  <div className="item-tags">
                    {_.chain(item_tag_linkage)
                      .filter({item_id: id})
                      .map( ({tag_id}) => _.find(tags, {id: tag_id} ) )
                      .map( ({id, active}) => 
                        <div key={id} className={classNames(active && "active", active && "active", 'item-tag')}>
                          <TextMaker text_key={id} />
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
    

    const tags_by_category = _.fromPairs(
      _.map(categories, cat => [cat,_.chain(concepts_by_category[cat])
        .map(c => _.filter(tags,{ "id": c }))
        .flatten()
        .value()]));
    
    const generate_glossary_tooltip = (concept_id) => (
      <div className="tag-glossary-item">
        <img className="tag-glossary-icon"
          width={18}
          aria-hidden="true"
          src={get_static_url('svg/not-available-white.svg')} 
        />
        <div className="tag-tooltip-text" dangerouslySetInnerHTML={{ __html: get_glossary_item_tooltip_html(concept_id) }} />
      </div>
    );

    return <div>
      <div style={{padding: '0px'}}>
        {_.map(categories, cat => 
          <div key={cat} className="labeled-box">
            <div className="labeled-box-label">
              <div className="labeled-box-label-text">
                <TextMaker text_key={cat} />
              </div>
            </div>
            <div className="labeled-box-content" style={{'padding': '10px 0px 0px 10px', 'border': '2px solid #284162'}}>
              <ul className="tag-cloud-main">
                {_.map(tags_by_category[cat],({id, active}) => 
                  <li 
                    key={id}
                    className={classNames(active && 'active')}
                    onClick={() => onSelectTag(id)}
                  >
                    <button 
                      role="checkbox"
                      aria-checked={!!active}
                    >
                      <TextMaker text_key={id} />
                    </button>
                    { GlossaryEntry.lookup(id) &&
                      <span className="tag-button-helper" tabIndex="0" >
                        {generate_glossary_tooltip(id)}
                      </span>
                    }
                  </li>
                )} 
              </ul>
            </div> 
          </div>
        ) }
      </div>
      { _.isEmpty(items) ? 
        <div className="centerer" style={{minHeight: '300px'}}> 
          <p className="large_panel_text"> {noItemsMessage} </p> 
        </div> :
        <div>
          <div className="row item-cloud-row">
            <CSSTransitionGroup 
              className="col-md-4 item-cloud-col" 
              component="div"
              transitionName="transi-height"
              transitionEnterTimeout={500}
              transitionLeaveTimeout={500}
            >
              {items_split[0]}
            </CSSTransitionGroup>
            <CSSTransitionGroup 
              className="col-md-4 item-cloud-col"
              component="div"
              transitionName="transi-height"
              transitionEnterTimeout={500}
              transitionLeaveTimeout={500}
            >
              {items_split[1]}
            </CSSTransitionGroup>
            <CSSTransitionGroup 
              className="col-md-4 item-cloud-col"
              component="div"
              transitionName="transi-height"
              transitionEnterTimeout={500}
              transitionLeaveTimeout={500}
            >
              {items_split[2]}
            </CSSTransitionGroup>
            <div className="clearfix" />
          </div>
        </div>
      }
    </div>;
  }
}

export { 
  TablePicker,
};
