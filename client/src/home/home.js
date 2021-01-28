import _ from "lodash";
import React from "react";
import MediaQuery from "react-responsive";

import { highlightColor } from "src/core/color_defs.js";

import { lang } from "src/core/injected_build_constants.js";

import {
  create_text_maker_component,
  CardTopImage,
  CardLeftImage,
  ContainerEscapeHatch,
  TrinityItem,
} from "../components/index.js";

import { log_standard_event } from "../core/analytics.js";

import { StandardRouteContainer } from "../core/NavComponents.js";
import { get_static_url } from "../request_utils.js";
import { AdvancedSearch } from "../search/index.js";

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

const FeaturedContentItem = ({
  text_key,
  href,
  is_link_out,
  is_new,
  is_youtube,
}) => (
  <li className="list-group-item list-group-item--home">
    {is_new && (
      <span className="badge badge--is-new">
        <TM k={"new"} />
      </span>
    )}
    <a
      href={_.has(href, lang) ? href[lang] : href}
      target={is_link_out ? "_blank" : "_self"}
      rel={is_link_out ? "noopener noreferrer" : ""}
    >
      <TM k={text_key} />
    </a>
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
          <img aria-hidden="true" src={get_static_url("svg/flagline.svg")} />
        </div>
        <div className="search-box">
          <AdvancedSearch
            onNewQuery={(query) => {
              log_standard_event({
                SUBAPP: "home",
                SUBJECT_GUID: null,
                MISC1: "home_search",
                MISC2: query,
              });
            }}
          />
        </div>
      </header>
    </div>

    <div className="container">
      <div className="home-trinity-container frow">
        <TrinityItem
          href="#orgs/gov/gov/infograph/financial"
          img_url={get_static_url("svg/expend.svg")}
          title={<TM k="home_finance_title" />}
        />
        <TrinityItem
          href="#orgs/gov/gov/infograph/people"
          img_url={get_static_url("svg/people.svg")}
          title={<TM k="home_ppl_title" />}
        />
        <TrinityItem
          href="#orgs/gov/gov/infograph/results"
          img_url={get_static_url("svg/results.svg")}
          title={<TM k="home_results_title" />}
        />
      </div>
      <div className="frow featured-home-cols">
        <div className="fcol-md-7 featured-home-cols__additional">
          <div className="col-content">
            <CardLeftImage
              tmf={home_tm}
              img_src={get_static_url("svg/DPs.svg")}
              title_key="quick_link_DRR_1920"
              text_key="drr_home_text"
              link_key="check_home_link"
              link_href="#orgs/gov/gov/infograph/results/.-.-(panel_key.-.-'gov_drr)"
            />
          </div>
          <div className="col-content">
            <CardLeftImage
              tmf={home_tm}
              img_src={get_static_url("svg/compare-estimates-white.svg")}
              title_key="estimates_comp_home_title"
              text_key="estimates_comp_home_text_supps"
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
              img_src={get_static_url("svg/partition-icon.svg")}
              title_key="partition_home_title"
              text_key="partition_home_text"
              link_href="#partition"
            />
          </div>
          <div className="fcol-md-3 fcol-sm-6 linkcard">
            <CardTopImage
              tmf={home_tm}
              img_src={get_static_url("svg/compare-estimates.svg")}
              title_key="estimates_comp_home_title"
              text_key="estimates_comp_home_text_supps"
              link_href="#compare_estimates"
            />
          </div>
          <div className="fcol-md-3 fcol-sm-6 linkcard">
            <CardTopImage
              tmf={home_tm}
              img_src={get_static_url("svg/structure.svg")}
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
              img_src={get_static_url("svg/treemap.svg")}
              title_key="treemap_home_title"
              text_key="treemap_home_text"
              link_href="#treemap"
            />
          </div>
          <div className="fcol-md-3 fcol-sm-6 linkcard">
            <CardTopImage
              tmf={home_tm}
              img_src={get_static_url("svg/explorer.svg")}
              title_key="explorer_home_title"
              text_key="explorer_home_text"
              link_href="#tag-explorer"
            />
          </div>
          <div className="fcol-md-3 fcol-sm-6 linkcard">
            <CardTopImage
              tmf={home_tm}
              img_src={get_static_url("svg/builder.svg")}
              title_key="home_build_a_report"
              text_key="report_builder_home_desc"
              link_href="#rpb"
            />
          </div>
          <div className="fcol-md-3 fcol-sm-6 linkcard">
            <CardTopImage
              tmf={home_tm}
              img_src={get_static_url("svg/lab.svg")}
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
