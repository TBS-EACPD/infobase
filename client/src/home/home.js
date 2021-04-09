import _ from "lodash";
import React from "react";
import MediaQuery from "react-responsive";

import {
  create_text_maker_component,
  CardTopImage,
  CardLeftImage,
  ContainerEscapeHatch,
  TrinityItem,
} from "src/components/index.js";

import { prefetch_services } from "src/models/populate_services.js";

import { highlightColor } from "src/core/color_defs.js";
import {
  lang,
  services_feature_flag,
} from "src/core/injected_build_constants.js";

import { StandardRouteContainer } from "src/core/NavComponents.js";

import {
  IconResultsReport,
  IconPartition,
  IconCompareEstimates,
  IconHierarchy,
  IconTreemap,
  IconTag,
  IconReport,
  IconLab,
  IconFinancesAlt,
  IconEmployeesAlt,
  IconClipboardAlt,
  IconHelpAlt,
  IconServicesHome,
  IconFlagLine,
} from "src/icons/icons.js";

import { get_static_url } from "src/request_utils.js";

import { EverythingSearch } from "src/search/EverythingSearch.js";

import { featured_content_items } from "./home-data.js";

import home_text_bundle from "./home.yaml";
import "./home.scss";

const { text_maker: home_tm, TM } = create_text_maker_component(
  home_text_bundle
);

export default class Home extends React.Component {
  render() {
    return (
      <StandardRouteContainer
        route_key="start"
        description={home_tm("home_desc_meta_attr")}
      >
        <MediaQuery minWidth={992}>
          {(is_large) => (
            <ContainerEscapeHatch>
              <HomeLayout
                is_large={is_large}
                featured_content_items={featured_content_items}
              />
            </ContainerEscapeHatch>
          )}
        </MediaQuery>
      </StandardRouteContainer>
    );
  }
}

const FeaturedContentItem = ({ text_key, href, is_link_out, is_new }) => (
  <li className="list-group-item list-group-item--home d-flex justify-content-between">
    <a
      href={_.has(href, lang) ? href[lang] : href}
      target={is_link_out ? "_blank" : "_self"}
      rel={is_link_out ? "noopener noreferrer" : ""}
    >
      <TM k={text_key} />
    </a>
    {is_new && (
      <span className="badge badge--is-new">
        <TM k={"new"} />
      </span>
    )}
  </li>
);

const HomeLayout = (props) => (
  <div className="home-root">
    <div
      className="intro-box"
      style={{
        backgroundImage: `URL(${get_static_url("svg/backbanner.svg")})`,
      }}
    >
      <header className="container">
        <h1>
          <TM k="welcome" />
        </h1>
        <h2 style={{ marginTop: 0 }}>
          <TM k="home_sub_title" />
        </h2>
        <div className="flag">
          <IconFlagLine width="100%" color="#FFFFFF" alternate_color={false} />
        </div>
        <div className="search-box">
          <EverythingSearch />
        </div>
      </header>
    </div>

    <div className="container">
      <div className="home-trinity-container frow">
        <TrinityItem
          href="#orgs/gov/gov/infograph/financial"
          svg={
            <IconFinancesAlt
              width="100%"
              color="#FFFFFF"
              alternate_color={false}
            />
          }
          title={<TM k="home_finance_title" />}
        />
        <TrinityItem
          href="#orgs/gov/gov/infograph/covid"
          img_url={get_static_url("svg/covid.svg")}
          title={<TM k="covid" />}
          svg={
            <IconHelpAlt width="100%" color="#FFFFFF" alternate_color={false} />
          }
        />
        <TrinityItem
          href="#orgs/gov/gov/infograph/people"
          svg={
            <IconEmployeesAlt
              width="100%"
              color="#FFFFFF"
              alternate_color={false}
            />
          }
          title={<TM k="home_ppl_title" />}
        />
        {services_feature_flag && (
          <TrinityItem
            href="#orgs/gov/gov/infograph/services"
            svg={
              <IconServicesHome
                width="100%"
                color="#FFFFFF"
                alternate_color={false}
              />
            }
            onMouseEnter={() => prefetch_services()}
            title={<TM k="home_services_title" />}
          />
        )}
        <TrinityItem
          href="#orgs/gov/gov/infograph/results"
          svg={
            <IconClipboardAlt
              width="100%"
              color="#FFFFFF"
              alternate_color={false}
            />
          }
          title={<TM k="home_results_title" />}
        />
      </div>
      <div className="frow featured-home-cols">
        <div className="fcol-md-7 featured-home-cols__additional">
          <div className="col-content">
            <CardLeftImage
              tmf={home_tm}
              svg={
                <IconResultsReport
                  width="100%"
                  color="#FFFFFF"
                  alternate_color={false}
                />
              }
              title_key="quick_link_DP_2022"
              text_key="dp_home_text"
              link_key="check_home_link"
              link_href="#orgs/gov/gov/infograph/results/.-.-(panel_key.-.-'gov_dp)"
            />
          </div>
          <div className="col-content">
            <CardLeftImage
              tmf={home_tm}
              svg={
                <IconCompareEstimates
                  width="100%"
                  color="#FFFFFF"
                  alternate_color={false}
                />
              }
              title_key="estimates_comp_home_title"
              text_key="estimates_comp_home_text"
              link_href="#compare_estimates"
            />
          </div>
        </div>
        <div className="fcol-md-5 featured-home-cols__primary">
          <h2>
            <TM k="featured_data_title" />
          </h2>
          <div>
            <ul className="list-group list-group--quick-links">
              {_.map(props.featured_content_items, (item) => (
                <FeaturedContentItem key={item.text_key} {...item} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div
      className="intro-box break-box"
      style={{
        backgroundImage: `URL(${get_static_url("svg/backbanner.svg")})`,
        paddingTop: "10px",
        paddingBottom: "10px",
        borderBottom: `5px solid ${highlightColor}`,
      }}
    >
      <header className="container">
        <h2 className="h1">
          <TM k="subapps_title" />
        </h2>
        <h3 className="h2">
          <TM k="subapps_text" />
        </h3>
      </header>
    </div>

    <div className="container">
      <div className="frow">
        <SubAppLayout />
      </div>
    </div>
  </div>
);

const SubAppLayout = (props) => (
  <div className="home-root">
    <div className="container">
      <div className="xtralinks">
        <div className="frow">
          <div className="fcol-md-3 fcol-sm-6 linkcard">
            <CardTopImage
              tmf={home_tm}
              svg={
                <IconPartition
                  width="100%"
                  color="#2C70C9"
                  alternate_color={false}
                />
              }
              title_key="partition_home_title"
              text_key="partition_home_text"
              link_href="#partition"
            />
          </div>
          <div className="fcol-md-3 fcol-sm-6 linkcard">
            <CardTopImage
              tmf={home_tm}
              svg={
                <IconCompareEstimates
                  width="100%"
                  color="#2C70C9"
                  alternate_color={false}
                />
              }
              title_key="estimates_comp_home_title"
              text_key="estimates_comp_home_text"
              link_href="#compare_estimates"
            />
          </div>
          <div className="fcol-md-3 fcol-sm-6 linkcard">
            <CardTopImage
              tmf={home_tm}
              svg={
                <IconHierarchy
                  width="100%"
                  color="#2C70C9"
                  alternate_color={false}
                />
              }
              title_key="igoc_home_title"
              text_key="igoc_home_desc"
              link_href="#igoc"
            />
          </div>
        </div>
        <div className="frow">
          <div className="fcol-md-3 fcol-sm-6 linkcard">
            <CardTopImage
              tmf={home_tm}
              svg={
                <IconTreemap
                  width="100%"
                  color="#2C70C9"
                  alternate_color={false}
                />
              }
              title_key="treemap_home_title"
              text_key="treemap_home_text"
              link_href="#treemap"
            />
          </div>
          <div className="fcol-md-3 fcol-sm-6 linkcard">
            <CardTopImage
              tmf={home_tm}
              svg={
                <IconTag width="100%" color="#2C70C9" alternate_color={false} />
              }
              title_key="explorer_home_title"
              text_key="explorer_home_text"
              link_href="#tag-explorer"
            />
          </div>
          <div className="fcol-md-3 fcol-sm-6 linkcard">
            <CardTopImage
              tmf={home_tm}
              svg={
                <IconReport
                  width="100%"
                  color="#2C70C9"
                  alternate_color={false}
                />
              }
              title_key="home_build_a_report"
              text_key="report_builder_home_desc"
              link_href="#rpb"
            />
          </div>
          <div className="fcol-md-3 fcol-sm-6 linkcard">
            <CardTopImage
              tmf={home_tm}
              svg={
                <IconLab width="100%" color="#2C70C9" alternate_color={false} />
              }
              title_key="lab_home_title"
              text_key="lab_home_text"
              link_href="#lab"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);
