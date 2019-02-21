import privacy_text_bundle from "./PrivacyStatement.yaml";
import { StandardRouteContainer } from '../core/NavComponents.js';
import { TextMaker } from '../util_components.js';
import { create_text_maker } from '../models/text.js';

const text_maker = create_text_maker(privacy_text_bundle);

export default class PrivacyStatement extends React.Component {
  render(){
    return (
      <StandardRouteContainer
        title={text_maker("privacy_title")}
        breadcrumbs={[text_maker("privacy_title")]}
        //description={} TODO  
        route_key="_privacy"
      >
        <div className="medium_panel_text text-only-page-root">
          <TextMaker text_maker_func={text_maker} el="div" text_key="privacy_body_text" />
        </div>
      </StandardRouteContainer>
    );
  }
};