import { StandardRouteContainer } from '../core/NavComponents';

import { get_panels_for_subject } from '../infographic/get_panels_for_subject/index.js';
import { Subject } from '../models/subject';
import { EverythingSearch, SpinnerWrapper } from '../components/index.js';
import { ensure_loaded } from '../core/lazy_loader';
import { PanelGraph } from '../core/PanelGraph';
import { Indicator } from '../models/results.js';
import { ReactPanelGraph } from '../core/PanelCollectionView';

const {
  Dept, 
  Program, 
  Tag,
  Gov,
  CRSO,
} = Subject;
  
function url_template(subject, panel){
  return `/panel/${subject.level}/${subject.id}/${panel.key}`;
}


const defaultSubjectKeys = {
  dept: '1',
  program: 'AGR-AAA00', //business risk management
  tag: 'GOC001',
  crso: "TBC-BXA00",
};

const get_subject = (level, id) => {
  let subject;
  switch(level){
    case 'dept':
      subject = Dept.lookup(id) || Dept.lookup(defaultSubjectKeys.dept);
      break;
    case 'tag':
      subject = Tag.lookup(id) || Tag.lookup(defaultSubjectKeys.tag);
      break;
    case 'program':
      subject = Program.lookup(id) || Program.lookup(defaultSubjectKeys.program);
      break;
    case 'crso':
      subject = CRSO.lookup(id) || CRSO.lookup( defaultSubjectKeys.crso );
      break;
    default:
      subject = Gov;
  }
  return subject;

};

export default class IsolatedPanel extends React.Component {
  constructor(){
    super();
    this.state = {
      loading: true,
    };
  }
  loadDeps(props){
    const level = props.match.params.level || 'dept';
    const subject_id = props.match.params.subject_id || '1';
    const panel_key = props.match.params.panel_key || 'welcome_mat';

    const subject = get_subject(level, subject_id);

    get_panels_for_subject(subject).then( () =>
      ensure_loaded({
        subject: subject,
        has_results: true,
        graph_keys: [ panel_key ],
        subject_level: subject.level,
        footnotes_for: subject,
      })
        .then( () => this.setState({loading: false, subject, level, panel_key}) )
    );
  }
  componentDidMount(){
    this.loadDeps({...this.props});
  }
  componentDidUpdate(){
    if(this.state.loading){
      this.loadDeps({...this.props});
    }
  }

  render(){
    const { loading, subject, level, panel_key } = this.state; 
    if(loading){
      return <SpinnerWrapper config_name={"sub_route"} />
    } else {
      return (
        <StandardRouteContainer 
          title={"TODO"}
          breadcrumbs={"TODO"}
          description={null}
          route_key={"panel"}
        >
          <div id="main">
            <ReactPanelGraph 
              graph_key={panel_key}
              subject={subject}
              key={`${panel_key}-${subject.guid}`}
            />
          </div>
        </StandardRouteContainer>
      );
    }
  }
}
IsolatedPanel.defaultProps = {
  level: 'dept',
  panel_key: 'drr_summary',
  subject_id: '1',
};