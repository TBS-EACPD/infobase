import text from "./Faq.yaml";
import "../explorer_common/explorer-styles.scss";
import { StandardRouteContainer } from "../core/NavComponents.js";
import { create_text_maker } from "../models/text.js";
import { LabeledTable } from "../components/LabeledTable.js";

const text_maker = create_text_maker(text);

export default class Faq extends React.Component {
  render() {
    return (
      <StandardRouteContainer
        title={text_maker("faq_page_title")}
        breadcrumbs={[text_maker("faq_page_title")]}
        description={text_maker("faq_page_description")}
        route_key="_faq"
      >
        <div className="medium_panel_text text-only-page-root">
          <LabeledTable
            title={text_maker("faq_title")}
            content={[
              {
                name: text_maker("data_source_q"),
                desc: text_maker("data_source_a"),
              },
              {
                name: text_maker("tools_q"),
                desc: text_maker("tools_a"),
              },
              {
                name: text_maker("open_source_q"),
                desc: text_maker("open_source_a"),
              },
            ]}
          />
        </div>
      </StandardRouteContainer>
    );
  }
}
