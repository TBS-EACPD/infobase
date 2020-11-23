import { withRouter } from "react-router-dom";

import {
  create_text_maker_component,
  AlertBanner,
} from "../components/index.js";
import { StandardRouteContainer } from "../core/NavComponents.js";

import { featured_content_items } from "./home-data.js";

import home_text2 from "./a11y-home.yaml";
import home_text1 from "./home.yaml";

const { text_maker, TM } = create_text_maker_component([
  home_text1,
  home_text2,
]);

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
          <TM k="home_a11y_gov_infograph" />
        </h2>
        <ul>
          <li>
            <a href="#orgs/gov/gov/infograph/financial">
              <TM k="home_a11y_gov_fin" />
            </a>
          </li>
          <li>
            <a href="#orgs/gov/gov/infograph/people">
              <TM k="home_a11y_gov_ppl" />
            </a>
          </li>
          <li>
            <a href="#orgs/gov/gov/infograph/results">
              <TM k="home_a11y_gov_results" />
            </a>
          </li>
        </ul>
      </section>
      <section>
        <h2>
          <TM k="home_a11y_subject_section_title" />
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
            <a href={"#lab/"}>
              <TM k="lab_home_title" />
            </a>
          </h3>
          <TM k="lab_home_text" />
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
