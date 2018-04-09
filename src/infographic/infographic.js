import './infographic.css';
import "./infographic.ib.yaml";

import { StandardRouteContainer } from '../core/NavComponents';
import { createSelector } from 'reselect';
import { log_standard_event } from '../core/analytics.js';
import AccessibleBubbleMenu from './a11y_bubble_menu.js';


const { shallowEqualObjectsOverKeys } = require('../core/utils.js');
const Subject = require("../models/subject");
const {text_maker} = require('../models/text');
const { ensure_loaded } = require('../core/lazy_loader.js'); 
const { get_panels_for_subject } = require('./get_panels_for_subject.js');
const { bubble_defs }  = require('./bubble_definitions.js'); 
const { ReactPanelGraph } = require('../core/PanelCollectionView.js');
const { BUBBLE_MENU : { BubbleMenu } } = require('../core/charts_index');



const {
  TextMaker,
  TM,
  SpinnerWrapper,
  EverythingSearch,
} = require('../util_components');

const {
  Panel,
  PanelBody,
  PanelHeading,
} = require('../panel_components');

const { infograph_href_template } = require('./routes.js');



const sub_app_name = "infographic_org";

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
        className: obj.className,
        active: obj.id === active_bubble,
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
  componentWillMount(){
    this.loadGraphDeps(this.props);
  }
  componentWillUpdate(nextProps, nextState){
    if(nextProps.subject !== this.props.subject){
      reset_scroll();
    }
  }
  componentWillReceiveProps(nextProps){
    if(!shallowEqualObjectsOverKeys(this.props, nextProps, ['subject','bubble','level'])){
      this.loadGraphDeps(nextProps);
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
              org_scope="orgs_with_data_with_gov"
            />
          </div>
          <div 
            className="col-md-4" 
          >
            <a 
              href="#resource-explorer" 
              className="btn-lg btn btn-ib-primary btn-block"
            > 
              <TextMaker text_key="infograph_explorer_link" />
            </a>
          </div>
        </div>
      }
      <div>
        <Panel>
          <PanelHeading headerType="h3">
            <TextMaker text_key="bb_menu_title" /> 
          </PanelHeading>
          <PanelBody>
            <TextMaker text_key={this.props.subject.level+"_above_bubbles_text"} />
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
          </PanelBody>
        </Panel>
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

    this.setState({
      loading: true,
    });

    ensure_loaded({
      graph_keys: panel_keys,
      subject_level : level,
      subject: subject,
      footnotes_for: subject,
    }).then(()=> {
      //we set a minimum of 400 wait
      setTimeout(()=> {
        this.setState({
          loading: false,
        });
      },400); 
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
  return (
    <StandardRouteContainer 
      title={title}
      breadcrumbs={[title]}
      description={text_maker("infographic_description", {subject})}
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