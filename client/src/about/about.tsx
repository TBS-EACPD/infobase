import _ from "lodash";
import React from "react";

import {
  IconGrid,
  LabeledTable,
  create_text_maker_component,
} from "src/components/index";

import { StandardRouteContainer } from "src/core/NavComponents";

import {
  IconHTML,
  IconNodeJS,
  IconReact,
  IconGit,
  IconGitHub,
  IconPython,
  IconSass,
  IconGraphQL,
  IconBaselineCloud,
} from "src/icons/icons";

import about_text_bundle from "./about.yaml";
import "./about.scss";

import "src/explorer_common/explorer-styles.scss";

const { TM, text_maker } = create_text_maker_component(about_text_bundle);

const tech_icon_list = _.chain([
  IconHTML,
  IconNodeJS,
  IconReact,
  IconGit,
  IconGitHub,
  IconPython,
  IconSass,
  IconGraphQL,
  IconBaselineCloud,
])
  .map((SVG) => ({ svg: <SVG alternate_color={false} width="1.25em" /> }))
  .value();

interface AboutProps {
  toggleSurvey: () => void;
}
export default class About extends React.Component<AboutProps, never> {
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
          <TM el="h1" k="about_page_title" />
          <TM el="div" k="about_intro_section" />
          <LabeledTable
            title={text_maker("principles_title")}
            contents={[
              {
                label: text_maker("principle_1_name"),
                content: <TM el="div" k="principle_1_desc" />,
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
          <TM el="h2" k="our_story_title" />
          <TM el="h3" k="our_story_sub_title_1" />
          <TM el="div" k="our_story_sub_text_1" />
          <TM el="h3" k="our_story_sub_title_2" />
          <TM el="div" k="our_story_sub_text_2" />
          <TM el="h2" k="our_data_title" />
          <TM el="h3" k="our_data_sub_title_1" />
          <TM el="div" k="our_data_sub_text_1" />
          <TM el="h3" k="our_data_sub_title_2" />
          <TM el="div" k="our_data_sub_text_2" />
          <TM el="h2" k="behind_scenes_title" />
          <TM el="h3" k="behind_scenes_sub_title_1" />
          <IconGrid icons={tech_icon_list} />
          <TM el="div" k="behind_scenes_sub_text_1" />
          <TM el="h3" k="behind_scenes_sub_title_2" />
          <TM el="div" k="behind_scenes_sub_text_2" />
          <TM el="h3" k="behind_scenes_sub_title_3" />
          <TM el="div" k="behind_scenes_sub_text_3" />
          <TM el="h2" k="feedback_title" />
          <TM el="div" k="feedback_text_1" />
          <button
            style={{ marginBottom: "10px" }}
            onClick={() => toggleSurvey()}
            className="btn btn-ib-primary"
          >
            {text_maker("survey")}
          </button>
          <TM el="div" k="feedback_text_2" />
        </div>
      </StandardRouteContainer>
    );
  }
}
