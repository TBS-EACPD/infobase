import { Redirect } from 'react-router';

import './Infographic.scss';
import text from "./Infographic.yaml";

import { IconFilter } from '../icons/icons.js';
import { Details } from '../components/Details.js';
import { GraphLegend } from '../charts/declarative_charts.js';
import { StandardRouteContainer } from '../core/NavComponents';
import { Table } from '../core/TableClass.js';
import { log_standard_event } from '../core/analytics.js';
import { BubbleMenu } from './BubbleMenu.js';
import AccessibleBubbleMenu from './a11y_bubble_menu.js';
import { shallowEqualObjectsOverKeys, SafeJSURL } from '../general_utils.js';
import { Subject } from "../models/subject.js";
import { ensure_loaded } from '../core/lazy_loader.js';
import { bubble_defs } from './bubble_definitions.js'; 
import { get_panels_for_subject } from '../panels/get_panels_for_subject/index.js';
import { PanelRenderer } from '../panels/PanelRenderer.js';
import { tables_for_panel, PanelRegistry } from '../panels/PanelRegistry.js';
import {
  create_text_maker_component,
  SpinnerWrapper,
  AdvancedSearch,
} from '../components/index.js';

import { infograph_href_template } from './infographic_link.js';

const sub_app_name = "infographic_org";

const { text_maker, TM } = create_text_maker_component(text);

class AnalyticsSynchronizer extends React.Component {
  render(){ return null; }
  componentDidMount(){ this._logAnalytics(); }
  componentDidUpdate(){ this._logAnalytics(); }

  shouldComponentUpdate(nextProps){
    return !shallowEqualObjectsOverKeys(
      this.props,
      nextProps,
      ['subject','active_bubble_id','level']
    );
  }

  _logAnalytics(){
    const { 
      active_bubble_id,
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
      MISC2: active_bubble_id,
    });
  }
}

const get_sorted_bubbles_for_subj = (bubbles_for_subject, subject, active_bubble_id) => _.chain(bubbles_for_subject)
  .keys()
  .sortBy( key => bubble_defs[key].ix )
  .map(key => {
    const bubble = bubble_defs[key];
    return {
      href: infograph_href_template(subject, key),
      id: key,
      title: bubble.title(subject),
      description: `
        <div>${bubble.title(subject)}</div>
        <p>${bubble.description(subject)}</p>
      `,
      a11y_description: `<p>${bubble.description(subject)}</p>`,
      active: bubble.id === active_bubble_id,
      svg_content: bubble.svg_content,
    };
  })
  .value();
const get_panels_for_subj_bubble = (panels_by_bubble, bubble_id) => panels_by_bubble[bubble_id];

function reset_scroll(){
  window.scrollTo(0, 0);
}

class InfoGraph_ extends React.Component {
  constructor(props){
    super();
    this.state = {
      bubble_menu_loading: true,
      infographic_loading: true,
      panel_filter: {},
      subject: props.subject,
      bubbles_for_subject: {},
      active_bubble_id: props.active_bubble_id,
      level: props.level,
    };
  }
  static getDerivedStateFromProps(nextProps, prevState){
    if ( !shallowEqualObjectsOverKeys(nextProps, prevState, ['subject','active_bubble_id','level']) ){
      return {
        bubble_menu_loading: true,
        infographic_loading: true,
        subject: nextProps.subject,
        bubbles_for_subject: {},
        active_bubble_id: nextProps.active_bubble_id,
        level: nextProps.level,
      };
    } else {
      return null;
    }
  }
  componentDidMount(){
    this.loadBubbleMenuDeps(this.props);
  }
  componentDidUpdate(prevProps){
    const {
      bubble_menu_loading,
      infographic_loading,
      active_bubble_id,
      bubbles_for_subject,
    } = this.state;

    if (bubble_menu_loading){
      this.loadBubbleMenuDeps(this.props);
    } else if(infographic_loading){
      this.loadGraphDeps({...this.state, ...this.props});
    } else if( !_.isNull(active_bubble_id) ){
      if (this.props.subject !== prevProps.subject){
        reset_scroll();
      }
      const options = SafeJSURL.parse(this.props.options);
      const panel_keys = bubble_menu_loading || get_panels_for_subj_bubble(bubbles_for_subject, active_bubble_id);
      
      const linked_to_panel = ( options && options.panel_key && _.includes(panel_keys, options.panel_key) ) && document.querySelector(`#${options.panel_key}`);
      if ( linked_to_panel ){
        linked_to_panel.scrollIntoView();
        linked_to_panel.focus();
      }
    }
  }
  render(){
    const { subject, active_bubble_id } = this.props;
    const { 
      bubble_menu_loading,
      infographic_loading,
      bubbles_for_subject,
      panel_filter,
      total_number_of_panels,
    } = this.state;
    const loading = bubble_menu_loading || infographic_loading;

    // Shortcircuit these to false when bubble menu is loading because the sorted bubbles can't be known yet
    const sorted_bubbles = bubble_menu_loading || get_sorted_bubbles_for_subj(bubbles_for_subject, subject, active_bubble_id);
    const panel_keys = bubble_menu_loading || get_panels_for_subj_bubble(bubbles_for_subject, active_bubble_id);
    const { prev, next } = bubble_menu_loading || this.get_previous_and_next_bubbles();

    const search_component = <AdvancedSearch
      everything_search_config={{
        href_template: subj => infograph_href_template(subj, active_bubble_id, '/'),
        search_text: text_maker('subject_search_placeholder'),
        large: true,
      }}
      
      initial_configs={{
        include_orgs_normal_data: true,
        include_orgs_limited_data: true,

        include_crsos: true,
        include_programs: true,

        include_tags_goco: true,
        include_tags_hi: true,
        include_tags_hwh: true,
        include_tags_wwh: true,
      }}

      invariant_configs={{
        include_glossary: false,
        include_tables: false,
      }}
    />;
    const filter_icon_props = {
      color: window.infobase_color_constants.primaryColor,
      title: "Filter icon for panels",
      width: 15,
      height: 15,
      vertical_align: 5,
    };
    const panel_renderers = !loading &&
      _.chain(panel_keys)
        .map((panel_key) => {
          const panel_obj = PanelRegistry.lookup(panel_key, subject.level);
          const panel_filter_arr = _.map(panel_filter, (value, key) => panel_filter[key] && key);
          const is_filtered = _.intersection(panel_filter_arr, panel_obj.depends_on).length > 0;

          return is_filtered && <PanelRenderer
            panel_key={panel_key}
            subject={subject}
            active_bubble_id={active_bubble_id}
            key={panel_key + subject.guid}
          />;
        })
        .filter()
        .value();

    return (
      <div>
        <AnalyticsSynchronizer {...this.props} />
        { window.is_a11y_mode &&
          <div>
            <TM k="a11y_search_other_infographs" />
            {search_component}
          </div>
        }
        { !window.is_a11y_mode &&
          <div className="row infographic-search-container"> 
            {search_component}
          </div>
        }
        <div>
          <div>
            { loading && <SpinnerWrapper config_name={"route"} /> }
            { !loading && (
              window.is_a11y_mode ? 
                <AccessibleBubbleMenu items={sorted_bubbles} /> : 
                <BubbleMenu items={sorted_bubbles} />
            )}
          </div>
        </div>
        <div>
          { window.is_a11y_mode &&
            <p
              id="infographic-explanation-focus"
              aria-live="polite"
              tabIndex={0}
            >
              { 
                loading ? 
                  "Loading..." :
                  text_maker("a11y_infograph_description")
              }
            </p>
          }
          <Details
            closed_drawer_icon={
              <IconFilter
                {...filter_icon_props}
                key="closed_filter"
              />
            }
            opened_drawer_icon={
              <IconFilter
                {...filter_icon_props}
                key="opened_filter"
                rotation={180}
              />
            }
            summary_content={text_maker("filter_panels")}
            persist_content={true}
            content={
              <GraphLegend
                items={ _.map(panel_filter, (checked, dependency) => 
                  ({
                    id: dependency,
                    label: Table.lookup(dependency).name,
                    active: checked,
                    color: window.infobase_color_constants.primaryColor,
                  })
                )}
                onClick={ (evt) => {
                  const copy_filter = _.clone(panel_filter);
                  copy_filter[evt] = !panel_filter[evt];
                  this.setState({ panel_filter: copy_filter });
                }}
              />  
            }
          />
          <span className="panel-status-text">
            <TM k="panels_status"
              args={{ number_of_active_panels: panel_renderers.length, total_number_of_panels: total_number_of_panels }}
            />
          </span>
          { !loading && 
            panel_renderers
          }
        </div>
        { !_.isEmpty(active_bubble_id) && 
          <div className="row medium_panel_text">
            <div className="previous_and_next_bubble_link_row">
              { prev ? 
                (
                  <a 
                    className="previous_bubble_link btn-lg btn-ib-primary" 
                    href={infograph_href_template(subject, prev.id)}
                    onClick={reset_scroll}
                    style={{textDecoration: "none"}}
                  >
                    {`←  ${prev.title}`}
                  </a>
                ) :
                (<a style={{visibility: "hidden"}}></a>)
              }
              { next ? 
                (
                  <a 
                    className="next_bubble_link btn-lg btn-ib-primary" 
                    href={infograph_href_template(subject, next.id)}
                    onClick={reset_scroll}
                    style={{textDecoration: "none"}}
                  > 
                    {`${next.title}  →`}
                  </a>
                ) :
                (<a style={{visibility: "hidden"}}></a>)
              }
            </div>
            <div className="clearfix" />
          </div>
        }
      </div>
    );
  }

  get_previous_and_next_bubbles(bubble_areas){
    const { subject, active_bubble_id } = this.props;
    const { bubbles_for_subject } = this.state;

    const bubbles = get_sorted_bubbles_for_subj(bubbles_for_subject, subject, active_bubble_id);
    const active_index = _.findIndex(bubbles, { id: active_bubble_id});

    return {
      next: bubbles[active_index+1],
      prev: bubbles[active_index-1],
    };
  }

  loadBubbleMenuDeps({subject}){
    ensure_loaded({
      subject: subject,
      has_results: true,
    }).then( () => get_panels_for_subject(subject).then(
      (bubbles_for_subject) => this.setState({ bubble_menu_loading: false, bubbles_for_subject })
    ) );
  }
  loadGraphDeps({bubbles_for_subject, active_bubble_id, subject, level}){
    const panel_keys = get_panels_for_subj_bubble(bubbles_for_subject, active_bubble_id);
    ensure_loaded({
      panel_keys,
      subject_level: level,
      subject: subject,
      footnotes_for: subject,
    }).then( () => {
      if ( shallowEqualObjectsOverKeys({active_bubble_id, subject, level}, this.state, ['subject','active_bubble_id','level']) ){
        const panel_filter = _.chain(panel_keys)
          .map(panel_key => tables_for_panel(panel_key, subject.level))
          .flatten()
          .uniq()
          .reduce((result, table_id) => {
            result[table_id] = true;
            return result;
          }, {})
          .value();

        const total_number_of_panels = _.reduce(panel_keys, (count, panel_key) => {
          const panel_obj = PanelRegistry.lookup(panel_key, subject.level);
          const panel_filter_arr = _.map(panel_filter, (value, key) => panel_filter[key] && key);
          return _.intersection(panel_filter_arr, panel_obj.depends_on).length > 0 ? count + 1 : count;
        }, 0);
        
        this.setState({
          infographic_loading: false,
          panel_filter: panel_filter,
          total_number_of_panels: total_number_of_panels,
        });
      }
    });
  }
}

const is_fake_infographic = (subject) => !_.isUndefined(subject.is_fake) && subject.is_fake;
const Infographic = ({
  match: {
    params: {
      level, 
      subject_id, 
      active_bubble_id,
      options,
    },
  },
}) => {
  const SubjectModel = Subject[level];
  const subject = SubjectModel.lookup(subject_id);
  const bubble_id = bubble_defs[active_bubble_id] ? active_bubble_id : null;

  if ( is_fake_infographic(subject) ){
    const subject_parent = (
      () => {
        switch (level){
          case 'program':
            return subject.crso;
          case 'crso':
            return subject.dept;
          default: 
            return Subject.Gov;
        }
      }
    )();
    return <Redirect to={infograph_href_template(subject_parent, bubble_id, '/')} />;
  }
  
  const title = text_maker("infographic_for", {subject});
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
      <h1 dangerouslySetInnerHTML={{__html: title }} />
      <InfoGraph_
        level={level}
        subject={subject}
        active_bubble_id={bubble_id}
        options={options}
      />
    </StandardRouteContainer>
  );
};


export { Infographic as default };