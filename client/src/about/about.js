import React from "react";

import _ from "lodash";

import { IconGrid } from "../components/IconGrid.js";
import { TM } from "../components/index.js";
import { LabeledTable } from "../components/LabeledTable.js";
import { StandardRouteContainer } from "../core/NavComponents.js";
import { create_text_maker } from "../models/text.js";
import { get_static_url } from "../request_utils.js";

import about_text_bundle from "./about.yaml";
import "./about.scss";
import "../explorer_common/explorer-styles.scss";

const text_maker = create_text_maker(about_text_bundle);

const tech_icon_list = _.chain([
  "html5",
  "node-js",
  "react",
  "git",
  "github",
  "python",
  "sass",
  "graphql",
  "baseline-cloud",
])
  .map((tech) => get_static_url(`svg/tech-logos/${tech}.svg`))
  .map((svg) => ({ src: svg }))
  .value();

export default class About extends React.Component {
  render() {
    const { toggleSurvey } = this.props;

    return (
      <StandardRouteContainer
        title={text_maker("about_title")}
        breadcrumbs={[text_maker("about_title")]}
        description={text_maker("about_intro_section")}
        route_key="_about"
      >
        <div className="medium-panel-text text-only-page-root">
          <TM tmf={text_maker} el="h1" k="about_page_title" />
          <TM tmf={text_maker} el="div" k="about_intro_section" />
          <LabeledTable
            title={text_maker("principles_title")}
            contents={[
              {
                label: text_maker("principle_1_name"),
                content: text_maker("principle_1_desc"),
              },
              {
                label: text_maker("principle_2_name"),
                content: text_maker("principle_2_desc"),
              },
              {
                label: text_maker("principle_3_name"),
                content: text_maker("principle_3_desc"),
              },
              {
                label: text_maker("principle_4_name"),
                content: text_maker("principle_4_desc"),
              },
            ]}
          />
          <TM tmf={text_maker} el="h2" k="our_story_title" />
          <TM tmf={text_maker} el="h3" k="our_story_sub_title_1" />
          <TM tmf={text_maker} el="div" k="our_story_sub_text_1" />
          <TM tmf={text_maker} el="h3" k="our_story_sub_title_2" />
          <TM tmf={text_maker} el="div" k="our_story_sub_text_2" />
          <TM tmf={text_maker} el="h2" k="our_data_title" />
          <TM tmf={text_maker} el="h3" k="our_data_sub_title_1" />
          <TM tmf={text_maker} el="div" k="our_data_sub_text_1" />
          <TM tmf={text_maker} el="h3" k="our_data_sub_title_2" />
          <TM tmf={text_maker} el="div" k="our_data_sub_text_2" />
          <TM tmf={text_maker} el="h2" k="behind_scenes_title" />
          <TM tmf={text_maker} el="h3" k="behind_scenes_sub_title_1" />
          <IconGrid icons={tech_icon_list} />
          <TM tmf={text_maker} el="div" k="behind_scenes_sub_text_1" />
          <TM tmf={text_maker} el="h3" k="behind_scenes_sub_title_2" />
          <TM tmf={text_maker} el="div" k="behind_scenes_sub_text_2" />
          <TM tmf={text_maker} el="h2" k="feedback_title" />
          <TM tmf={text_maker} el="div" k="feedback_text_1" />
          <button
            style={{ marginBottom: "10px" }}
            onClick={() => toggleSurvey()}
            className="btn btn-ib-primary"
          >
            {text_maker("survey")}
          </button>
          <TM tmf={text_maker} el="div" k="feedback_text_2" />
        </div>
      </StandardRouteContainer>
    );
  }
}
