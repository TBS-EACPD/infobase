import { Fragment } from "react";
import { withRouter } from "react-router";

import { AlertBanner, MultiColumnList } from "../components/index.js";
import { IconHome } from "../icons/icons.js";
import { index_lang_lookups } from "../InfoBase/index_data.js";

import { result_docs_in_tabling_order } from "../models/results.js";
import { Subject } from "../models/subject.js";
import { trivial_text_maker } from "../models/text.js";

import { log_page_view } from "./analytics.js";
import { reactAdapter } from "./reactAdapter.js";

import "./NavComponents.scss";

const {
  page_title: default_title,
  meta_description: default_description,
} = index_lang_lookups;

//note: This must be manually kept consistent with index.hbs.html
let is_initial_markup_cleared = false;

class DocumentTitle extends React.Component {
  render() {
    return null;
  }
  componentDidUpdate() {
    this._update();
  }
  componentDidMount() {
    this._update();
  }
  _update() {
    const { title_str } = this.props;

    const title = _.isEmpty(title_str)
      ? default_title[window.lang]
      : `${default_title[window.lang]} - ${title_str}`;

    document.getElementById("document-title").innerHTML = title;
  }
}

class DocumentDescription extends React.Component {
  render() {
    return null;
  }
  componentDidUpdate() {
    this._update();
  }
  componentDidMount() {
    this._update();
  }
  _update() {
    const { description_str } = this.props;
    let desc = description_str;
    if (_.isEmpty(description_str)) {
      desc = default_description[window.lang];
    }
    document.getElementById("document-description").content = desc;
  }
}

class BreadCrumbs extends React.Component {
  constructor() {
    super();
    //this is hacky, but we really need to make sure this stuff is only removed once.
    if (!is_initial_markup_cleared) {
      document.getElementById("breadcrumb-trail").innerHTML = "";
      is_initial_markup_cleared = true;
    }
  }
  render() {
    const { crumbs } = this.props;
    const content = (
      <ol className="breadcrumb">
        <li className="infobase-home-breadcrumb-link">
          <a href="#start" className="nav-item">
            <IconHome
              title={trivial_text_maker("title")}
              inline={true}
              aria_hide={true}
            />
            InfoBase
          </a>
        </li>
        {_.map(crumbs, (display, ix) => (
          <Fragment key={ix}>
            <li
              style={{
                position: "relative",
                top: "-3px",
                padding: "0px 15px",
                fontSize: "0.7em",
                fontFamily: "Glyphicons Halflings",
              }}
              aria-hidden="true"
            >
              {">"}
            </li>
            <li className="infobase-home-breadcrumb-link">
              {_.isString(display) ? ( //allow strings or react elements to be used here (note that some strings may have the weird french apostrophe that needs to non-escaped)
                <span dangerouslySetInnerHTML={{ __html: display }} />
              ) : (
                display
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    );

    return ReactDOM.createPortal(
      content,
      document.getElementById("breadcrumb-trail")
    );
  }
}

const HeaderBanner = withRouter(
  class HeaderBanner extends React.Component {
    render() {
      const {
        banner_content,
        banner_class,
        additional_class_names,
        route_filter,

        match,
        history,
      } = this.props;

      const banner_container = document.getElementById("banner-container");

      const should_show_banner =
        _.isFunction(route_filter) && route_filter(match, history);

      if (banner_container) {
        return ReactDOM.createPortal(
          <AlertBanner
            banner_class={banner_class}
            additional_class_names={additional_class_names}
            style={should_show_banner ? {} : { display: "none" }}
          >
            {banner_content}
          </AlertBanner>,
          banner_container
        );
      }
    }
  }
);

const TemporaryLateFTEsBanner = () => {
  const route_filter = (match, history) =>
    /^\/(start|tag-explorer|partition|treemap|rpb)/.test(match.path);

  const late_orgs = _.chain(result_docs_in_tabling_order)
    .filter(({ doc_type }) => doc_type === "drr")
    .last()
    .get("late_resources_orgs")
    .uniq()
    .value();
  const banner_content = (
    <Fragment>
      {
        {
          en:
            "The latest actual FTE values do not include values from the organizations listed below, as their data is not yet available. Updates will follow.",
          fr:
            "Dépenses planifiées des organisations ci-dessous ne sont pas encore disponibles. Des mises à jour suivront au fur et à mesure de la transmission de ces données.",
        }[window.lang]
      }
      <MultiColumnList
        list_items={_.map(
          late_orgs,
          (org_id) => Subject.Dept.lookup(org_id).name
        )}
        column_count={window.lang === "en" && late_orgs.length > 3 ? 2 : 1}
        li_class={late_orgs.length > 4 ? "font-small" : ""}
      />
    </Fragment>
  );

  return (
    late_orgs && (
      <HeaderBanner
        route_filter={route_filter}
        banner_content={banner_content}
        banner_class="warning"
        additional_class_names="medium-panel-text"
      />
    )
  );
};

export class StandardRouteContainer extends React.Component {
  componentDidMount() {
    //unless a route's component is sufficiently complicated, it should never unmount/remount a StandardRouteContainer
    //therefore, this component being unmounts/remounted implies a change between routes, which should always re-scroll
    window.scrollTo(0, 0);
  }
  render() {
    const {
      description,
      title,
      breadcrumbs,
      route_key,
      children,
      shouldSyncLang,
      non_a11y_route,
      beta,
    } = this.props;

    return (
      <div>
        <DocumentTitle title_str={title} />
        <DocumentDescription description_str={description} />
        <BreadCrumbs crumbs={breadcrumbs} />
        <HeaderBanner route_filter={_.constant(false)} />
        <TemporaryLateFTEsBanner />
        {beta && (
          <HeaderBanner
            route_filter={_.constant(true)}
            banner_content={trivial_text_maker("beta_banner_content")}
            banner_class="info"
            additional_class_names="beta-banner"
          />
        )}
        <AnalyticsSynchronizer route_key={route_key} />
        {shouldSyncLang !== false && <LangSynchronizer />}
        {!window.is_a11y_mode && (
          <A11yLinkSynchronizer non_a11y_route={non_a11y_route} />
        )}
        {window.is_a11y_mode && <StandardLinkSynchronizer />}
        <div>{children}</div>
      </div>
    );
  }
}

export class ScrollToTargetContainer extends React.Component {
  scrollToItem() {
    const { target_id } = this.props;

    if (!_.isEmpty(target_id) && target_id !== "__") {
      var el = document.querySelector("#" + target_id);
      if (el) {
        setTimeout(() => {
          scrollTo(0, el.offsetTop);
          el.focus();
        });
      }
    }
  }
  componentDidMount() {
    this.scrollToItem();
  }
  componentDidUpdate() {
    this.scrollToItem();
  }
  render() {
    const { children } = this.props;

    return children;
  }
}

class AnalyticsSynchronizer extends React.Component {
  render() {
    return null;
  }
  componentDidUpdate() {
    this._update();
  }
  componentDidMount() {
    this._update();
  }
  shouldComponentUpdate(nextProps) {
    return this.props.route_key !== nextProps.route_key;
  }
  _update() {
    log_page_view(this.props.route_key);
  }
}

const synchronize_link = (target_el_selector, link_modifier_func) => {
  //TODO: probabbly being too defensive here
  const el_to_update = document.querySelector(target_el_selector);
  let newHash = _.isFunction(link_modifier_func)
    ? link_modifier_func(document.location.hash)
    : document.location.hash;
  newHash = newHash.split("#")[1] || "";

  if (_.get(el_to_update, "href")) {
    const link = _.first(el_to_update.href.split("#"));
    if (link) {
      el_to_update.href = `${link}#${newHash}`;
    }
  }
};

export const LangSynchronizer = withRouter(
  class LangSynchronizer extends React.Component {
    render() {
      return null;
    }
    componentDidUpdate() {
      this._update();
    }
    componentDidMount() {
      this._update();
    }
    _update() {
      const { lang_modifier } = this.props;
      synchronize_link("#wb-lng a", lang_modifier);
    }
  }
);

export const A11yLinkSynchronizer = withRouter(
  class LangSynchronizer extends React.Component {
    render() {
      return null;
    }
    componentDidUpdate() {
      this._update();
    }
    componentDidMount() {
      this._update();
    }
    _update() {
      let { non_a11y_route, a11y_link_modifier } = this.props;

      if (non_a11y_route) {
        a11y_link_modifier = () => "#start/no_basic_equiv";
      }

      synchronize_link(
        "#ib-site-header a.a11y-version-link",
        a11y_link_modifier
      );
      synchronize_link("#footer-a11y-link", a11y_link_modifier);
    }
  }
);

export const StandardLinkSynchronizer = withRouter(
  class LangSynchronizer extends React.Component {
    render() {
      return null;
    }
    componentDidUpdate() {
      this._update();
    }
    componentDidMount() {
      this._update();
    }
    _update() {
      let { standard_link_modifier } = this.props;

      const default_standard_link_modifier = (hash) =>
        hash === "start/no_basic_equiv" ? "start" : hash;

      synchronize_link(
        "#footer-standard-link",
        standard_link_modifier || default_standard_link_modifier
      );
    }
  }
);

export const ReactUnmounter = withRouter(
  class ReactUnmounter_ extends React.Component {
    render() {
      return null;
    }
    componentDidUpdate(prevProps) {
      if (prevProps.location.pathname !== this.props.location.pathname) {
        reactAdapter.unmountAll();
      }
    }
  }
);
