import contact_us_bundle from "./contact.yaml"
import { StandardRouteContainer } from "../core/NavComponents.js";
import { TM } from '../components/index.js'
import { create_text_maker } from "../models/text.js";

const text_maker = create_text_maker(contact_us_bundle)

export default class Contact extends React.Component {
  render() {
    console.log("tes")
    return (
      <StandardRouteContainer
        title={text_maker("contact_us_title")}
        breadcrumbs={[text_maker("contact_us_title")]}
        description={text_maker("contact_us_intro")}
        route_key="_contact"
      >
        <div className="medium_panel_text text-only-page-root">
          <TM tmf={text_maker} el="h1" k="contact_us_title"/>
          <TM tmf={text_maker} el="div" k="contact_us_intro"/>
          <TM tmf={text_maker} el="h2" k="general_enquiries_title"/>
          <TM tmf={text_maker} el="div" k="general_enquiries_sub_text_1"/>
          <TM tmf={text_maker} el="div" k="general_enquiries_sub_text_2"/>
          <TM tmf={text_maker} el="div" k="general_enquiries_sub_text_3"/>
          <TM tmf={text_maker} el="div" k="general_enquiries_sub_text_4"/>
        </div>
      </StandardRouteContainer>
    );
  }
}
