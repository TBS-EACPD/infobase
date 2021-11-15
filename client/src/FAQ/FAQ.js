import _ from "lodash";
import React from "react";

import {
  LabeledTable,
  create_text_maker_component,
  FancyUL,
} from "src/components/index";

import { faqStore } from "src/models/faq";

import {
  StandardRouteContainer,
  ScrollToTargetContainer,
} from "src/core/NavComponents";

import text from "./FAQ.yaml";

import "./FAQ.scss";

const { text_maker, TM } = create_text_maker_component(text);

const FAQIndex = () => (
  <FancyUL
    className="faq-index"
    title={text_maker("jump_to_question")}
    TitleComponent={({ children }) => (
      <h2 className="heading-unstyled">{children}</h2>
    )}
  >
    {_.map(faqStore.get_all(), ({ id, question }) => (
      <a key={id} href={`#faq/${id}`} title={text_maker("jump_to_question")}>
        {question}
      </a>
    ))}
  </FancyUL>
);

const FAQTable = () => (
  <LabeledTable
    title={text_maker("faq_title")}
    TitleComponent={({ children }) => (
      <h2 className="heading-unstyled">{children}</h2>
    )}
    contents={_.map(faqStore.get_all(), ({ id, question, answer }) => ({
      id: id,
      label: question,
      content: <div dangerouslySetInnerHTML={{ __html: answer }} />,
    }))}
  />
);

export default class FAQ extends React.Component {
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
          <div className="medium-panel-text">
            <FAQIndex />
            <FAQTable />
          </div>
        </ScrollToTargetContainer>
      </StandardRouteContainer>
    );
  }
}
