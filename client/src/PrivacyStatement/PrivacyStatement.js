import React from "react";

import { TextMaker } from "src/components/index.js";
import { StandardRouteContainer } from "src/core/NavComponents.js";
import { create_text_maker } from "src/models/text.js";

import privacy_text_bundle from "./PrivacyStatement.yaml";

const text_maker = create_text_maker(privacy_text_bundle);

export default class PrivacyStatement extends React.Component {
  render() {
    return (
      <StandardRouteContainer
        title={text_maker("privacy_title")}
        breadcrumbs={[text_maker("privacy_title")]}
        description={text_maker("privacy_body_text")}
        route_key="_privacy"
      >
        <div className="medium-panel-text text-only-page-root">
          <TextMaker
            text_maker_func={text_maker}
            el="div"
            text_key="privacy_body_text"
          />
        </div>
      </StandardRouteContainer>
    );
  }
}
