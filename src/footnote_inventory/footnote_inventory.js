import ROUTER from '../core/router.js';
import { reactAdapter } from '../core/reactAdapter.js';
import FootnoteModel from '../models/footnotes.js';
import { PanelGraph } from '../core/PanelGraph.js';
import { 
  Select, 
  TwoLevelSelect, 
  FancyUL,
} from '../util_components.js';
import classNames from 'classnames';

const link_to_graph_inventory = ( graph_key, level ) => `#graph/${level}/${graph_key}`;

const subject_label = ({subject, subject_class}) => {
  if(!_.isEmpty(subject)){
    if(subject.level === 'program'){
      return `${subject.name} (${subject.dept.name})`;

    } else if(subject.level === 'crso'){
      return `${subject.name} (${subject.dept.name})`;

    } else {
      return subject.name;

    }

  } else {
    return `All subjects of level: "${subject_class.type_name}"`;
  }

}

ROUTER.add_container_route("footnotes/:mode:/:concept_or_graph_key:/:level:","_footnote_inventory",function(container, mode, concept_or_graph_key, level){
  const title = "footnote inventory"
  const h1 = document.createElement('h1');        // Create a <button> element
  const txt_node = document.createTextNode(title);       // Create a text node
  h1.appendChild(txt_node);       
  this.add_title(h1);
  this.add_crumbs([{html: title }]);

  let selected_concept, 
    selected_level, 
    selected_graph;

  if(mode === 'concepts'){
    selected_concept = concept_or_graph_key;
  } else {
    mode = 'graphs';
    selected_graph = concept_or_graph_key;
    selected_level = level;
  }

  if(_.isEmpty(selected_level)){
    selected_level = 'dept';
  } 
  if(_.isEmpty(selected_graph)){
    selected_graph = 'welcome_mat'; //default to big blue
  }
  if(_.isEmpty(selected_concept)){
    selected_concept = 'EXP';
  }

  const initialState = {
    mode,
    selected_concept,
    selected_graph,
    selected_level,
  };

    
  reactAdapter.render(
    <FootnoteInspector 
      initialState={initialState}
      updateURL={url => ROUTER.navigate(url, {trigger:false}) }
    />,
    container
  );

  
})



class FootnoteInspector extends React.Component {
  constructor(props){
    super(props)

    const { initialState, updateURL } = props;

    this.updateURL = updateURL;

    this.all_graph_concepts = _.chain(PanelGraph.graphs)
      .map('footnote_concept_keys')
      .flatten()
      .uniqBy()
      .value();

    this.all_footnotes = FootnoteModel.get_all_flat();


    this.state = initialState;

  }

  get_all_footnotes_for_graph(graph_obj){

    const { level, footnote_concept_keys }  = graph_obj;

    return _.chain(this.all_footnotes)
      .filter( ({subject, subject_class, glossary_keys}) => (
        _.intersection(footnote_concept_keys,glossary_keys).length > 0
        && (
          subject && subject.level === level ||
          subject_class && subject_class.type_name === level
        )
      ))
      .groupBy(({subject, subject_class}) => subject_label({subject, subject_class}) )
      .value()
      
  }

  get_all_footnotes_for_concept(concept_key){

    return _.chain(this.all_footnotes)
      .filter( ({subject, subject_class, glossary_keys}) => _.includes(glossary_keys,concept_key))
      .groupBy(({subject, subject_class}) => subject_label({subject, subject_class}) )
      .toPairs()
      .sortBy( ([key,val]) => key )
      .value();
      
  }

  get_concepts_for_graph(graph_key,level){
    return PanelGraph.lookup(graph_key,level).footnote_concept_keys;
  }
  
  get_graphs_for_concept(concept_key){
    return _.chain(PanelGraph.graphs)
      .filter(graph => _.includes(graph.footnote_concept_keys, concept_key ))
      .value();
  }

  render(){

    const {
      mode,
      selected_graph,
      selected_concept,
      selected_level,
    } = this.state;

    const {
      get_concepts_for_graph,
      get_graphs_for_concept, 
      all_graph_concepts,
    } = this;


    const nav_bar = <ul className="nav nav-pills nav-justified mrgn-bttm-xl">
      <li 
        className={classNames(mode==='graphs' && 'active')}
        onClick={()=> this.setState({mode:'graphs'}) }
      >
        <a href="#"> Graphs </a>
      </li>
      <li 
        className={classNames(mode==='concepts' && 'active')}
        onClick={()=> this.setState({mode:'concepts'}) }
      >
        <a href="#"> Concepts </a>
      </li>
    </ul>;

    let body;
    if(mode === 'graphs'){
      const graph_obj = PanelGraph.lookup(selected_graph, selected_level);

      const sel = <TwoLevelSelect
        selected={`${selected_graph}:${selected_level}`}
        grouped_options={ 
          _.chain(PanelGraph.graphs)
            .groupBy('level')
            .map( (group, level) => ({
              id: level,
              display: level,
              children: group.map(graph => ({
                id: `${graph.key}:${graph.level}`,
                display: graph.key,
              })),
            }))
            .value()
        }
        onSelect={ id => {
          const [graph_key,level] = id.split(':');
          this.setState({
            selected_level: level,
            selected_graph: graph_key,
          });
        }}
      />
        
      body = <div>
        <p> selected graph: {selected_graph} ({selected_level})  {sel} </p>
      
        <div className="mrgn-bttm-lg">
          <a href={link_to_graph_inventory(selected_graph, selected_level)}> See this graph in action </a>
        </div>

        <ul className="nav nav-pills nav-justified mrgn-bttm-xl mrgn-rght-xl mrgn-lft-xl">
          {_.filter(PanelGraph.graphs, {key: selected_graph}).map( ({key,level})=> 
            <li className={classNames(level === selected_level && 'active')} key={level}>
              <a 
                href="#"
                role="button"
                onClick={e=>{
                  e.preventDefault();
                  this.setState({selected_level: level}); 
                }}
              >
                {level}
              </a>
            </li>
          )}
        </ul>
  
        <h2> concept keys for this graph </h2>
        <FancyUL>
          { _.map(get_concepts_for_graph(selected_graph, selected_level), concept => 
            <a 
              href="#"
              onClick={e=> { 
                e.preventDefault();
                this.setState({
                  selected_concept: concept,
                  mode: 'concepts', 
                })
              }}
            >
              {concept}
            </a>
          )}
        </FancyUL>

        <div className="mrgn-tp-lg">
          <h2> All footnotes for this graph </h2>
          <ul className="list-unstyled">
            {_.chain(this.get_all_footnotes_for_graph(graph_obj))
              .toPairs()
              .sortBy( ([name, footnotes]) => name )
              .map( ([name,footnotes]) => 
                <li key={name}>
                  <h5> {name} </h5>
                  <FancyUL>
                    {_.map(footnotes, ({ text }) =>
                      <div 
                        dangerouslySetInnerHTML={{__html: text }}
                      />
                    )}
                  </FancyUL>
                </li>
              )
              .value()
            }
          </ul>
        </div>
      </div>

    } else {
      const sel =  <Select
        selected={selected_concept}
        options={all_graph_concepts.map(id => ({id, display:id}))}
        onSelect={id => this.setState({selected_concept: id}) } 
      />;
      body = <div>
        <p> selected concept: {sel} </p>
        <h3> graphs subscribed to this concept </h3>
        <FancyUL>
          { _.chain( get_graphs_for_concept(selected_concept))
            .groupBy('level')
            .map( ( group, level) => 
              <div key={level}>
                <header> {level} </header>
                <ul>
                  { group.map(graph_obj => 
                    <li key={graph_obj.key}>
                      <a 
                        href="#"
                        role="button"
                        onClick={e=> { 
                          e.preventDefault(); 
                          this.setState({
                            mode: 'graphs',
                            selected_graph: graph_obj.key, 
                            selected_level: level,
                          });
                        }}
                      >
                        { graph_obj.key }
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            )
            .value()
          }
        </FancyUL>
        
        <div className="mrgn-tp-lg">
          <h2> All footnotes tagged with this concept </h2>
          <ul className="list-unstyled">
            {_.map(this.get_all_footnotes_for_concept(selected_concept), ([name,footnotes]) =>
              <li>
                <h4> {name} </h4>
                <FancyUL>
                  {_.map(footnotes, ({ text }) =>
                    <div 
                      dangerouslySetInnerHTML={{__html: text }}
                    />
                  )}
                </FancyUL>
              </li>
            )}
          </ul>
        </div>
      </div>


    }

    return <div>
      {nav_bar}
      {body}
    </div>;
    


  }

  state_to_url(){
    const {
      mode,
      selected_concept,
      selected_level,
      selected_graph, 
    } = this.state;


    if(mode === 'graphs'){
      return `#footnotes/panels/${selected_graph}/${selected_level}`;
    } else {
      return `#footnotes/concepts/${selected_concept}`;
    }

  }

  componentDidUpdate(){
    this.updateURL(this.state_to_url());

  }

}
