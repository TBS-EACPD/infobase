import _ from "lodash";
import React, { Fragment } from "react";
import ReactDOM from "react-dom";
import { withRouter } from "react-router";

import { AlertBanner } from "src/components/AlertBanner/AlertBanner";
import { MultiColumnList } from "src/components/misc_util_components";

import { PRE_DRR_PUBLIC_ACCOUNTS_LATE_FTE_MOCK_DOC } from "src/models/footnotes/dynamic_footnotes";
import { result_docs_in_tabling_order } from "src/models/results";
import { Dept } from "src/models/subjects";
import { trivial_text_maker } from "src/models/text";

import { lang, is_a11y_mode } from "src/core/injected_build_constants";

import { IconHome } from "src/icons/icons";

import { index_lang_lookups } from "src/InfoBase/index_data";

import { log_page_view } from "./analytics";

import "./NavComponents.scss";

const { page_title: default_title, meta_description: default_description } =
  index_lang_lookups;

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
      ? default_title[lang]
      : `${default_title[lang]} - ${title_str}`;

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
      desc = default_description[lang];
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
          <a href="#start">
            <IconHome
              aria_label={trivial_text_maker("title")}
              inline={true}
              aria_hide={true}
            />
            {trivial_text_maker("title")}
          </a>
        </li>
        {_.map(crumbs, (display, ix) => (
          <Fragment key={ix}>
            <li className="infobase-home-breadcrumb-link">
              <span aria-hidden={true} style={{ padding: "0px 15px" }}>
                {">"}
              </span>
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

// TODO all three of these late results banners are hacky AND aren't dry against dynamic footnote content/infographic warning panels
// whole late results ecosystem needs a cleanup
const LateResultsBanner = () => {
  const route_filter = (match, _history) => /^\/(start|diff)/.test(match.path);

  // TODO what if DPs table and some DRRs are still late? Do we just want the prominent DRR banner, or do we want both?
  const latest_doc = _.last(result_docs_in_tabling_order);

  const late_orgs = latest_doc.late_results_orgs;

  if (late_orgs.length === 0) {
    return null;
  }

  const banner_content = (
    <Fragment>
      {
        {
          en: `The ${latest_doc.name} data does not include values from the organizations listed below, as their data is not yet available. Updates will follow.`,
          fr: `Les données du ${latest_doc.name} des organisations ci-dessous ne sont pas encore disponibles. Des mises à jour suivront au fur et à mesure de la transmission de ces données.`,
        }[lang]
      }
      <MultiColumnList
        list_items={_.map(
          late_orgs,
          (org_id) => Dept.store.lookup(org_id).name
        )}
        column_count={2}
      />
    </Fragment>
  );

  return (
    <HeaderBanner
      route_filter={route_filter}
      banner_content={banner_content}
      banner_class="warning"
      additional_class_names="medium-panel-text"
    />
  );
};
const LateDpResourcesBanner = () => {
  const route_filter = (match, _history) =>
    /^\/(start|tag-explorer|treemap|rpb)/.test(match.path);

  const latest_doc = _.last(result_docs_in_tabling_order);

  const late_orgs = latest_doc.late_resources_orgs;

  if (!latest_doc.is_dp || late_orgs.length === 0) {
    return null;
  }

  const banner_content = (
    <Fragment>
      {
        {
          en: `Planned spending and planned FTE data does not include values from the organizations listed below, as their data is not yet available. Updates will follow.`,
          fr: `Dépenses planifiées des organisations ci-dessous ne sont pas encore disponibles. Des mises à jour suivront au fur et à mesure de la transmission de ces données.`,
        }[lang]
      }
      <MultiColumnList
        list_items={_.map(
          late_orgs,
          (org_id) => Dept.store.lookup(org_id).name
        )}
        column_count={2}
      />
    </Fragment>
  );

  return (
    <HeaderBanner
      route_filter={route_filter}
      banner_content={banner_content}
      banner_class="warning"
      additional_class_names="medium-panel-text"
    />
  );
};
const LateDrrFteResources = () => {
  const route_filter = (match, _history) =>
    /^\/(start|tag-explorer|treemap|rpb)/.test(match.path);

  const late_orgs =
    PRE_DRR_PUBLIC_ACCOUNTS_LATE_FTE_MOCK_DOC.late_resources_orgs;

  if (late_orgs.length === 0) {
    return null;
  }

  const banner_content = (
    <Fragment>
      {
        {
          en: "The latest actual FTE values do not include values from the organizations listed below, as their data is not yet available. Updates will follow.",
          fr: "Dépenses planifiées des organisations ci-dessous ne sont pas encore disponibles. Des mises à jour suivront au fur et à mesure de la transmission de ces données.",
        }[lang]
      }
      <MultiColumnList
        list_items={_.map(
          late_orgs,
          (org_id) => Dept.store.lookup(org_id).name
        )}
        column_count={2}
      />
    </Fragment>
  );

  return (
    <HeaderBanner
      route_filter={route_filter}
      banner_content={banner_content}
      banner_class="warning"
      additional_class_names="medium-panel-text"
    />
  );
};

export class StandardRouteContainer extends React.Component {
  componentDidMount() {
    //unless a route's component is sufficiently complicated, it should never unmount/remount a StandardRouteContainer
    //therefore, this component being unmounted/remounted implies a change between routes, which should always re-scroll
    scroll_to_top();
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
    } = this.props;

    return (
      <div>
        <DocumentTitle title_str={title} />
        <DocumentDescription description_str={description} />
        <BreadCrumbs crumbs={breadcrumbs} />
        <HeaderBanner route_filter={_.constant(false)} />
        <LateResultsBanner />
        <LateDpResourcesBanner />
        <LateDrrFteResources />
        <AnalyticsSynchronizer route_key={route_key} />
        {shouldSyncLang !== false && <LangSynchronizer />}
        {!is_a11y_mode && (
          <A11yLinkSynchronizer non_a11y_route={non_a11y_route} />
        )}
        {is_a11y_mode && <StandardLinkSynchronizer />}
        <div>{children}</div>
      </div>
    );
  }
}

export const scroll_into_view_and_focus = (
  element,
  scroll_into_view_options = {}
) => {
  const original_tabindex = element.getAttribute("tabindex");

  element.setAttribute("tabindex", "-1");

  const reset_tabindex = function () {
    if (_.isNull(original_tabindex)) {
      this.removeAttribute("tabindex");
    } else {
      this.setAttribute("tabindex", original_tabindex);
    }
    this.removeEventListener("blur", reset_tabindex);
  };
  element.addEventListener("blur", reset_tabindex);

  element.scrollIntoView(scroll_into_view_options);
  element.focus();
};

export const scroll_to_top = (
  top_element = document.getElementById("ib-site-header-area"),
  behaviour = "auto"
) =>
  scroll_into_view_and_focus(top_element, {
    behaviour,
    block: "start",
    inline: "nearest",
  });

export class ScrollToTargetContainer extends React.Component {
  scrollToItem() {
    const { target_id } = this.props;

    if (!_.isEmpty(target_id) && target_id !== "__") {
      var el = document.querySelector("#" + target_id);
      if (el) {
        setTimeout(() => scroll_into_view_and_focus(el));
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
