import { Fragment } from 'react'
import withRouter from 'react-router/withRouter';
import { reactAdapter } from './reactAdapter.js';
import { log_page_view, log_standard_event } from './analytics.js';
import { get_static_url, make_request } from './request_utils.js';
import { index_lang_lookups } from '../InfoBase/index_data.js';


const { page_title: default_title, meta_description: default_description } = index_lang_lookups;

//note: This must be manually kept consistent with index.hbs.html
let is_initial_markup_cleared = false;


class DocumentTitle extends React.Component {
  render(){ return null; }
  componentDidUpdate(){ this._update(); }
  componentDidMount(){ this._update(); }
  _update(){
    const { title_str } = this.props;

    const title = (
      _.isEmpty(title_str) ? 
      default_title[window.lang] : 
      `${default_title[window.lang]} - ${title_str}`
    );

    document.getElementById("document-title").innerHTML = title;
  }
}

class DocumentDescription extends React.Component {
  render(){ return null; }
  componentDidUpdate(){ this._update(); }
  componentDidMount(){ this._update(); }
  _update(){

    const { description_str } = this.props;
    let desc = description_str;
    if(_.isEmpty(description_str)){
      desc = default_description[window.lang];
    }
    document.getElementById("document-description").content = desc;
    
  }
}

class BreadCrumbs extends React.Component {
  constructor(){
    super();
    //this is hacky, but we really need to make sure this stuff is only removed once. 
    if(!is_initial_markup_cleared){
      document.getElementById("breadcrumb-trail").innerHTML = "";
      is_initial_markup_cleared = true;
    }
  }
  render(){
    const { crumbs } = this.props;

    const content = (
      <ol className="breadcrumb">
        <li className="infobase-home-breadcrumb-link">
          <a 
            href="#start"
            disabled={_.isEmpty(crumbs)}
          >
            InfoBase 
          </a>
        </li>
        {_.map(crumbs, (display,ix) => 
          <Fragment key={ix} >
            <li aria-hidden="true">
              <img 
                src={get_static_url("svg/arrow.svg")} 
                style={{
                  width: "20px",
                  height: "20px", 
                  margin: "-3px 2px 0px 3px",
                }}
              />
            </li>
            <li className="infobase-home-breadcrumb-link">
              {
              _.isString(display) ? //allow strings or react elements to be used here (note that some strings may have the weird french apostrophe that needs to non-escaped)
                <span dangerouslySetInnerHTML={{__html: display}} /> :
                display
              }
            </li>
          </Fragment>
        )}
      </ol>
    );

    return ReactDOM.createPortal(content, document.getElementById("breadcrumb-trail"));
  }
};

const HeaderBanner = withRouter(
  class HeaderBanner extends React.Component {
    render(){
      const {
        banner_content,
        banner_class,
        route_filter,

        match,
        history,
      } = this.props;

      const banner_container_id = "banner-container";

      let banner_container = document.getElementById(banner_container_id);
      if ( _.isNull(banner_container) ){
        // This case is temporary, can be deleted once #banner-container is in live index files
        banner_container = document.createElement("div");
        banner_container.id = banner_container_id;
        document.querySelector("#wb-bc > .container").appendChild(banner_container);
      }
      
      const should_show_banner = !_.isFunction(route_filter) || route_filter(match, history);

      return ReactDOM.createPortal(
        <div
          className = { `alert alert-no-symbol alert--is-bordered large_panel_text ${banner_class || 'alert-info'}` }
          style = { should_show_banner ? {} : { display: "none" } }
        >
          { banner_content }
        </div>,
        banner_container
      );
    }
  }
);


export class StandardRouteContainer extends React.Component {
  componentDidMount(){
    //unless a route's component is sufficiently complicated, it should never unmount/remount a StandardRouteContainer
    //therefore, this component being unmounts/remounted implies a change between routes, which should always re-scroll
    window.scrollTo(0, 0);
  }
  render(){
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
        <AnalyticsSynchronizer route_key={route_key} />
        { shouldSyncLang !== false &&
          <LangSynchronizer /> 
        }
        { !is_a11y_mode && 
          <A11yLinkSynchronizer non_a11y_route={non_a11y_route}/>
        }
        <div>
          {children}
        </div>
      </div>
    );
  }
}

export class ScrollToTargetContainer extends React.Component {
  scrollToItem(){
    const { target_id } = this.props;

    if (!_.isEmpty(target_id) && target_id !== "__"){
      var el = document.querySelector("#"+target_id);
      if (el){
        setTimeout(()=>{ 
          scrollTo(0,el.offsetTop);
          el.focus(); 
        });
      }
    };
  }
  componentDidMount(){
    this.scrollToItem();
  }
  componentDidUpdate(){
    this.scrollToItem();
  }
  render(){
    const { 
      children,
    } = this.props;

    return children;
  }
}

class AnalyticsSynchronizer extends React.Component {
  render(){ return null; }
  componentDidUpdate(){ this._update(); }
  componentDidMount(){ this._update(); }
  shouldComponentUpdate(nextProps){
    return this.props.route_key !== nextProps.route_key;
  }
  _update(){
    log_page_view(this.props.route_key);
  }
}

export const LangSynchronizer = withRouter(
  class LangSynchronizer extends React.Component {
    render(){ return null; }
    componentDidUpdate(){ this._update(); }
    componentDidMount(){ this._update(); }
    _update(){
      const { lang_modifier } = this.props;
      synchronize_link('#wb-lng a', lang_modifier);
    }
  }
);

export const A11yLinkSynchronizer = withRouter(
  class LangSynchronizer extends React.Component {
    render(){ return null; }
    componentDidUpdate(){ this._update(); }
    componentDidMount(){ this._update(); }
    _update(){
      let { non_a11y_route, a11y_link_modifier } = this.props;

      if (non_a11y_route){
        a11y_link_modifier = () => "#start/no_basic_equiv";
      }

      synchronize_link('#ib-site-header a.a11y-version-link', a11y_link_modifier);
    }
  }
);

const synchronize_link = (target_el_selector, link_modifier_func) => {
  //TODO: probabbly being too defensive here
  const el_to_update = document.querySelector(target_el_selector);
  let newHash = _.isFunction(link_modifier_func) ? 
    link_modifier_func(document.location.hash) : 
    document.location.hash;
  newHash = newHash.split("#")[1] || "";

  if ( _.get(el_to_update, "href") ){
    const link = _.first( el_to_update.href.split("#") );
    if (link){
      el_to_update.href = `${link}#${newHash}`;
    }
  }
};

export const ReactUnmounter = withRouter(
  class ReactUnmounter_ extends React.Component {
    render(){ return null; }
    componentDidUpdate(prevProps){
      if(prevProps.location.pathname !== this.props.location.pathname){
        reactAdapter.unmountAll();
      }
    }
  }
);

export class ErrorBoundary extends React.Component {
  constructor(){
    super();

    this.state = {
      error: null,
      testing_for_stale_client: false,
    };
  }
  static getDerivedStateFromError(error) {
    return {
      error: error,
      testing_for_stale_client: true,
    };
  }
  catch_stale_client_error_case(){
    const unique_query_param = Date.now() + Math.random().toString().replace('.','');

    // Stale clients are our most likely production errors, always check for and attempt to handle them
    // That is, reload the page without cache if the client/CDN sha's are mismatched (and the build is non-dev)
    // Otherwise, log the error (again, if non-dev) and display error component
    make_request( get_static_url('build_sha', unique_query_param) )
      .then( build_sha => {
        const local_sha_matches_remote_sha = build_sha.search(`^${window.sha}`) !== -1;
    
        if (!local_sha_matches_remote_sha && !window.is_dev_build) {
          window.location.reload(true);
        } else {
          this.log_error_and_display_error_page();
        }
      })
      .catch( () => {
        this.log_error_and_display_error_page();
      });
  }
  log_error_and_display_error_page(){
    if (!window.is_dev_build){
      log_standard_event({
        SUBAPP: window.location.hash.replace('#',''),
        MISC1: "ERROR_IN_PROD",
        MISC2: this.state.error.toString(),
      });
    }

    this.setState({
      testing_for_stale_client: false,
    });
  }
  render(){
    const {
      error,
      testing_for_stale_client,
    } = this.state;

    if ( _.isNull(error) ){
      return this.props.children;
    } else if (testing_for_stale_client){
      this.catch_stale_client_error_case();
      return null;
    } else {
      const error_text = {  
        en: "An error has occured",
        fr: "Une erreur est survenue",
      }[window.lang];

      return (
        <Fragment>
          <BreadCrumbs crumbs={[error_text]}/>
          <div
            style = {{
              fontSize: "32px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span>
              {error_text}
            </span>
            <img 
              aria-hidden = {true}
              id = "error-boundary-icon"
              src = { get_static_url("svg/not-available.svg") }
              style = {{
                maxWidth: "100%",
                width: "400px",
              }}
            />
            <span>
              { 
                {
                  en: "Please refresh the page",
                  fr: "Veuillez actualiser la page",
                }[window.lang]
              }
            </span>
          </div>
        </Fragment>
      );
    }
  }
}