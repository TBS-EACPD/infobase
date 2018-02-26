import { StandardRouteContainer } from '../core/NavComponents';
import { createSelector } from 'reselect';

require('./infographic.css');
require("./infographic.ib.yaml");

const ROUTER = require('../core/router.js');
const { shallowEqualObjectsOverKeys } = require('../core/utils.js');
const Subject = require("../models/subject");
const {text_maker} = require('../models/text');
const {reactAdapter} = require('../core/reactAdapter.js');
const { ensure_loaded } = require('../core/lazy_loader.js'); 
const { get_panels_for_subject } = require('./get_panels_for_subject.js');
const { bubble_defs }  = require('./bubble_definitions.js'); 
const { ReactPanelGraph } = require('../core/PanelCollectionView.js');
const { BUBBLE_MENU : { BubbleMenu } } = require('../core/D3');
const analytics = require('../core/analytics.js');

const {
  TextMaker,
  SpinnerWrapper,
  EverythingSearch,
} = require('../util_components');

const {
  Panel,
  PanelBody,
  PanelHeading,
} = require('../panel_components');

const {
  infograph_href_template,
  infograph_route_str,
} = require('./routes.js');


require('../graphs/intro_graphs/intro_graphs.js');
require('../graphs/result_graphs/result_graphs.js');
require('../graphs/igoc/igoc_panel.js');

// register the route for the GOC infograph
// register the route for the departmental info graph
const sub_app_name = "infographic_org"
ROUTER.add_container_route(
  infograph_route_str,
  sub_app_name,
  route_func
)


const name_for_title = subject => {
  if(subject.level === 'program' && !_.isEmpty(subject.dept.fancy_acronym)){
    return `${subject.name} (${subject.dept.fancy_acronym})`
  } else if(subject.level === 'org'){
    return subject.legal_name;
  } else {
    return subject.name;
  }
}

function route_func(container, subject_type,subject_id,data_area){

  container.innerHTML = "";
  
  const SubjectModel = Subject[subject_type];
  const subject = SubjectModel.lookup(subject_id);

  const title = text_maker("infographic_for",{ name: name_for_title(subject) });
  const h1 = document.createElement('h1');        // Create a <button> element
  d4.select(h1).html(title);

  this.add_title(h1);
  this.add_crumbs([{html: title }]);

  const data_area_id = bubble_defs[data_area] ? data_area : null;

  const graphs_by_bubble_id = get_panels_for_subject(subject);


  reactAdapter.render(
    <BubblyInfograph
      subject={subject}
      initial_area={data_area_id} 
      graphs_by_area={graphs_by_bubble_id}
    />,
    container
  );

};


class BubblyInfograph extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      active_area : props.initial_area,
      loading: true,
      sr_mode: false, //is a screen-reader being used? We only know once an sr-only element is interacted with.
    };

  }
  componentDidMount(){
    if(this.state.loading){
      this.loadGraphDeps();
    }
  }
  componentDidUpdate(){
    if(this.state.loading){
      this.loadGraphDeps();
    }
  }
  loadGraphDeps(){
    const graphs_to_render = this.get_graphs_for_area(this.state.active_area)
    ensure_loaded({
      graph_keys: _.map(graphs_to_render, 'key'),
      subject_level : this.props.subject.level,
      subject: this.props.subject,
      footnotes_for: this.props.subject,
    }).then(()=> {
      setTimeout(()=> {
        this.setState({
          loading: false,
        }, ()=> { 
          if(this.state.sr_mode){
            this.refs.graphs_mount.focus();
          }
        });
      },400);
    });
  }
  static get_previous_and_next_bubbles(bubble_areas){
    const active_index = _.findIndex(bubble_areas,{active:true})
    if(active_index === -1){
      return { next: null, prev: null };
    } else {
      return {
        next: bubble_areas[active_index+1],
        prev: bubble_areas[active_index-1],
      };
    }
  }
  render(){
    const { subject } = this.props;
    const { loading } = this.state;
    const graphs_to_render = this.get_graphs_for_area(this.state.active_area)
    const bubble_areas =  _.map(
      this.get_sorted_areas(),
      obj => ({ 
        id: obj.id,
        title : obj.title(this.props.subject),
        description : `
          <header>${obj.title(this.props.subject)}</header>
          <p>${obj.description(this.props.subject)}</p>
        `,
        className: obj.className,
        active : obj.id === this.state.active_area,
      })
    );

    const {
      next: next_bubble,
      prev: previous_bubble,
    } = this.constructor.get_previous_and_next_bubbles(bubble_areas);

    return <div aria-busy={this.state.loading}>
      <URLSynchronizer { ...this.props} {...this.state } />
      <AnalyticsSynchronizer { ...this.props} {...this.state } />
      <div className="row mrgn-bttm-md">
        <div 
          className="col-md-8" 
        >
          <EverythingSearch 
            include_gov={false} 
            href_template={subj => infograph_href_template(subj)}
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
      <div>
        <Panel>
          <PanelHeading headerType="h3">
            <TextMaker text_key="bb_menu_title" /> 
          </PanelHeading>
          <PanelBody>
            <TextMaker text_key={this.props.subject.level+"_above_bubbles_text"} />
            <div style={{position:'relative'}}>
              { this.state.loading && 
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
              <BubbleMenu 
                items={bubble_areas}
                onA11ySelect={id=> {
                  if(!this.state.loading){
                    this.setState({
                      sr_mode: true,
                      active_area:id,
                      loading: true,
                    });
                  } 
                }}
                onClick={id=>{
                  //when loading/rendering graphs, 
                  //make sure the user can't change selection
                  if(!this.state.loading){
                    this.setState({
                      active_area:id,
                      loading: true,
                    });
                  } 
                }}
              />
            </div>
          </PanelBody>
        </Panel>
      </div>
      <div ref="graphs_mount" tabIndex={-1}>
        { loading ? null : 
          _.map(graphs_to_render, graph_obj => 
            <ReactPanelGraph 
              graph_key={graph_obj.key}
              subject={subject}
              key={graph_obj.key + subject.guid}
            />
          )
        }
      </div>
      { this.state.active_area && 
        <div className="row medium_panel_text">
          <div className="previous_and_next_bubble_link_row">
            { previous_bubble ? 
              (
                <a 
                  className="previous_bubble_link btn-lg btn-ib-primary" 
                  href={infograph_href_template(this.props.subject, previous_bubble.id)}
                  style={{textDecoration:"none"}}
                >
                  {"← " +previous_bubble.title}
                </a>
              ) :
              (<a style={{visibility:"hidden"}}></a>)
            }
            { next_bubble ? 
              (
                <a 
                  className="next_bubble_link btn-lg btn-ib-primary" 
                  href={infograph_href_template(this.props.subject, next_bubble.id)}
                  style={{textDecoration:"none"}}
                > 
                  {next_bubble.title + " →"}
                </a>
              ) :
              (<a style={{visibility:"hidden"}}></a>)
            }
          </div>
          <div className="clearfix" />
        </div>
      }
    </div>
  }
  get_graphs_for_area(data_area){
    const { graphs_by_area } = this.props;

    return graphs_by_area[data_area];
  }
  get_sorted_areas(){
    const { graphs_by_area } = this.props;

    return _.chain(graphs_by_area)
      .keys()
      .map( bubble_id => bubble_defs[bubble_id] )
      .sortBy('ix')
      .value()

  }
}


class URLSynchronizer extends React.Component {
  render(){ return null; }
  //this will only be called when the user switches data areas. 
  //If the infograph changes, this might have to change as well...
  componentWillReceiveProps(nextProps){
    if(this.props.active_area !== nextProps.active_area){
      this.updateURLImperatively(nextProps);
    }
  }
  updateURLImperatively(nextProps){
    const new_url = infograph_href_template(nextProps.subject, nextProps.active_area);
    ROUTER.navigate(new_url, {trigger:false});
  }

}

class AnalyticsSynchronizer extends React.Component {
  componentDidMount(){
    this._logAnalytics();
  }
  componentDidUpdate(){
    this._logAnalytics();
  }
  shouldComponentUpdate(nextProps){
    const {
      active_area :  old_bubble,
      subject: old_subject,
    } = this.props;

    const {
      active_area :  new_bubble,
      subject: new_subject,
    } = nextProps;

    return (
      old_bubble !== new_bubble ||
      old_subject !== new_subject 
    );
  }
  render(){
    return null;
  }
  _logAnalytics(){
    const { 
      active_area,
      subject: { 
        level,
        guid,
      },
    } = this.props;

    analytics.log_standard_event({
      SUBAPP: sub_app_name,
      SUBJECT_GUID: guid,
      MISC1: level,
      MISC2: active_area,
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
        id: key,
        title: obj.title(subject),
        description: `
          <header>${obj.title(subject)}</header>
          <p>${obj.description(subject)}</p>
        `,
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

class InfoGraph_ extends React.Component {
  componentWillMount(){
    this.loadGraphDeps();
  }
  componentWillUpdate(nextProps, nextState){
    
    if(shallowEqualObjectsOverKeys(this.props, nextProps, ['subject','bubble','level'])){
      
      //if no props have changed, internal state is just handling its own loading.
      if(nextProps.subject !== this.props.subject){
        window.scrollTo(0, 0);
      }
    }
    this.loadGraphDeps();

  }
  render(){
    const { subject, bubble, navigate_to } = this.props;
    const { loading } = this.state;

    const sorted_bubbles = sorted_bubbles_for_subj({subject});
    const panel_keys = panels_for_subj_bubble({subject, bubble});

    const { previous_bubble, next_bubble } = this.get_previous_and_next_bubbles();

    return <div>
      <div className="row mrgn-bttm-md">
        <div 
          className="col-md-8" 
        >
          <EverythingSearch 
            include_gov={false} 
            href_template={subj => infograph_href_template(subj)}
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
      <div>
        <Panel>
          <PanelHeading headerType="h3">
            <TextMaker text_key="bb_menu_title" /> 
          </PanelHeading>
          <PanelBody>
            <TextMaker text_key={this.props.subject.level+"_above_bubbles_text"} />
            <div style={{position:'relative'}}>
              { this.state.loading && 
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
              <nav>
                <BubbleMenu 
                  items={sorted_bubbles}
                  onClick={id=>{
                    //when loading/rendering graphs, 
                    //make sure the user can't change selection
                    if(!this.state.loading){
                      navigate_to(infograph_href_template(subject, id));
                    } 
                  }}
                />
              </nav>
            </div>
          </PanelBody>
        </Panel>
      </div>
      <div>
        { loading ? null : 
          _.map(panel_keys, graph_obj => 
            <ReactPanelGraph 
              graph_key={graph_obj.key}
              subject={subject}
              key={graph_obj.key + subject.guid}
            />
          )  
        }
      </div>
      { !_.isEmpty(bubble) && 
        <div className="row medium_panel_text">
          <div className="previous_and_next_bubble_link_row">
            { previous_bubble ? 
              (
                <a 
                  className="previous_bubble_link btn-lg btn-ib-primary" 
                  href={infograph_href_template(this.props.subject, previous_bubble.id)}
                  style={{textDecoration:"none"}}
                >
                  {"← " +previous_bubble.title}
                </a>
              ) :
              (<a style={{visibility:"hidden"}}></a>)
            }
            { next_bubble ? 
              (
                <a 
                  className="next_bubble_link btn-lg btn-ib-primary" 
                  href={infograph_href_template(this.props.subject, next_bubble.id)}
                  style={{textDecoration:"none"}}
                > 
                  {next_bubble.title + " →"}
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
    const { bubble, subject } = this.props;
    const bubbles = sorted_bubbles_for_subj({subject});
    const active_index = _.indexOf(bubbles, bubble);

    return {
      next: bubbles[active_index+1],
      prev: bubbles[active_index-1],
    };
  }

  loadGraphDeps(){
    const { level, subject, bubble } = this.props;
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
    history,
  },
}) => {

  const SubjectModel = Subject[level];
  const subject = SubjectModel.lookup(subject_id);
  const bubble_id = bubble_defs[bubble] ? bubble : null;


  const title = text_maker("infographic_for",{ name: name_for_title(subject) });
  return (
    <StandardRouteContainer 
      title={title}
      breadcrumbs={[title]}
    >
      <h1> { title } </h1>
      <InfoGraph_
        level={level}
        subject={subject}
        bubble={bubble_id}
        navigate_to={ url => {
          history.push(url);
        }}
      />
    </StandardRouteContainer>
  );



};