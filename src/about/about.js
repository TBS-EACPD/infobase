import "./about.ib.yaml";
import './about.scss';

import { StandardRouteContainer } from '../core/NavComponents.js';

import { text_maker } from '../models/text';

import { TextMaker } from '../util_components.js';

export class About extends React.Component {
  render(){
    return (
      <StandardRouteContainer
        title={text_maker("about_title")}
        breadcrumbs={[text_maker("about_title")]}
        //description={} TODO
        route_key="_about"
      >
        <div className="medium_panel_text about-root">
          <TextMaker el="div" text_key="about_body_text" />
        </div>
      </StandardRouteContainer>
    );
  }
};