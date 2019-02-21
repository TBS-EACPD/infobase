import about_text_bundle from "./about.yaml";
import './about.scss';
import '../gen_expl/explorer-styles.scss';
import { StandardRouteContainer } from '../core/NavComponents.js';
import { TextMaker } from '../util_components.js';
import { create_text_maker } from '../models/text.js';

const custom_tm = create_text_maker(about_text_bundle);

export default class About extends React.Component {
  render(){
    return (
      <StandardRouteContainer
        title={custom_tm("about_title")}
        breadcrumbs={[custom_tm("about_title")]}
        //description={} TODO
        route_key="_about"
      >
        <div className="medium_panel_text text-only-page-root">
          <TextMaker text_maker_func={custom_tm} el="div" text_key="about_body_text" />
        </div>
      </StandardRouteContainer>
    );
  }
};