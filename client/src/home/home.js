import _ from "lodash";
import React from "react";

import {
  create_text_maker_component,
  ContainerEscapeHatch,
} from "src/components/index";

import { highlightColor } from "src/core/color_defs";
import { lang } from "src/core/injected_build_constants";
import { StandardRouteContainer } from "src/core/NavComponents";

import { IconFlagLine } from "src/icons/icons";

import { get_static_url } from "src/request_utils";
import { EverythingSearch } from "src/search/EverythingSearch";

import { CardImage } from "./CardImage/CardImage";

import {
  infographic_link_items,
  featured_content_items,
  subapp_items,
} from "./home-data";

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
        <ContainerEscapeHatch>
          <div className="home-root">
            <div
              className="intro-box"
              style={{
                backgroundImage: `URL(${get_static_url("svg/backbanner.svg")})`,
              }}
            >
              <header className="container">
                <h1>
                  <TM k="home_title" />
                </h1>
                <h2 style={{ marginTop: 0 }}>
                  <TM k="home_sub_title" />
                </h2>
                <div className="flagline">
                  <IconFlagLine
                    width="100%"
                    color="#FFFFFF"
                    alternate_color={false}
                  />
                </div>
                <div className="home-search-box">
                  <EverythingSearch />
                </div>
              </header>
            </div>

            <div className="container">
              <div className="row home-featured-row">
                <div className="col-lg-7 home-infographic-links">
                  {_.map(
                    infographic_link_items,
                    ({ href, svg, title, description }, ix) => (
                      <a
                        key={ix}
                        href={href}
                        className="home-infographic-link-item"
                        title={description}
                      >
                        <div className="home-infographic-link-item__title">
                          {title}
                        </div>
                        <div className="home-infographic-link-item__icon">
                          {svg}
                        </div>
                      </a>
                    )
                  )}
                </div>

                <div className="col-lg-5 home-featured-content">
                  <h2>
                    <TM k="featured_data_title" />
                  </h2>
                  <ul className="list-group">
                    {_.map(
                      featured_content_items,
                      ({ text_key, href, is_link_out, is_new }, ix) => (
                        <li
                          key={ix}
                          className="list-group-item list-group-item--home d-flex justify-content-between"
                        >
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
                      )
                    )}
                  </ul>
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
                <div className="home-root">
                  <div className="container">
                    <div className="subapp-linkcards">
                      {_.chain(subapp_items)
                        .chunk(3)
                        .map((subapp_items, ix) => (
                          <div key={ix} className="row">
                            {_.map(
                              subapp_items,
                              ({ svg, title_key, text_key, href }, ix) => (
                                <div
                                  key={ix}
                                  className="col-lg-3 col-md-6 subapp-linkcard"
                                >
                                  <CardImage
                                    tmf={home_tm}
                                    svg={svg}
                                    title_key={title_key}
                                    text_key={text_key}
                                    link_href={href}
                                  />
                                </div>
                              )
                            )}
                          </div>
                        ))
                        .value()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContainerEscapeHatch>
      </StandardRouteContainer>
    );
  }
}
