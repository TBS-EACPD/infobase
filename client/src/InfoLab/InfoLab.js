import React from "react";

import { IconDPs, IconTime } from "src/icons/icons";

import {
  create_text_maker_component,
  CardLeftImage,
} from "../components/index.js";
import { StandardRouteContainer } from "../core/NavComponents.js";
import { create_text_maker } from "../models/text.js";

import lab_text from "./InfoLab.yaml";
import "./InfoLab.scss";

const { TM } = create_text_maker_component(lab_text);
const text_maker = create_text_maker(lab_text);

export default class InfoLab extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { toggleSurvey } = this.props;

    return (
      <StandardRouteContainer
        title={text_maker("lab_title")}
        breadcrumbs={[text_maker("lab_title")]}
        description={text_maker("lab_intro_text")}
        route_key="_lab"
        beta={true}
      >
        <TM k="lab_title" el="h1" />
        <div className="medium-panel-text">
          <TM k="lab_intro_text" />
          <button
            style={{ marginBottom: "2rem" }}
            className="btn btn-ib-primary"
            onClick={() => toggleSurvey()}
          >
            {text_maker("lab_intro_survey_button")}
          </button>
        </div>
        <div className="frow">
          <div className="fcol-md-6 fcol-sm-12">
            <div className="lab-content">
              <CardLeftImage
                tmf={text_maker}
                svg={
                  <IconDPs
                    width="100%"
                    color="#FFFFFF"
                    alternate_color={false}
                  />
                }
                title_key="text_diff_lab_title"
                text_key="text_diff_lab_text"
                link_key="link_text"
                link_href="#diff"
              />
            </div>
          </div>
          <div className="fcol-md-6 fcol-sm-12">
            <div className="lab-content">
              <CardLeftImage
                tmf={text_maker}
                svg={
                  <IconTime
                    width="100%"
                    color="#FFFFFF"
                    alternate_color={false}
                  />
                }
                title_key="coming_soon_title"
                text_key="coming_soon_text"
              />
            </div>
          </div>
        </div>
      </StandardRouteContainer>
    );
  }
}
