import React from "react";

import { TM } from "src/components/index";

import { create_text_maker } from "src/models/text";

import { StandardRouteContainer } from "src/core/NavComponents";

import contact_us_bundle from "./contact.yaml";

const text_maker = create_text_maker(contact_us_bundle);

interface ContactProps {
  toggleSurvey: () => void;
}

export default class Contact extends React.Component<ContactProps, never> {
  render() {
    const { toggleSurvey } = this.props;

    return (
      <StandardRouteContainer
        title={text_maker("contact_us_title")}
        breadcrumbs={[text_maker("contact_us_title")]}
        description={text_maker("contact_us_intro")}
        route_key="_contact"
      >
        <div className="medium-panel-text text-only-page-root">
          <TM tmf={text_maker} el="h1" k="contact_us_title" />
          <TM tmf={text_maker} el="div" k="contact_us_intro" />
          <TM tmf={text_maker} el="h2" k="feedback_title" />
          <TM tmf={text_maker} el="div" k="feedback_text" />
          <button onClick={() => toggleSurvey()} className="btn btn-ib-primary">
            {text_maker("survey")}
          </button>
          <TM tmf={text_maker} el="h2" k="general_enquiries_title" />
          <TM tmf={text_maker} el="div" k="general_enquiries_text" />
          <TM tmf={text_maker} el="div" k="general_enquiries_contact" />
          <TM tmf={text_maker} el="div" k="general_enquiries_social_media" />
          <TM tmf={text_maker} el="div" k="general_enquiries_address" />
        </div>
      </StandardRouteContainer>
    );
  }
}
