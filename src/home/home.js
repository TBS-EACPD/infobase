import './home.scss';
import home_text_bundle from "./home.yaml";
import get_home_content from './home-data.js';
import { log_standard_event } from '../core/analytics.js';
import MediaQuery from 'react-responsive';

import { 
  EverythingSearch,
  create_text_maker_component,
  CardTopImage,
  CardCenteredImage,
  CardBackgroundImage,
  ContainerEscapeHatch,
} from '../util_components.js';

import { general_href_for_item } from '../link_utils.js';
import { StandardRouteContainer } from '../core/NavComponents.js';
import { get_static_url } from '../core/request_utils.js';

const { text_maker: home_tm, TM } = create_text_maker_component(home_text_bundle);

export class Home extends React.Component {
  render(){

    const { featured_content_items } = get_home_content();

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

const FeaturedContentItem = ({ text_key, href, is_new }) => <li className="list-group-item list-group-item--home">
  { is_new && <span className="badge badge--is-new"> new </span> }
  <a href={href}> <TM k={text_key} /> </a>
</li>;

const TrinityItem = ({img_url, title, href}) => (
  <div className="fcol-md-4">
    <a href={href} className="TrinityItem">
      <div className="TrinityItem__Title">
        {title}
      </div>
      <div className="TrinityItem__Img">
        <img src={img_url} />
      </div>
    </a>
  </div>
);

const HomeLayout = props => (
  <div className="home-root">
    <div 
      className="intro-box" 
      style={{ backgroundImage:`URL(${get_static_url("svg/backbanner.svg")})` }}
    >
      <div className="container">
        <h1> <TM k="welcome" /> </h1>
        <h2> <TM k="home_sub_title" /> </h2>
        <div className="flag">
          <img src={get_static_url("svg/flagline.svg")}/>
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
              <CardCenteredImage
                tmf={home_tm}
                img_src={get_static_url("svg/partition-budget.svg")}
                title_key="budget_home_title"
                text_key="budget_home_text"
                link_key="check_home_link"
                link_href="#budget-measures/budget-measure/overview"
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
                  search_text={home_tm('everything_search_placeholder')}
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

            
    <div className="home-bg">
      <div className="container">
        <CardBackgroundImage
          tmf={home_tm}
          img_src={get_static_url("svg/partition.svg")}
          title_key="partition_home_title"
          text_key="partition_home_text"
          link_key="check_home_link"
          link_href="#partition/dept/exp"
          is_ellen_image
        />
      </div>
    </div>

    <div className="container">
      <div className="xtralinks">
        <div className='frow'>
          <div className="fcol-md-4 fcol-sm-6 linkcard">
            <CardTopImage
              tmf={home_tm}
              img_src={get_static_url("svg/compare_estimates.svg")}
              title_key="estimates_comp_home_title"
              text_key="estimates_comp_home_text"
              link_href="#compare_estimates"
            />
          </div>
          <div className="fcol-md-4 fcol-sm-6 linkcard">
            <CardTopImage
              tmf={home_tm}
              img_src={get_static_url("svg/bubbles.svg")}
              title_key="planet_home_title"
              text_key="planet_home_text"
              link_href="#explore-dept"
            />
          </div>
          <div className="fcol-md-4 fcol-sm-6 linkcard">
            <CardTopImage
              tmf={home_tm}
              img_src={get_static_url("svg/explorer.svg")}
              title_key="explorer_home_title"
              text_key="explorer_home_text"
              link_href="#resource-explorer"
            />
          </div>
          <div className="fcol-md-4 fcol-sm-6 linkcard">
            <CardTopImage
              tmf={home_tm}
              img_src={get_static_url("svg/builder.svg")}
              title_key="home_build_a_report"
              text_key="report_builder_home_desc"
              link_href="#rpb"
            />
          </div>
          <div className="fcol-md-4 fcol-sm-6 linkcard">
            <CardTopImage
              tmf={home_tm}
              img_src={get_static_url("svg/structure.svg")}
              title_key="igoc_home_title"
              text_key="igoc_home_desc"
              link_href="#igoc"
            />
          </div>
          <div className="fcol-md-4 fcol-sm-6 linkcard">
            <CardTopImage
              tmf={home_tm}
              img_src={get_static_url("svg/glossary.svg")}
              title_key="glossary_home_title"
              text_key="glossary_home_desc"
              link_href="#glossary"
            />
          </div>
          <div className="fcol-md-4 fcol-sm-6 linkcard">
            <CardTopImage
              tmf={home_tm}
              img_src={get_static_url("svg/metadata.svg")}
              title_key="metadata_home_title"
              text_key="metadata_home_desc"
              link_href="#metadata"
            />
          </div>
          <div className="fcol-md-4 fcol-sm-6 linkcard">
            <CardTopImage
              tmf={home_tm}
              img_src={get_static_url("svg/aboutus.svg")}
              title_key="about_home_title"
              text_key="about_home_desc"
              link_href="#about"
            />
          </div>
          <div className="fcol-md-4 fcol-sm-6 linkcard">
            <CardTopImage
              tmf={home_tm}
              img_src={get_static_url("svg/feedback.svg")}
              title_key="survey_link_text"
              text_key="survey_home_desc"
              link_href={home_tm("survey_link_href")}
              link_open_in_new_tab={true}
            />
          </div>
        </div>
      </div>
    </div> 
  </div>
);


