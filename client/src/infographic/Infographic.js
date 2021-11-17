import _ from "lodash";
import React from "react";
import { Redirect } from "react-router";

import { get_panels_for_subject } from "src/panels/get_panels_for_subject/index";

import { PanelRegistry } from "src/panels/PanelRegistry";
import { PanelRenderer } from "src/panels/PanelRenderer";

import { create_text_maker_component, LeafSpinner } from "src/components/index";

import { set_pinned_content_local_storage } from "src/components/PinnedContent/PinnedContent";
import { SOME_THINGS_TO_KEEP_IN_MIND_STORAGE_KEY } from "src/components/PinnedFAQ/PinnedFAQ";

import {
  Gov,
  Dept,
  subject_types,
  get_subject_by_guid,
} from "src/models/subjects";

import { log_standard_event } from "src/core/analytics";
import { ensure_loaded } from "src/core/ensure_loaded";
import { is_a11y_mode } from "src/core/injected_build_constants";
import { StandardRouteContainer } from "src/core/NavComponents";
import { redirect_with_msg } from "src/core/RedirectHeader";

import { shallowEqualObjectsOverKeys, SafeJSURL } from "src/general_utils";

import { EverythingSearch } from "src/search/EverythingSearch";

import { get_bubble_defs } from "./bubble_definitions";
import { BubbleMenu } from "./BubbleMenu";

import { infograph_href_template } from "./infographic_link";

import PanelFilterControl from "./PanelFilterControl";
import TableOfContents from "./TableOfContents";

import text from "./Infographic.yaml";
import "./Infographic.scss";

const sub_app_name = "infographic_org";

const { text_maker } = create_text_maker_component(text);

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
      "subject_type",
    ]);
  }

  _logAnalytics() {
    const {
      active_bubble_id,
      subject_type,
      subject: { guid },
    } = this.props;

    log_standard_event;

    log_standard_event({
      SUBAPP: sub_app_name,
      SUBJECT_GUID: guid,
      MISC1: subject_type,
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
  subject_type,
}) => ({
  subject,
  active_bubble_id,
  subject_type,
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
      "subject_type",
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
    const { loading, active_bubble_id } = this.state;

    if (loading) {
      this.load({ ...this.state, ...this.props });
    } else if (!_.isNull(active_bubble_id)) {
      if (this.props.subject !== prevProps.subject) {
        reset_scroll();
      }

      const options = SafeJSURL.parse(this.props.options);

      options &&
        options.panel_key &&
        this.scroll_to_panel_when_all_loading_done(options.panel_key);
    }
  }
  scroll_to_panel_when_all_loading_done = _.debounce((panel_key) => {
    // Stop-gap to make sure linking to panel is resilient to some panels managing their own
    // internal loading. Otherwise, infographic could scroll to a panel and then promptly have
    // another panel above it finish it's own internal loading, re-render with content, and shift the content
    // to push the linked to panel out of view again...
    // TODO this shouldn't be necessary/should be made less hacky durring the full GraphQL rewrite

    const something_is_loading = !_.isNull(
      document.querySelector(".leaf-spinner")
    );

    if (something_is_loading) {
      this.scroll_to_panel_when_all_loading_done(panel_key);
    } else {
      const linked_to_panel = document.querySelector(`#${panel_key}`);

      if (linked_to_panel) {
        // the standard pinned SomeThingsToKeepInMind covers up panel titles when scrolling to them, disabling it to avoid that
        set_pinned_content_local_storage(
          SOME_THINGS_TO_KEEP_IN_MIND_STORAGE_KEY,
          false
        );

        linked_to_panel.scrollIntoView();
        linked_to_panel.focus();
      }
    }
  }, 100);
  componentWillUnmount() {
    this.scroll_to_panel_when_all_loading_done.cancel();
  }
  render() {
    const { subject, active_bubble_id, url_replace } = this.props;
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
        <div className="infographic-search-container">
          <EverythingSearch
            href_template={this.search_href_template}
            initial_search_options={{
              include_orgs_normal_data: true,
              include_orgs_limited_data: true,
              include_services: true,
              include_crsos: true,
              include_programs: true,
              include_tags_goco: true,
              include_tags_hwh: true,
              include_tags_wwh: true,
            }}
          />
        </div>
        <div>
          <div>
            {loading && <LeafSpinner config_name={"route"} />}
            {!loading && (
              <BubbleMenu
                items={subject_bubble_defs}
                active_item_id={active_bubble_id}
              />
            )}
          </div>
        </div>
        <div aria-label={text_maker("main_infographic_content")}>
          {is_a11y_mode && (
            <p id="infographic-explanation-focus" aria-live="polite">
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
                set_panel_filter={(panel_filter) => {
                  url_replace(
                    _.replace(
                      infograph_href_template(subject, active_bubble_id),
                      "#",
                      "/"
                    )
                  );
                  this.setState({ panel_filter });
                }}
              />
            )}
          <TableOfContents
            panel_titles_by_key={_.chain(filtered_panel_keys)
              .map((panel_key) =>
                PanelRegistry.lookup(panel_key, subject.subject_type)
              )
              .filter((panel) => !panel.is_static)
              .map((panel) => [panel.key, panel.get_title(subject)])
              .fromPairs()
              .value()}
            scroll_to_panel_when_all_loading_done={
              this.scroll_to_panel_when_all_loading_done
            }
          />
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
                  className="previous_bubble_link btn btn-lg btn-ib-primary"
                  href={infograph_href_template(subject, previous_bubble.id)}
                  onClick={reset_scroll}
                  style={{ textDecoration: "none" }}
                >
                  {`←  ${previous_bubble.title}`}
                </a>
              ) : (
                <div></div>
              )}
              {next_bubble ? (
                <a
                  className="next_bubble_link btn btn-lg btn-ib-primary"
                  href={infograph_href_template(subject, next_bubble.id)}
                  onClick={reset_scroll}
                  style={{ textDecoration: "none" }}
                >
                  {`${next_bubble.title}  →`}
                </a>
              ) : (
                <div></div>
              )}
            </div>
            <div className="clearfix" />
          </div>
        )}
      </div>
    );
  }
  load({ subject, subject_type, active_bubble_id }) {
    return get_panels_for_subject(subject).then(
      (subject_panels_by_bubble_id) => {
        const subject_bubble_defs = _.filter(
          get_bubble_defs(subject),
          ({ id }) =>
            _.chain(subject_panels_by_bubble_id).keys().includes(id).value()
        );

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
            subject_type,
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
                  subject_type
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
  search_href_template = (selected_subject) =>
    infograph_href_template(selected_subject, this.props.active_bubble_id, "/");
}

const is_fake_infographic = (subject) =>
  !_.isUndefined(subject.is_fake) && subject.is_fake;
const Infographic = ({
  match: {
    params: { subject_type, subject_id, active_bubble_id, options },
  },
  history: { replace },
}) => {
  if (!_.includes(subject_types, subject_type)) {
    return redirect_with_msg(
      text_maker("invalid_redirect_home", { param: subject_type }),
      "#home"
    );
  }

  const subject = (() => {
    try {
      return get_subject_by_guid(`${subject_type}_${subject_id}`);
    } catch {
      return false;
    }
  })();

  if (!subject) {
    if (subject_type === "program" || subject_type === "crso") {
      const potential_parent_dept_code = _.split(subject_id, "-")[0];
      const has_parent_dept = Dept.store.has(potential_parent_dept_code);
      if (has_parent_dept) {
        const parent_dept = Dept.store.lookup(potential_parent_dept_code);
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
      switch (subject_type) {
        case "program":
          return subject.crso;
        case "crso":
          return subject.dept;
        default:
          return Gov.instance;
      }
    })();

    return (
      <Redirect
        to={infograph_href_template(subject_parent, active_bubble_id, "/")}
      />
    );
  }

  const bubble_id = _.find(get_bubble_defs(subject), { id: active_bubble_id })
    ? active_bubble_id
    : null;

  const title = text_maker("infographic_for", { subject });
  const breadcrumbs = (() => {
    const get_breadcrumbs = (parent_subjects) =>
      _.chain(parent_subjects)
        .map((parent_subj) => (
          <a
            href={infograph_href_template(parent_subj, active_bubble_id)}
            key={parent_subj.id}
          >
            {parent_subj.name}
          </a>
        ))
        .concat(subject.name)
        .value();
    switch (subject_type) {
      case "dept": {
        return get_breadcrumbs([Gov.instance]);
      }
      case "crso": {
        return get_breadcrumbs([Gov.instance, subject.dept]);
      }
      case "program": {
        return get_breadcrumbs([Gov.instance, subject.dept, subject.crso]);
      }
      default: {
        return [subject.name];
      }
    }
  })();
  const desc_key = {
    financial: "finance_infograph_desc_meta_attr",
    people: "ppl_infograph_desc_meta_attr",
    results: "results_infograph_desc_meta_attr",
  }[bubble_id];
  return (
    <StandardRouteContainer
      title={title}
      breadcrumbs={breadcrumbs}
      description={desc_key && text_maker(desc_key)}
      route_key={sub_app_name}
    >
      <h1 dangerouslySetInnerHTML={{ __html: title }} />
      <InfoGraph_
        subject_type={subject_type}
        subject={subject}
        active_bubble_id={bubble_id}
        options={options}
        url_replace={replace}
      />
    </StandardRouteContainer>
  );
};

export { Infographic as default };
