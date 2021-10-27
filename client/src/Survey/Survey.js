import React from "react";

import { create_text_maker } from "src/models/text";

import { StandardRouteContainer } from "src/core/NavComponents";

import { FormFrontend } from "src/FormFrontend";

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
        <FormFrontend template_name="feedback" top_border={false} />
      </StandardRouteContainer>
    );
  }
}
