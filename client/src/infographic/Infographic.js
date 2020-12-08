import { Redirect } from "react-router";

import "./Infographic.scss";

import {
  create_text_maker_component,
  SpinnerWrapper,
  AdvancedSearch,
} from "../components/index.js";
import { log_standard_event } from "../core/analytics.js";

import { ensure_loaded } from "../core/ensure_loaded.js";
import { StandardRouteContainer } from "../core/NavComponents";
import { shallowEqualObjectsOverKeys, SafeJSURL } from "../general_utils.js";
import { Subject } from "../models/subject.js";

import { get_panels_for_subject } from "../panels/get_panels_for_subject/index.js";
import { PanelRenderer } from "../panels/PanelRenderer.js";

import { bubble_defs } from "./bubble_definitions.js";
import { BubbleMenu } from "./BubbleMenu.js";

import { infograph_href_template } from "./infographic_link.js";

import text from "./Infographic.yaml";

const sub_app_name = "infographic_org";

const { text_maker, TM } = create_text_maker_component(text);

class AnalyticsSynchronizer extends React.Component {
  render() {
    return null;
  }
  componentDidMount() {
    this._logAnalytics();
  }
  componentDidUpdate() {
    this._logAnalytics();
  }

  shouldComponentUpdate(nextProps) {
    return !shallowEqualObjectsOverKeys(this.props, nextProps, [
      "subject",
      "active_bubble_id",
      "level",
    ]);
  }

  _logAnalytics() {
    const {
      active_bubble_id,
      level,
      subject: { guid },
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

function reset_scroll() {
  window.scrollTo(0, 0);
}

class InfoGraph_ extends React.Component {
  constructor(props) {
    super();
    this.state = {
      bubble_menu_loading: true,
      infographic_loading: true,
      subject: props.subject,
      subject_panels_by_bubble_id: {},
      active_bubble_id: props.active_bubble_id,
      level: props.level,
    };
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    const should_reload_bubble_menu_dependencies = !shallowEqualObjectsOverKeys(
      nextProps,
      prevState,
      ["subject", "active_bubble_id", "level"]
    );

    const should_reload_panel_dependencies =
      !prevState.bubble_menu_loading && prevState.infographic_loading;

    if (should_reload_bubble_menu_dependencies) {
      return {
        bubble_menu_loading: true,
        infographic_loading: true,
        subject: nextProps.subject,
        subject_panels_by_bubble_id: {},
        active_bubble_id: nextProps.active_bubble_id,
        level: nextProps.level,
      };
    } else if (should_reload_panel_dependencies) {
      const { subject_panels_by_bubble_id, subject } = prevState;
      const { active_bubble_id } = nextProps;

      const subject_bubble_defs = _.chain(bubble_defs)
        .filter(({ id }) =>
          _.chain(subject_panels_by_bubble_id).keys().includes(id).value()
        )
        .map((bubble_def) =>
          _.mapValues(bubble_def, (bubble_option) =>
            _.isFunction(bubble_option) ? bubble_option(subject) : bubble_option
          )
        )
        .value();

      const active_index = _.findIndex(subject_bubble_defs, {
        id: active_bubble_id,
      });
      const next_bubble = subject_bubble_defs[active_index + 1];
      const previous_bubble = subject_bubble_defs[active_index - 1];

      const panel_keys = subject_panels_by_bubble_id[active_bubble_id];

      return {
        subject_bubble_defs,
        previous_bubble,
        next_bubble,
        panel_keys,
        infographic_loading: true,
      };
    } else {
      return null;
    }
  }
  componentDidMount() {
    this.loadBubbleMenuDeps(this.props);
  }
  componentDidUpdate(prevProps) {
    const {
      bubble_menu_loading,
      infographic_loading,
      active_bubble_id,
      panel_keys,
    } = this.state;

    if (bubble_menu_loading) {
      this.loadBubbleMenuDeps(this.props);
    } else if (infographic_loading) {
      this.loadGraphDeps({ ...this.state, ...this.props });
    } else if (!_.isNull(active_bubble_id)) {
      if (this.props.subject !== prevProps.subject) {
        reset_scroll();
      }
      const options = SafeJSURL.parse(this.props.options);

      const linked_to_panel =
        options &&
        options.panel_key &&
        _.includes(panel_keys, options.panel_key) &&
        document.querySelector(`#${options.panel_key}`);

      if (linked_to_panel) {
        linked_to_panel.scrollIntoView();
        linked_to_panel.focus();
      }
    }
  }

  render() {
    const { subject, active_bubble_id } = this.props;
    const {
      bubble_menu_loading,
      infographic_loading,
      subject_bubble_defs,
      panel_keys,
      previous_bubble,
      next_bubble,
    } = this.state;

    const loading = bubble_menu_loading || infographic_loading;

    const search_component = (
      <AdvancedSearch
        everything_search_config={{
          href_template: (subj) =>
            infograph_href_template(subj, active_bubble_id, "/"),
          search_text: text_maker("subject_search_placeholder"),
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
      />
    );

    return (
      <div>
        <AnalyticsSynchronizer {...this.props} />
        {window.is_a11y_mode && (
          <div>
            <TM k="a11y_search_other_infographs" />
            {search_component}
          </div>
        )}
        {!window.is_a11y_mode && (
          <div className="row infographic-search-container">
            {search_component}
          </div>
        )}
        <div>
          <div>
            {loading && <SpinnerWrapper config_name={"route"} />}
            {!loading && (
              <BubbleMenu
                items={subject_bubble_defs}
                active_item_id={active_bubble_id}
              />
            )}
          </div>
        </div>
        <div role="main" aria-label={text_maker("main_infographic_content")}>
          {window.is_a11y_mode && (
            <p
              id="infographic-explanation-focus"
              aria-live="polite"
              tabIndex={0}
            >
              {loading
                ? "Loading..."
                : text_maker("a11y_infograph_description")}
            </p>
          )}
          {!loading &&
            _.map(panel_keys, (panel_key) => (
              <PanelRenderer
                panel_key={panel_key}
                subject={subject}
                active_bubble_id={active_bubble_id}
                key={panel_key + subject.guid}
              />
            ))}
        </div>
        {!_.isEmpty(active_bubble_id) && (
          <div className="row medium-panel-text">
            <div className="previous_and_next_bubble_link_row">
              {previous_bubble ? (
                <a
                  className="previous_bubble_link btn-lg btn-ib-primary"
                  href={infograph_href_template(subject, previous_bubble.id)}
                  onClick={reset_scroll}
                  style={{ textDecoration: "none" }}
                >
                  {`←  ${previous_bubble.title}`}
                </a>
              ) : (
                <a style={{ visibility: "hidden" }}></a>
              )}
              {next_bubble ? (
                <a
                  className="next_bubble_link btn-lg btn-ib-primary"
                  href={infograph_href_template(subject, next_bubble.id)}
                  onClick={reset_scroll}
                  style={{ textDecoration: "none" }}
                >
                  {`${next_bubble.title}  →`}
                </a>
              ) : (
                <a style={{ visibility: "hidden" }}></a>
              )}
            </div>
            <div className="clearfix" />
          </div>
        )}
      </div>
    );
  }

  loadBubbleMenuDeps({ subject }) {
    ensure_loaded({
      subject: subject,
      has_results: true,
    }).then(() =>
      get_panels_for_subject(subject).then((subject_panels_by_bubble_id) =>
        this.setState({
          bubble_menu_loading: false,
          subject_panels_by_bubble_id,
        })
      )
    );
  }
  loadGraphDeps({ panel_keys, active_bubble_id, subject, level }) {
    ensure_loaded({
      panel_keys,
      subject_level: level,
      subject: subject,
      footnotes_for: subject,
    }).then(() => {
      if (
        shallowEqualObjectsOverKeys(
          { active_bubble_id, subject, level },
          this.state,
          ["subject", "active_bubble_id", "level"]
        )
      ) {
        this.setState({
          infographic_loading: false,
        });
      }
    });
  }
}

const is_fake_infographic = (subject) =>
  !_.isUndefined(subject.is_fake) && subject.is_fake;
const Infographic = ({
  match: {
    params: { level, subject_id, active_bubble_id, options },
  },
}) => {
  const SubjectModel = Subject[level];
  const subject = SubjectModel.lookup(subject_id);
  const bubble_id = _.find(bubble_defs, { id: active_bubble_id })
    ? active_bubble_id
    : null;

  if (is_fake_infographic(subject)) {
    const subject_parent = (() => {
      switch (level) {
        case "program":
          return subject.crso;
        case "crso":
          return subject.dept;
        default:
          return Subject.Gov;
      }
    })();
    return (
      <Redirect to={infograph_href_template(subject_parent, bubble_id, "/")} />
    );
  }

  const title = text_maker("infographic_for", { subject });
  const desc_key = {
    financial: "finance_infograph_desc_meta_attr",
    people: "ppl_infograph_desc_meta_attr",
    results: "results_infograph_desc_meta_attr",
  }[bubble_id];
  return (
    <StandardRouteContainer
      title={title}
      breadcrumbs={[title]}
      description={desc_key && text_maker(desc_key)}
      route_key={sub_app_name}
    >
      <h1 dangerouslySetInnerHTML={{ __html: title }} />
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
