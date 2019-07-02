import './home.scss';
import home_text_bundle from "./home.yaml";
import { featured_content_items } from './home-data.js';
import { log_standard_event } from '../core/analytics.js';
import MediaQuery from 'react-responsive';

import { 
  EverythingSearch,
  create_text_maker_component,
  CardTopImage,
  CardLeftImage,
  ContainerEscapeHatch,
} from '../util_components.js';

import { general_href_for_item } from '../link_utils.js';
import { StandardRouteContainer } from '../core/NavComponents.js';
import { get_static_url } from '../request_utils.js';

const { text_maker: home_tm, TM } = create_text_maker_component(home_text_bundle);

export default class Home extends React.Component {
  render(){
    return (
      <StandardRouteContainer 
        route_key="start"
        description={home_tm("home_desc_meta_attr")}
      >
        <MediaQuery minWidth={992}>
          {is_large =>
            <ContainerEscapeHatch>
              <HomeLayout
                is_large={is_large}
                featured_content_items={featured_content_items}
              />
            </ContainerEscapeHatch>
          }
        </MediaQuery>
      </StandardRouteContainer>
    );
  }

}

const FeaturedContentItem = ({ text_key, href, is_link_out, is_new, is_youtube }) => <li className="list-group-item list-group-item--home">
  { is_new && <span className="badge badge--is-new"> <TM k={"new"} /> </span> }
  { is_youtube && <img aria-hidden="true" style={{float: "right", height: "25px", margin: "-2px 4px 0px 0px"}} src={get_static_url("svg/youtube-icon.svg")}/>}
  <a href={href} target={is_link_out ? "_blank" : "_self"} rel={is_link_out ? "noopener noreferrer" : ""}> 
    <TM k={text_key} /> 
  </a>
</li>;

const TrinityItem = ({img_url, title, href}) => (
  <div className="fcol-md-4">
    <a href={href} className="TrinityItem">
      <div className="TrinityItem__Title">
        {title}
      </div>
      <div className="TrinityItem__Img">
        <img aria-hidden="true" src={img_url}/>
      </div>
    </a>
  </div>
);

const HomeLayout = props => (
  <div className="home-root">
    <div 
      className="intro-box" 
      style={{ backgroundImage: `URL(${get_static_url("svg/backbanner.svg")})` }}
    >
      <div className="container">
        <h1> <TM k="welcome" /> </h1>
        <h2> <TM k="home_sub_title" /> </h2>
        <div className="flag">
          <img aria-hidden="true" src={get_static_url("svg/flagline.svg")}/>
        </div>
      </div>
    </div>
    <div className="container">
      <div className="home-trinity-container">
        <div className="frow">
          <TrinityItem
            href="#orgs/gov/gov/infograph/financial"
            img_url={get_static_url('svg/expend.svg')}
            title={<TM k="home_finance_title" />}
          />
          <TrinityItem
            href="#orgs/gov/gov/infograph/people"
            img_url={get_static_url('svg/people.svg')}
            title={<TM k="home_ppl_title" />}
          />
          <TrinityItem
            href="#orgs/gov/gov/infograph/results"
            img_url={get_static_url('svg/results.svg')}
            title={<TM k="home_results_title" />}
          />
        </div>
      </div>
    </div>

    <div className="container">
      <div className="home-body">
        <div className="frow home-cols">
          <div className="fcol-md-7">
            <div className="col-content featured-col-content">
              <CardLeftImage
                tmf={home_tm}
                img_src={get_static_url("svg/partition-budget.svg")}
                title_key="budget_home_title"
                text_key="budget_home_text"
                link_key="check_home_link"
                link_href="#budget-tracker/budget-measure/overview"
              />
            </div> 
            <div className="col-content featured-col-content">
              <CardLeftImage
                tmf={home_tm}
                img_src={get_static_url("svg/DPs.svg")}
                title_key="mains_dps_home_title"
                text_key="mains_dps_home_text"
                link_key="check_home_link"
                link_href="#orgs/gov/gov/infograph/results"
              />
            </div>       
          </div>
          <div className="fcol-md-5">
            <header className="h3 home-search-header">
              <TM k="home_search_bar_title" />
            </header> 
            <div className="search-box">
              <div className="search-container home-search-container">
                <EverythingSearch 
                  include_gov={false} 
                  placeholder={home_tm('everything_search_placeholder')}
                  large={true}
                  include_tags={true}
                  include_programs={true}
                  include_crsos={true}
                  include_tables={true} 
                  include_glossary={true}
                  org_scope="all_orgs_with_gov"
                  href_template={ general_href_for_item }
                  onNewQuery={ query => { 
                    log_standard_event({
                      SUBAPP: "home",
                      SUBJECT_GUID: null, 
                      MISC1: "home_search",
                      MISC2: query,
                    });
                  }}
                />
              </div>
            </div>

            <header className="h3 home-featured-data-header">
              <TM k="featured_data_title" />
            </header>
            <div>
              <ul className="list-group list-group--quick-links">
                { _.map( props.featured_content_items, item => <FeaturedContentItem key={item.text_key} {...item} /> ) }
              </ul>
            </div>
  
          </div>
        </div>
      </div>
    </div>
  </div>
);


