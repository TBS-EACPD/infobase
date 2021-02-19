import _ from "lodash";
import React from "react";
import MediaQuery from "react-responsive";

import { highlightColor } from "src/core/color_defs.js";

import {
  lang,
  services_feature_flag,
} from "src/core/injected_build_constants.js";

import { StandardRouteContainer } from "src/core/NavComponents.js";

import {
  IconResultsReport,
  IconCompareEstimates,
  IconHierarchy,
  IconTag,
  IconReport,
  IconFinancesAlt,
  IconEmployeesAlt,
  IconClipboardAlt,
  IconHelpAlt,
  IconServicesHome,
  IconFlagLine,
} from "src/icons/icons.js";

import { get_static_url } from "src/request_utils.js";
import { EverythingSearch } from "src/search/EverythingSearch.js";

import {
  create_text_maker_component,
  CardTopImage,
  ContainerEscapeHatch,
} from "../components/index.js";

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
        <div className="flagline">
          <IconFlagLine width="100%" color="#FFFFFF" alternate_color={false} />
        </div>
        <div className="home-search-box">
          <EverythingSearch />
        </div>
      </header>
    </div>

    <div className="container">
      <div className="row home-featured-row">
        <div className="col-lg-7 gov-infographic-links">
          <GovInfographicLinkItem
            href="#orgs/gov/gov/infograph/financial"
            svg={
              <IconExpend
                width="100%"
                color="#FFFFFF"
                alternate_color={false}
              />
            }
            title={<TM k="home_finance_title" />}
          />
          <GovInfographicLinkItem
            href="#orgs/gov/gov/infograph/people"
            svg={
              <IconPeople
                width="100%"
                color="#FFFFFF"
                alternate_color={false}
              />
            }
            title={<TM k="home_ppl_title" />}
          />
          <GovInfographicLinkItem
            href="#orgs/gov/gov/infograph/results"
            svg={
              <IconResults
                width="100%"
                color="#FFFFFF"
                alternate_color={false}
              />
            }
            title={<TM k="home_results_title" />}
          />
        </div>
        <div className="col-lg-5 featured-home-col">
          <h2>
            <TM k="featured_data_title" />
          </h2>
          <FeaturedContent items={props.featured_content_items} />
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
      <div className="row">
        <SubAppLayout />
      </div>
    </div>
  </div>
);

const GovInfographicLinkItem = ({ svg, title, href, onClick }) => (
  <a href={href} className="gov-infographic-link-item" onClick={onClick}>
    <div className="gov-infographic-link-item__title">{title}</div>
    <div className="gov-infographic-link-item__icon">{svg}</div>
  </a>
);

const FeaturedContent = ({ items }) => (
  <ul className="featured-content-list list-group">
    {_.map(items, ({ text_key, href, is_link_out, is_new }) => (
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
    ))}
  </ul>
);

const SubAppLayout = (props) => (
  <div className="home-root">
    <div className="container">
      <div className="subapp-linkcards">
        <div className="row">
          <div className="col-lg-3 col-md-6 subapp-linkcard">
            <CardTopImage
              tmf={home_tm}
              svg={
                <IconStructure
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
          <div className="col-lg-3 col-md-6 subapp-linkcard">
            <CardTopImage
              tmf={home_tm}
              svg={
                <IconHierarchy
                  width="100%"
                  color="#2C70C9"
                  alternate_color={false}
                />
              }
              title_key="estimates_comp_home_title"
              text_key="estimates_comp_home_text_supps"
              link_href="#compare_estimates"
            />
          </div>
          <div className="col-12 col-lg-3 col-md-6 subapp-linkcard">
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
        </div>
        <div className="row">
          <div className="col-lg-3 col-md-6 subapp-linkcard">
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
          <div className="col-12 col-lg-3 col-md-6 subapp-linkcard">
            <CardTopImage
              tmf={home_tm}
              svg={
                <IconDPs width="100%" color="#2C70C9" alternate_color={false} />
              }
              title_key="home_diff_title"
              text_key="home_diff_text"
              link_href="#diff"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);
