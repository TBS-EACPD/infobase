import { get_panels_for_subject } from '../infographic/get_panels_for_subject.js';
import  {createSelector } from 'reselect';
import { StandardRouteContainer } from '../core/NavComponents';
import { ReactPanelGraph } from '../core/PanelCollectionView.js';
import { Link } from 'react-router-dom';

const Subject = require('../models/subject.js');
const {
  Dept, 
  Program, 
  SpendArea, 
  Tag, 
  Gov,
  CRSO,
} = Subject;
const { ensure_loaded } = require('../core/lazy_loader.js');
const { 
  EverythingSearch,
  SpinnerWrapper,
}  = require('../util_components.js');

const {PanelGraph} = require('../core/PanelGraph');

function url_template(subject, graph){
  return `/graph/${subject.level}/${graph.key}/${subject.id}`
}

const defaultSubjectKeys = {
  dept: '1',
  program: 'AGR-AAA00', //business risk management
  tag: 'GOC001',
  crso: "TBC-BXA00",
};

const getSubj = (level, id) => {
  let subject;
  switch(level){
    case 'dept':
      subject =  Dept.lookup(id) || Dept.lookup(defaultSubjectKeys.dept);
      break;
    case 'tag':
      subject = Tag.lookup(id) || Tag.lookup(defaultSubjectKeys.tag);
      break;
    case 'program':
      subject = Program.lookup(id) || Program.lookup(defaultSubjectKeys.program);
      break;
    case 'spendarea':
      subject = SpendArea.lookup(id) || SpendArea.lookup(defaultSubjectKeys.spendarea);
      break;
    case 'crso':
      subject = CRSO.lookup(id) || CRSO.lookup( defaultSubjectKeys.crso );
      break;
    default:
      subject =  Gov;
  }
  return subject;

}

// Bring back footnotes inventory ??
// const link_to_footnotes = ( graph_key, level) => `#footnotes/graph/${graph_key}/${level}`;

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


const get_subj = createSelector(
  props => _.get(props, "match.params"),
  ({level, id}) => {
    if(_.isEmpty(level)){
      level = "gov";
    }
    return getSubj(level, id);
  }
);

const get_graph_obj = createSelector(
  get_subj,
  props => _.get(props, "match.params.graph"),
  (subject, graph_key) => {
    return PanelGraph.lookup(graph_key, subject.level) ||  PanelGraph.lookup('financial_intro', 'gov');
  }
);


const get_related_graphs = createSelector(
  get_graph_obj,
  graph => graphs_of_interest(graph)
);

const get_derived_props = props => {
  return {
    subject: get_subj(props),
    panel: get_graph_obj(props),
    related_graphs: get_related_graphs(props), 
  };
}


const RelatedInfo = ({ subject, panel, related_graphs }) => {

  const {
    similar_dependencies,
    same_key,
    rest,
  } = related_graphs;

  return <div>
    <h2> Related Panels </h2>
    <table className="table table-bordered">
      <thead>
        <tr>
          <th> key </th>
          <th> level </th>
          <th> table deps </th>
          <th> info deps </th>
          <th> notes </th>
          <th> url </th>
        </tr>
      </thead>
      <tbody>
        <PanelTableRow 
          key="current_graph"
          className="success"
          panel={panel}
          current_subject={subject}
        />
        {_.map(same_key, p => 
          <PanelTableRow
            key={p.full_key}
            panel={p}
            className="info"
            current_subject={subject}
          />
        )}
        {_.map(similar_dependencies, p => 
          <PanelTableRow
            key={p.full_key}
            panel={p}
            className="warning"
            current_subject={subject}
          />
        )}
        {_.map(rest, p => 
          <PanelTableRow
            key={p.full_key}
            panel={p}
            current_subject={subject}
          />
        )}
      </tbody>
    </table>
  </div>
}

const PanelTableRow = ({ current_subject, panel, className }) => {
  const url = (
    panel.level === current_subject.level ?
    url_template( current_subject, panel ) :
    url_template( 
      getSubj(panel.level, current_subject.id),
      panel
    )
  );

  return (
    <tr className={className}>
      <td> {panel.key} </td>
      <td> {panel.level} </td>
      <td> {panel.depends_on.join(", ")} </td>
      <td> {panel.info_deps.join(", ")} </td>
      <td> {panel.notes} </td>
      <td> <Link to={url}> link </Link> </td>
    </tr>
  );

};


export class GraphInventory extends React.Component {
  constructor(){
    super();
    this.state = {
      loading: true,
      derived_props: {},
    };
  }
  loadDeps({subject,panel}){
    ensure_loaded({
      graph_keys: [ panel.key ],
      subject_level: subject.level,
      subject,
      footnotes_for: subject,
    }).then(()=>{
      this.setState({loading: false});
    })
  }
  static getDerivedStateFromProps(nextProps, prevState){
    const old_derived_props = prevState.derived_props;
    const new_derived_props = get_derived_props(nextProps);
    if(!_.isEqual(old_derived_props, new_derived_props)){
      return {
        loading: true,
        derived_props: new_derived_props,
      };
    } else {
      return null;
    }
  }
  componentDidMount(){
    this.loadDeps(this.state.derived_props);
  }
  componentDidUpdate(){
    if(this.state.loading){
      this.loadDeps(this.state.derived_props);
    }
  }

  render(){

    const { 
      subject,
      panel,
      related_graphs,
    } = get_derived_props(this.props);
    const { loading } = this.state; 

    let content;
    if(loading){
      content = <SpinnerWrapper />;
    } else {
      content = <div>
        <h1> graph inventory </h1>
        <div className="mrgn-bttm-lg">
          <EverythingSearch
            placeholder="See this graph with another subject"
            org_scope="all_orgs_with_gov"
            include_tags={true}
            include_programs={true}
            href_template={ subj => url_template(subj, panel) }
          />
        </div>
        <div>
          <p> Selected subject: {subject.name} ({subject.level}) </p>
          <p> selected graph: {panel.key} </p>
        </div>
        <div id="main">
          <ReactPanelGraph 
            graph_key={panel.key}
            subject={subject}
            key={`${panel.key}-${subject.guid}`}
          />
          {_.isEmpty(panel.notes) && 
            <div>
              <h3> Notes </h3>
              { panel.notes }
            </div>
          }
        </div>
        <div id="meta">
          <RelatedInfo {...{
            panel, 
            subject,
            related_graphs,
          }} />
        </div>

      </div>
    }

    return (
      <StandardRouteContainer 
        title="graph inventory"
        breadcrumbs={["graph inventory"]}
        description={null}
        route_key={"graph_inventory"}
      >
        {content}
      </StandardRouteContainer>
    );

  }
}
