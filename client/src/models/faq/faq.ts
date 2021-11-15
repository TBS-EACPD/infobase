import { make_store } from "src/models/utils/make_store";

type FAQDef = {
  id: string;
  question: string;
  answer: string;
};

const faqStore = make_store((def: FAQDef) => def);

export { faqStore };
