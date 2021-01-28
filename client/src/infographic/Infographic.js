import _ from "lodash";
import React from "react";
import { Redirect } from "react-router";

import { is_a11y_mode } from "src/core/injected_build_constants.js";

import {
  create_text_maker_component,
  SpinnerWrapper,
} from "../components/index.js";
import { log_standard_event } from "../core/analytics.js";
import { ensure_loaded } from "../core/lazy_loader.js";
import { StandardRouteContainer } from "../core/NavComponents";
import { redirect_with_msg } from "../core/RedirectHeader.js";
import { shallowEqualObjectsOverKeys, SafeJSURL } from "../general_utils.js";
import { Subject } from "../models/subject.js";

import { get_panels_for_subject } from "../panels/get_panels_for_subject/index.js";
import { PanelRegistry } from "../panels/PanelRegistry.js";
import { PanelRenderer } from "../panels/PanelRenderer.js";
import { AdvancedSearch } from "../search/index.js";

import { bubble_defs } from "./bubble_definitions.js";
import { BubbleMenu } from "./BubbleMenu.js";

import { infograph_href_template } from "./infographic_link.js";

import PanelFilterControl from "./PanelFilterControl.js";

import text from "./Infographic.yaml";
import "./Infographic.scss";

const sub_app_name = "infographic_org";

const { text_maker, TM } = create_text_maker_component(text);
const { Dept, Gov } = Subject;

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

const get_default_state_from_props = ({
  subject,
  active_bubble_id,
  level,
}) => ({
  subject,
  active_bubble_id,
  level,
  loading: true,
  panel_filter: _.identity,
  subject_bubble_defs: null,
  valid_panel_keys: null,
  previous_bubble: null,
  next_bubble: null,
});
class InfoGraph_ extends React.Component {
  constructor(props) {
    super();
    this.state = get_default_state_from_props(props);
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    const should_reload = !shallowEqualObjectsOverKeys(nextProps, prevState, [
      "subject",
      "active_bubble_id",
      "level",
    ]);

    if (should_reload) {
      return get_default_state_from_props(nextProps);
    } else {
      return null;
    }
  }
  componentDidMount() {
    this.load({ ...this.state, ...this.props });
  }
  componentDidUpdate(prevProps) {
    const { loading, active_bubble_id, valid_panel_keys } = this.state;

    if (loading) {
      this.load({ ...this.state, ...this.props });
    } else if (!_.isNull(active_bubble_id)) {
      if (this.props.subject !== prevProps.subject) {
        reset_scroll();
      }

      const options = (() => {
        try {
          return SafeJSURL.parse(this.props.options);
        } catch {
          log_standard_event({
            SUBAPP: window.location.hash.replace("#", ""),
            MISC1: "ERROR_IN_JSURL_PARSE",
            MISC2: this.props.options,
          });
          return false;
        }
      })();

      const linked_to_panel =
        options &&
        options.panel_key &&
        _.includes(valid_panel_keys, options.panel_key) &&
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
      loading,
      subject_bubble_defs,
      valid_panel_keys,
      previous_bubble,
      next_bubble,
      panel_filter,
    } = this.state;

    const filtered_panel_keys = panel_filter(valid_panel_keys);

    return (
      <div>
        <AnalyticsSynchronizer {...this.props} />
        {is_a11y_mode && (
          <div>
            <TM k="a11y_search_other_infographs" />
            <AdvancedSearch />
          </div>
        )}
        {!is_a11y_mode && (
          <div className="row infographic-search-container">
            <AdvancedSearch />
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
          {is_a11y_mode && (
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
            _.find(subject_bubble_defs, {
              id: active_bubble_id,
              enable_panel_filter: true,
            }) && (
              <PanelFilterControl
                subject={subject}
                panel_keys={valid_panel_keys}
                set_panel_filter={(panel_filter) =>
                  this.setState({ panel_filter })
                }
              />
            )}
          {!loading &&
            _.map(filtered_panel_keys, (panel_key) => (
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
  load({ subject, level, active_bubble_id }) {
    return get_panels_for_subject(subject).then(
      (subject_panels_by_bubble_id) => {
        const subject_bubble_defs = _.chain(bubble_defs)
          .filter(({ id }) =>
            _.chain(subject_panels_by_bubble_id).keys().includes(id).value()
          )
          .map((bubble_def) =>
            _.mapValues(bubble_def, (bubble_option) =>
              _.isFunction(bubble_option)
                ? bubble_option(subject)
                : bubble_option
            )
          )
          .value();

        const common_new_state = {
          loading: false,
          subject_bubble_defs,
        };

        if (!_.has(subject_panels_by_bubble_id, active_bubble_id)) {
          this.setState({
            ...common_new_state,
            next_bubble: null,
            previous_bubble: null,
            valid_panel_keys: null,
          });
        } else {
          const potential_panel_keys =
            subject_panels_by_bubble_id[active_bubble_id];

          return ensure_loaded({
            panel_keys: potential_panel_keys,
            subject_level: level,
            subject: subject,
            footnotes_for: subject,
          }).then(() => {
            const active_index = _.findIndex(subject_bubble_defs, {
              id: active_bubble_id,
            });
            const next_bubble = subject_bubble_defs[active_index + 1];
            const previous_bubble = subject_bubble_defs[active_index - 1];

            const valid_panel_keys = _.filter(
              potential_panel_keys,
              (panel_key) =>
                PanelRegistry.lookup(
                  panel_key,
                  level
                ).is_panel_valid_for_subject(subject)
            );

            this.setState({
              ...common_new_state,
              next_bubble,
              previous_bubble,
              valid_panel_keys,
            });
          });
        }
      }
    );
  }
}

const is_fake_infographic = (subject) =>
  !_.isUndefined(subject.is_fake) && subject.is_fake;
const Infographic = ({
  match: {
    params: { level, subject_id, active_bubble_id, options },
  },
}) => {
  const is_level_valid = _.chain(Subject).keys().includes(level).value();
  if (!is_level_valid) {
    return redirect_with_msg(
      text_maker("invalid_redirect_home", { param: level }),
      "#home"
    );
  }

  const SubjectModel = Subject[level];
  const subject = SubjectModel.lookup(subject_id);
  const bubble_id = _.find(bubble_defs, { id: active_bubble_id })
    ? active_bubble_id
    : null;

  if (!subject) {
    if (level === "program" || level === "crso") {
      const potential_parent_dept_code = _.split(subject_id, "-")[0];
      const parent_dept = Dept.lookup(potential_parent_dept_code);
      if (parent_dept) {
        return redirect_with_msg(
          text_maker("invalid_subject_redirect_parent_dept", {
            subject_id,
            potential_parent_dept_code,
          }),
          `#orgs/dept/${parent_dept.id}/infograph/intro`
        );
      }
    }
    return redirect_with_msg(
      text_maker("invalid_redirect_home", { param: subject_id }),
      "#home"
    );
  } else if (is_fake_infographic(subject)) {
    const subject_parent = (() => {
      switch (level) {
        case "program":
          return subject.crso;
        case "crso":
          return subject.dept;
        default:
          return Gov;
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
