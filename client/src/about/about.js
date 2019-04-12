import about_text_bundle from "./about.yaml";
import './about.scss';
import '../gen_expl/explorer-styles.scss';
import { StandardRouteContainer } from '../core/NavComponents.js';
import { TM } from '../util_components.js';
import { create_text_maker } from '../models/text.js';
import { LabeledTable } from '../components/LabeledTable.js'

const text_maker = create_text_maker(about_text_bundle);

export default class About extends React.Component {
  render(){
    return (
      <StandardRouteContainer
        title={text_maker("about_title")}
        breadcrumbs={[text_maker("about_title")]}
        //description={} TODO
        route_key="_about"
      >
        <div className="medium_panel_text text-only-page-root">
          <TM tmf={text_maker} el="h1" k="about_sub_title" />
          <TM tmf={text_maker} el="div" k="about_intro_section" />
          <LabeledTable title={text_maker("principles_title")} content={[{name: "name1", desc: "desc1"},{name: "name1", desc: "desc1"},{name: "name1", desc: "desc1"}]} />
        </div>
      </StandardRouteContainer>
    );
  }
};