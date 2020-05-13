import text from "./Faq.yaml";
import "../explorer_common/explorer-styles.scss";
import { StandardRouteContainer } from "../core/NavComponents.js";
import { LabeledTable, create_text_maker_component } from "../components";

const { text_maker, TM } = create_text_maker_component(text);

const qa_keys = [
  "data_source",
  "open_source",
  "tools",
  "infographic_tools",
  "creation",
  "update_freq",
  "raw_data",
  "older_data",
  "people_data_exemptions",
  "spending_types",
  "fte_levels",
  "tagging_scheme",
  "contact",
];

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
            content={_.map(qa_keys, (qa_key) => ({
              name: text_maker(`${qa_key}_q`),
              desc: <TM k={`${qa_key}_a`} />,
            }))}
          />
        </div>
      </StandardRouteContainer>
    );
  }
}
