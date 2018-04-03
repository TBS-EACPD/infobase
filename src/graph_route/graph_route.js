const ROUTER = require('../core/router.js');
const {
  Dept, 
  Program, 
  SpendArea, 
  Tag, 
  Gov,
  CRSO,
} = require('../models/subject.js');
const { ensure_loaded } = require('../core/lazy_loader.js');
const { reactAdapter } = require('../core/reactAdapter.js');
const { 
  EverythingSearch,
}  = require('../util_components.js');

const {PanelGraph} = require('../core/PanelGraph');

function url_template(subject, graph){
  return `#graph/${subject.constructor.type_name}/${graph.key}/${subject.id}/`
}

const defaultSubjectKeys = {
  dept: '1',
  program: 'AGR-AAA00', //business risk management
  tag: 'GOC001',
  crso: "TBC-BXA00",
};

const getSubj = (level, org_param) => {
  let subject;
  switch(level){
    case 'dept':
      subject =  Dept.lookup(org_param) || Dept.lookup(defaultSubjectKeys.dept);
      break;
    case 'tag':
      subject = Tag.lookup(org_param) || Tag.lookup(defaultSubjectKeys.tag);
      break;
    case 'program':
      subject = Program.lookup(org_param) || Program.lookup(defaultSubjectKeys.program);
      break;
    case 'spendarea':
      subject = SpendArea.lookup(org_param) || SpendArea.lookup(defaultSubjectKeys.spendarea);
      break;
    case 'crso':
      subject = CRSO.lookup(org_param) || CRSO.lookup( defaultSubjectKeys.crso );
      break;
    default:
      subject =  Gov;
  }
  return subject;

}

const link_to_footnotes = ( graph_key, level) => `#footnotes/graph/${graph_key}/${level}`;

ROUTER.add_container_route("graph/:level_type:/:graph:/:org_id:","graph_route",function(container,level_type,graph_key, org_param){
  const title = "graph inventory"
  const h1 = document.createElement('h1');        // Create a <button> element
  const txt_node = document.createTextNode(title);       // Create a text node
  h1.appendChild(txt_node);       

  this.add_title(h1);
  this.add_crumbs([{html: title }]);


  level_type = (level_type || 'gov').toLowerCase()
  const subject = getSubj(level_type, org_param);

  var graph_obj = PanelGraph.lookup(graph_key,level_type) || PanelGraph.lookup('financial_intro', 'gov');
  const { similar_dependencies, same_key, rest }  = graphs_of_interest(graph_obj);

  var template = (`
    <div id="search_bar"></div>
    <div id="intro"></div>
    <div>
      <div id="main"></div>
      <h3> notes </h3>
      <p id="notes"></p>
    </div>
    <div id="meta"></div>
  `);


  container.innerHTML=template;


  
  container.querySelector('#meta').innerHTML = graph_info_template(subject,graph_obj, same_key, similar_dependencies, rest);
  container.querySelector('#notes').innerHTML = graph_obj.notes || "empty";

  container.querySelector('#main').appendChild(new Spinner({scale:3}).spin().el)
  ensure_loaded({ 
    graph_keys : [ graph_key ],
    subject_level: subject.level,
    subject,
  }).then( ()=> {
    container.querySelector('#main').innerHTML = "";

    const options = {}; 
    var data_for_graph = graph_obj.calculate(subject,options);

    container.querySelector('#intro').innerHTML = `
      <p> you are currently looking at the graph: <strong>${graph_obj && graph_obj.key}</strong> 
          for the subject <strong>${subject && subject.name}</strong>
          ${ data_for_graph ? "" : "<br> <strong> this graph bailed because some calculations failed </strong>" }
          <br> 
          scroll down for a list of all graphs in the infobase 
      </p>  
      <a href=${link_to_footnotes(graph_obj.key, graph_obj.level)}> See all possible footnotes for this graph </a>
    `

    reactAdapter.render(
      <div className="mrgn-bttm-lg">
        <EverythingSearch 
          placeholder="See this graph with another subject"
          org_scope="all_orgs_with_gov"
          include_tags={true}
          include_programs={true}
          href_template={ subj => url_template(subj, graph_obj) }
        />
      </div>,
      container.querySelector('#search_bar')
    );

    if(data_for_graph){
      graph_obj.render(d3.select(container.querySelector('#main')), data_for_graph, options); 
    }
  });


  
})

function graphs_of_interest(graph){
  const { depends_on, info_deps, key} = graph;
  const same_key = _.filter(PanelGraph.graphs, g => (g.key === key && g !== graph) );
  const similar_dependencies = _.chain(PanelGraph.graphs)
    .filter(g => !_.isEmpty(
      _.union(
        _.intersection(g.depends_on,depends_on),
        _.intersection(g.info_deps, info_deps)
      )
    )
    )
    .reject( g => g === graph )
    .value();

  const rest = _.chain(PanelGraph.graphs)
    .map()
    .difference([ graph, ...similar_dependencies ])
    .sortBy('key')
    .value()

  return { same_key, similar_dependencies, rest };
}  

function graph_info_template(main_subject,main_graph, same_key, similar_dependencies, rest){
  return (`
    <h2> Related graphs </h2>
    <table class='table table-bordered'>
      <thead>
        <tr> 
          <th> key </th>
          <th> level </th>
          <th> table deps </th>
          <th> info deps </th>
          <th> notes </th>
          <th> url </th>
      </thead>
      <tbody>
        ${ graph_templ(main_subject,main_graph, 'success') }
        ${ same_key.map( g => graph_templ(main_subject,g, 'info')).join("")  }
        ${ similar_dependencies.map( g => graph_templ(main_subject,g, 'warning')).join("")  }
        ${ rest.map( g => graph_templ(main_subject, g, '')).join("") }
      </tbody>
    </table>
  `);
}

function graph_templ(main_subject,graph, className){

  const url = (
    graph.level === main_subject.constructor.type_name ?
    url_template( main_subject, graph ) :
    url_template( 
      getSubj(graph.level, main_subject.id),
      graph
    )
  );

  return (`
    <tr class=${className}>
      <td> ${graph.key} </td>
      <td> ${graph.level} </td>
      <td> ${graph.depends_on.join(", ")} </td>
      <td> ${graph.info_deps.join(", ")} </td>
      <td> ${(graph.notes && graph.notes.substring(0,50)+'...') || 'none'} </td>
      <td> <a href='${url}'> link </a> </td>
    </tr>
  `);
}
