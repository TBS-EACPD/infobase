import withRouter from 'react-router/withRouter';
import { reactAdapter } from './reactAdapter.js';

const { log_page_view } = require('./analytics.js');
const {
  index_lang_lookups: {
    page_title: default_title,
    meta_description: default_description,
  },
} = require("../InfoBase/index_data.js");


//note: This must be manually kept consistent with index.hbs.html
let is_initial_markup_cleared = false;

class BreadCrumbs extends React.Component {
  componentWillMount(){
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
          <li 
            key={ix}
            className="infobase-home-breadcrumb-link"
          >
            {display}
          </li>
        )}
      </ol>
    );

    return ReactDOM.createPortal(content, document.getElementById("breadcrumb-trail"));
  }
};

class DocumentTitle extends React.Component {
  render(){ return null; }
  componentDidUpdate(){ this._update(); }
  componentWillMount(){ this._update(); }
  _update(){
    const { title_str } = this.props;

    const title =  (
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
    } = this.props;

    return (
      <div>
        <DocumentTitle title_str={title} />
        <DocumentDescription description_str={description} />
        <BreadCrumbs crumbs={breadcrumbs} />
        <AnalyticsSynchronizer route_key={route_key} />
        <div>
          {children}
        </div>
      </div>
    );
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
    shouldComponentUpdate(nextProps){
      return this.props.location.pathname !== nextProps.location.pathname;
    }
    _update(){

      //TODO: probabbly being too defensive here
      const el_to_update = document.querySelector('#wb-lng a');
      const newHash = document.location.hash.split("#")[1] || "";
      if (_.get(el_to_update, "href")){
        const link = _.first(el_to_update.href.split("#"));
        if(link){
          el_to_update.href = `${link}#${newHash}`;
        }
      }
    }
  }
);

export const ReactUnmounter = withRouter(
  class ReactUnmounter_ extends React.Component {
    render(){ return null; }
    componentWillUpdate(nextProps){
      if(this.props.location.pathname !== nextProps.location.pathname){
        reactAdapter.unmountAll();
      }
    }
  }
);