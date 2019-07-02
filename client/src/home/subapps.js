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

export default class SubApps extends React.Component {
  render(){
    return (
      <StandardRouteContainer 
        route_key="subapps"
        breadcrumbs={[home_tm("subapps_title")]}
        //description=TODO
      >
        <MediaQuery minWidth={992}>
          {is_large =>
            <ContainerEscapeHatch>
              <SubAppLayout
                is_large={is_large}
              />
            </ContainerEscapeHatch>
          }
        </MediaQuery>
      </StandardRouteContainer>
    );
  }  
}


const SubAppLayout = props => (
  <div className="home-root">  
    <div className="container">
      <TM k="subapps_title" el="h1" />
      <TM k="subapps_text" el="h2" />
      <div className="xtralinks">
        <div className='frow'>
          <div className="fcol-md-4 fcol-sm-6 linkcard">
            <CardTopImage
              tmf={home_tm}
              img_src={get_static_url("svg/partition-icon.svg")}
              title_key="partition_home_title"
              text_key="partition_home_text"
              link_href="#rpb"
            />
          </div>
          <div className="fcol-md-4 fcol-sm-6 linkcard">
            <CardTopImage
              tmf={home_tm}
              img_src={get_static_url("svg/partition-icon-budget.svg")}
              title_key="budget_home_title"
              text_key="budget_home_text"
              link_href="#igoc"
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
              img_src={get_static_url("svg/compare-estimates.svg")}
              title_key="estimates_comp_home_title"
              text_key="estimates_comp_home_text"
              link_href="#compare_estimates"
            />
          </div>
          <div className="fcol-md-4 fcol-sm-6 linkcard">
            <CardTopImage
              tmf={home_tm}
              img_src={get_static_url("svg/treemap.svg")}
              title_key="treemap_home_title"
              text_key="treemap_home_text"
              link_href="#treemap"
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
              img_src={get_static_url("svg/glossary.svg")}
              title_key="glossary_home_title"
              text_key="glossary_home_desc"
              link_href="#glossary"
            />
          </div>
          <div className="fcol-md-4 fcol-sm-6 linkcard">
            <CardTopImage
              tmf={home_tm}
              img_src={get_static_url("svg/lab.svg")}
              title_key="lab_home_title"
              text_key="lab_home_text"
              link_href="#lab"
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


