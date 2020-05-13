import "./Faq.scss";
import text from "./Faq.yaml";

import {
  StandardRouteContainer,
  ScrollToTargetContainer,
} from "../core/NavComponents.js";
import {
  LabeledTable,
  create_text_maker_component,
  FancyUL,
} from "../components";

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

const FaqIndex = () => (
  <FancyUL ul_class="faq-index">
    {[
      <TM
        key="jump_to_question"
        k="jump_to_question"
        el="h2"
        style={{ margin: "0px", textAlign: "center" }}
      />,
      ..._.map(qa_keys, (qa_key) => (
        <a
          key={qa_key}
          href={`#faq/${qa_key}`}
          title={text_maker("jump_to_question")}
        >
          {text_maker(`${qa_key}_q`)}
        </a>
      )),
    ]}
  </FancyUL>
);

const FaqTable = () => (
  <LabeledTable
    title={text_maker("faq_title")}
    content={_.map(qa_keys, (qa_key) => ({
      name: <div id={qa_key}>{text_maker(`${qa_key}_q`)}</div>,
      desc: <TM k={`${qa_key}_a`} />,
    }))}
  />
);

export default class Faq extends React.Component {
  render() {
    const {
      match: {
        params: { selected_qa_key },
      },
    } = this.props;

    return (
      <StandardRouteContainer
        title={text_maker("faq_page_title")}
        breadcrumbs={[text_maker("faq_page_title")]}
        description={text_maker("faq_page_description")}
        route_key="_faq"
      >
        <TM tmf={text_maker} el="h1" k="faq_page_title" />
        <ScrollToTargetContainer target_id={selected_qa_key}>
          <div className="medium_panel_text text-only-page-root">
            <FaqIndex />
            <FaqTable />
          </div>
        </ScrollToTargetContainer>
      </StandardRouteContainer>
    );
  }
}
