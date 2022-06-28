import _ from "lodash";
import React from "react";
import { withRouter } from "react-router-dom";

import { create_text_maker_component } from "src/components/index";

import { StandardRouteContainer } from "src/core/NavComponents";

import {
  infographic_link_items,
  featured_content_items,
  subapp_items,
} from "./home-data";

import home_text from "./home.yaml";

const { text_maker, TM } = create_text_maker_component([home_text]);

const Home = () => {
  return (
    <StandardRouteContainer
      route_key="start"
      description={text_maker("home_a11y_desc")}
    >
      <h1>
        <TM k="title" />
      </h1>
      <section>
        <h2>
          <TM k="home_gov_infograph" />
        </h2>
        <ul>
          {_.map(infographic_link_items, ({ href, title, description }, ix) => (
            <li key={ix}>
              <a href={href} aria-label={description}>
                {title}
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>
          <TM k="featured_data_title" />
        </h2>
        <ul>
          {_.map(featured_content_items, ({ text_key, href }, ix) => (
            <li key={ix}>
              <a href={href}>
                <TM k={text_key} />
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>
          <TM k="subapps_text" />
        </h2>
        <ul>
          {_.map(subapp_items, ({ href, title_key, text_key }, ix) => (
            <li key={ix}>
              <a href={href} aria-label={text_maker(text_key)}>
                <TM k={title_key} />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </StandardRouteContainer>
  );
};
export default withRouter(Home);
