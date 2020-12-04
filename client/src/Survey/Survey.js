import React from "react";

import { EmailFrontend } from "../components/EmailFrontend.js";
import { StandardRouteContainer } from "../core/NavComponents.js";
import { create_text_maker } from "../models/text.js";

import text from "./Survey.yaml";

const text_maker = create_text_maker(text);

export default class Survey extends React.Component {
  render() {
    return (
      <StandardRouteContainer
        title={text_maker("feedback_survey_title")}
        breadcrumbs={[text_maker("feedback_survey_title")]}
        route_key="_survey"
      >
        <h1>{text_maker("feedback_survey_title")}</h1>
        <EmailFrontend template_name="feedback" top_border={false} />
      </StandardRouteContainer>
    );
  }
}
