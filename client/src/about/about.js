import about_text_bundle from "./about.yaml";
import './about.scss';
import '../gen_expl/explorer-styles.scss';
import { StandardRouteContainer } from '../core/NavComponents.js';
import { TM } from '../util_components.js';
import { create_text_maker } from '../models/text.js';
import { LabeledTable } from '../components/LabeledTable.js'
import { IconGrid } from '../components/IconGrid.js'
import { get_static_url } from '../request_utils.js';


const text_maker = create_text_maker(about_text_bundle);

const tech_icon_list = _.chain(['html5','node-js','react','git','github','python','sass','graphql','django'])
  .map(tech => get_static_url(`svg/tech-logos/${tech}.svg`))
  .map(svg => ({src: svg}))
  .value();

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
          <TM tmf={text_maker} el="h1" k="about_page_title" />
          <TM tmf={text_maker} el="div" k="about_intro_section" />
          <LabeledTable title={text_maker("principles_title")} content={[
            {name: text_maker("principle_1_name"), desc: text_maker("principle_1_desc")},
            {name: text_maker("principle_2_name"), desc: text_maker("principle_2_desc")},
            {name: text_maker("principle_3_name"), desc: text_maker("principle_3_desc")},
            {name: text_maker("principle_4_name"), desc: text_maker("principle_4_desc")},
          ]} />
          <TM tmf={text_maker} el="h2" k="our_story_title" />
          <TM tmf={text_maker} el="h3" k="our_story_sub_title_1" />
          <TM tmf={text_maker} el="div" k="our_story_sub_text_1" />
          <TM tmf={text_maker} el="h3" k="our_story_sub_title_2" />
          <TM tmf={text_maker} el="div" k="our_story_sub_text_2" />
          <TM tmf={text_maker} el="h2" k="our_data_title" />
          <TM tmf={text_maker} el="h3" k="our_data_sub_title_1" />
          <TM tmf={text_maker} el="div" k="our_data_sub_text_1" />
          <TM tmf={text_maker} el="h3" k="our_data_sub_title_2" />
          <TM tmf={text_maker} el="div" k="our_data_sub_text_2" />
          <TM tmf={text_maker} el="h3" k="our_data_sub_title_3" />
          <TM tmf={text_maker} el="div" k="our_data_sub_text_3" />
          <TM tmf={text_maker} el="h2" k="behind_scenes_title" />
          <TM tmf={text_maker} el="h3" k="behind_scenes_sub_title_1" />
          <IconGrid icons={tech_icon_list} />
          <TM tmf={text_maker} el="div" k="behind_scenes_sub_text_1" />
          <TM tmf={text_maker} el="h3" k="behind_scenes_sub_title_2" />
          <TM tmf={text_maker} el="div" k="behind_scenes_sub_text_2" />
          <TM tmf={text_maker} el="h3" k="behind_scenes_sub_title_3" />
          <TM tmf={text_maker} el="div" k="behind_scenes_sub_text_3" />
          <TM tmf={text_maker} el="h2" k="feedback_title" />
          <TM tmf={text_maker} el="div" k="feedback_text" />
        </div>
      </StandardRouteContainer>
    );
  }
};