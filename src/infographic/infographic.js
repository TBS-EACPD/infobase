import './infographic.css';
import text from "./infographic.yaml";

import { StandardRouteContainer } from '../core/NavComponents';
import { createSelector } from 'reselect';
import { log_standard_event } from '../core/analytics.js';
import { BubbleMenu } from './BubbleMenu.js';
import AccessibleBubbleMenu from './a11y_bubble_menu.js';
import { shallowEqualObjectsOverKeys } from '../core/utils.js';
import { Subject } from "../models/subject.js";
import { ensure_loaded } from '../core/lazy_loader.js'; 
import { get_panels_for_subject } from './get_panels_for_subject.js';
import { bubble_defs } from './bubble_definitions.js'; 
import { ReactPanelGraph } from '../core/PanelCollectionView.js';

import {
  create_text_maker_component,
  SpinnerWrapper,
  EverythingSearch,
} from '../util_components';

import { infograph_href_template } from './routes.js';

const sub_app_name = "infographic_org";

const { text_maker, TM } = create_text_maker_component(text);

const name_for_title = subject => {
  if(subject.level === 'program' && !_.isEmpty(subject.dept.fancy_acronym)){
    return `${subject.name} (${subject.dept.fancy_acronym})`
  } else if(subject.level === 'org'){
    return subject.legal_name;
  } else {
    return subject.name;
  }
}

class AnalyticsSynchronizer extends React.Component {
  render(){ return null; }
  componentDidMount(){ this._logAnalytics(); }
  componentDidUpdate(){ this._logAnalytics(); }

  shouldComponentUpdate(nextProps){
    return !shallowEqualObjectsOverKeys(
      this.props,
      nextProps,
      ['subject','bubble','level']
    );
  }

  _logAnalytics(){
    const { 
      bubble,
      level,
      subject: {
        guid,
      },
    } = this.props;

    log_standard_event;

    log_standard_event({
      SUBAPP: sub_app_name,
      SUBJECT_GUID: guid, 
      MISC1: level,
      MISC2: bubble,
    })
  }
}

const panels_by_bubble_for_subj = createSelector(
  _.property("subject"), 
  subject => get_panels_for_subject(subject)
);
const sorted_bubbles_for_subj = createSelector(
  panels_by_bubble_for_subj,
  _.property('subject'),
  _.property('bubble'),
  (bubbles, subject, active_bubble) => _.chain(bubbles)
    .keys()
    .sortBy(key => bubble_defs[key].ix )
    .map(key => {
      const obj = bubble_defs[key];
      return {
        href: infograph_href_template(subject, key),
        id: key,
        title: obj.title(subject),
        description: `
          <header>${obj.title(subject)}</header>
          <p>${obj.description(subject)}</p>
        `,
        a11y_description: `<p>${obj.description(subject)}</p>`,
        active: obj.id === active_bubble,
        svg_content: obj.svg_content,
      };
    })
    .value()
);
const panels_for_subj_bubble = createSelector(
  panels_by_bubble_for_subj,
  _.property('bubble'),
  (panels_by_bubble, bubble_id) =>  panels_by_bubble[bubble_id] 
);

function reset_scroll(){
  window.scrollTo(0, 0);
}

class InfoGraph_ extends React.Component {
  constructor(props){
    super();
    this.state = {
      loading: true,
      subject: props.subject,
      bubble: props.bubble,
      level: props.level,
    };
  }
  static getDerivedStateFromProps(nextProps, prevState){
    if(!shallowEqualObjectsOverKeys(nextProps, prevState, ['subject','bubble','level'])){
      return {
        loading: true,
        subject: nextProps.subject,
        bubble: nextProps.bubble,
        level: nextProps.level,
      }
    } else {
      return null;
    }
  }
  componentDidMount(){
    this.loadGraphDeps(this.props);
  }
  componentDidUpdate(prevProps){
    if(this.state.loading){
      this.loadGraphDeps(this.props);
    }
    if(this.props.subject !== prevProps.subject){
      reset_scroll();
    }
  }
  render(){
    const { subject, bubble } = this.props;
    const { loading } = this.state;

    const sorted_bubbles = sorted_bubbles_for_subj(this.props);
    const panel_keys = panels_for_subj_bubble({subject, bubble});

    const { prev, next } = this.get_previous_and_next_bubbles();

    return <div>
      <AnalyticsSynchronizer {...this.props} />
      {
        window.is_a11y_mode ? 
        <div>
          <a href="#resource-explorer">
            <TM k="a11y_search_other_infographs" />
          </a>
        </div> :
        <div className="row mrgn-bttm-md">
          <div 
            className="col-md-8" 
          >
            <EverythingSearch 
              include_gov={false} 
              href_template={subj => infograph_href_template(subj,null,true)}
              search_text={text_maker('subject_search_placeholder')}
              large={true}
              include_tags={true}
              include_programs={true}
              include_glossary={false}
              include_crsos={true}
              include_tables={false}
              org_scope="all_orgs_with_gov"
            />
          </div>
          <div 
            className="col-md-4" 
          >
            <a 
              href="#resource-explorer" 
              className="btn-lg btn btn-ib-primary btn-block"
            > 
              <TM k="infograph_explorer_link" />
            </a>
          </div>
        </div>
      }
      <div>
        <div style={{position:'relative'}}>
          { loading && 
            <div
              className='no-cursor opaque-overlay'
              style={{
                position: 'absolute',
                left: '0px',
                top: '0px',
                width: "100%",
                height: "100%",
                backgroundColor: 'rgba(204,204,204,.5)',
                borderRadius : '5px',
              }}
            >
              <SpinnerWrapper scale={4} /> 
            </div>
          }
          {
            window.is_a11y_mode ? 
              <AccessibleBubbleMenu items={sorted_bubbles} /> : 
              <BubbleMenu items={sorted_bubbles} />
          }
        </div>
      </div>
      <div>
        { window.is_a11y_mode &&
          <p
            id="infographic-explanation-focus"
            tabIndex={0}
            aria-live="polite"        
          >
            { 
              loading ? 
              "Loading..." :
              text_maker("a11y_infograph_description")
            }
          </p>
        }
        { loading ? null : 
          _.map(panel_keys, graph_key => 
            <ReactPanelGraph 
              graph_key={graph_key}
              subject={subject}
              key={graph_key + subject.guid}
            />
          )  
        }
      </div>
      { !_.isEmpty(bubble) && 
        <div className="row medium_panel_text">
          <div className="previous_and_next_bubble_link_row">
            { prev ? 
              (
                <a 
                  className="previous_bubble_link btn-lg btn-ib-primary" 
                  href={infograph_href_template(subject, prev.id)}
                  onClick={reset_scroll}
                  style={{textDecoration:"none"}}
                >
                  {`←  ${prev.title}`}
                </a>
              ) :
              (<a style={{visibility:"hidden"}}></a>)
            }
            { next ? 
              (
                <a 
                  className="next_bubble_link btn-lg btn-ib-primary" 
                  href={infograph_href_template(subject, next.id)}
                  onClick={reset_scroll}
                  style={{textDecoration:"none"}}
                > 
                  {`${next.title}  →`}
                </a>
              ) :
              (<a style={{visibility:"hidden"}}></a>)
            }
          </div>
          <div className="clearfix" />
        </div>
      }
    </div>;
  }

  get_previous_and_next_bubbles(bubble_areas){
    const { bubble } = this.props;
    const bubbles = sorted_bubbles_for_subj(this.props);
    const active_index = _.findIndex(bubbles, { id: bubble});

    return {
      next: bubbles[active_index+1],
      prev: bubbles[active_index-1],
    };
  }

  loadGraphDeps({bubble, subject, level}){
    const panel_keys = panels_for_subj_bubble({subject, bubble});

    ensure_loaded({
      graph_keys: panel_keys,
      subject_level : level,
      subject: subject,
      footnotes_for: subject,
    }).then(()=> {
      this.setState({
        loading: false,
      });
    });
  }
}

export const InfoGraph = ({ 
  match: {
    params : {
      level, 
      subject_id, 
      bubble,
    },
  },
  history,
}) => {

  const SubjectModel = Subject[level];
  const subject = SubjectModel.lookup(subject_id);
  const bubble_id = bubble_defs[bubble] ? bubble : null;


  const title = text_maker("infographic_for",{ name: name_for_title(subject) });
  const desc_key = {
    financial: "finance_infograph_desc_meta_attr",
    people: "ppl_infograph_desc_meta_attr",
    results: "results_infograph_desc_meta_attr",
  }[bubble_id];
  return (
    <StandardRouteContainer 
      title={title}
      breadcrumbs={[title]}
      description={ desc_key && text_maker(desc_key)}
      route_key={sub_app_name}
    >
      <h1 dangerouslySetInnerHTML={{__html:title }} />
      <InfoGraph_
        level={level}
        subject={subject}
        bubble={bubble_id}
      />
    </StandardRouteContainer>
  );



};