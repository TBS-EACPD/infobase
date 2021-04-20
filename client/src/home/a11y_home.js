import _ from "lodash";
import React from "react";
import { withRouter } from "react-router-dom";

import {
  create_text_maker_component,
  AlertBanner,
} from "src/components/index.js";

import { StandardRouteContainer } from "src/core/NavComponents.js";

import { infographic_link_items, featured_content_items } from "./home-data.js";

import home_text from "./home.yaml";

const { text_maker, TM } = create_text_maker_component([home_text]);

const Home = (props) => {
  const {
    match: {
      params: { no_basic_equiv },
    },
  } = props;

  return (
    <StandardRouteContainer
      route_key="start"
      description={text_maker("home_a11y_desc")}
    >
      <h1>
        <TM k="title" />
      </h1>
      {no_basic_equiv === "no_basic_equiv" && (
        <AlertBanner
          banner_class={"warning"}
          additional_class_names={"large_panel_text"}
        >
          <TM k="home_a11y_non_a11y_redirect_warning" />
        </AlertBanner>
      )}
      <section>
        <h2>
          <TM k="home_gov_infograph" />
        </h2>
        <ul>
          {_.map(infographic_link_items, ({ href, description }, ix) => (
            <li key={ix}>
              <a href={href}>{description}</a>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>
          <TM k="subapps_text" />
        </h2>

        <section>
          <h3>
            <a href="#igoc/">
              <TM k="igoc_home_title" />
            </a>
          </h3>
          <TM k="igoc_home_desc" />
        </section>

        <section>
          <h3>
            <a href="#resource-explorer/">
              <TM k="explorer_home_title" />
            </a>
          </h3>
          <TM k="explorer_home_text" />
        </section>

        <section>
          <h3>
            <a href="#rpb/">
              <TM k="home_build_a_report" />
            </a>
          </h3>
          <TM k="report_builder_home_desc" />
        </section>

        <section>
          <h3>
            <a href={"#diff/"}>
              <TM k="home_diff_title" />
            </a>
          </h3>
          <TM k="home_diff_text" />
        </section>

        <section>
          <h3>
            <TM k="featured_data_title" />
          </h3>
          <ul>
            {_.map(featured_content_items, ({ text_key, href }) => (
              <li key={text_key}>
                <a href={href}>
                  <TM k={text_key} />
                </a>
              </li>
            ))}
          </ul>
        </section>
      </section>
    </StandardRouteContainer>
  );
};
export default withRouter(Home);
