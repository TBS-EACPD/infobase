import "./FootnoteList.scss";
import text from "./FootnoteList.yaml";

import { sanitized_dangerous_inner_html } from "../general_utils.js";

import { FancyUL } from "./FancyUL.js";
import { create_text_maker_component } from "./misc_util_components.js";

const { text_maker } = create_text_maker_component(text);

const FootnoteListSubtitle = ({ title }) => <div>{title}</div>; // styling TODO

const SubjectSubtitle = ({ subject }) => {
  // classes don't exist in IE, which we transpile for, so can't actually test if an object is a class
  // or an instance of a class the reasonable way. Working from the assumption that subject instances must
  // have id's and subject classes must not
  // Also asserting that the name properties we want to use in the title text exists
  const is_subject_instance =
    !_.isUndefined(subject.id) && !_.isUndefined(subject.name);
  const is_subject_class =
    _.isUndefined(subject.id) && !_.isUndefined(subject.singular);

  if (is_subject_instance) {
    return (
      <FootnoteListSubtitle
        title={text_maker("subject_footnote_title", {
          subject_name: subject.name,
        })}
      />
    );
  } else if (is_subject_class) {
    return (
      <FootnoteListSubtitle
        title={text_maker("global_footnote_title", {
          subject_name: subject.singular,
        })}
      />
    );
  } else {
    // if this gets thrown, it's likely to be caught in prod. We'd have other problems if there were malformed subjects floating
    // about though
    throw new Error(
      `FootnoteList SubjectSubtitle's must be passed valid subject instances or subject classes. ${JSON.stringify(
        subject
      )} is neither.`
    );
  }
};

const FootnoteSublist = ({ footnotes }) => (
  <ul className="list-unstyled">
    {_.chain(footnotes)
      .uniqBy("text")
      .map(({ text }, ix) => (
        <li
          key={`footnote_${ix}`}
          className={"footnote-list__note"}
          dangerouslySetInnerHTML={sanitized_dangerous_inner_html(text)}
        />
      ))
      .value()}
  </ul>
);

const FootnoteList = ({ footnotes }) => {
  const { true: real_footnotes, false: fake_footnotes } = _.groupBy(
    footnotes,
    ({ subject, topic_keys }) => _.isObject(subject) && !_.isEmpty(topic_keys)
  );

  return (
    <div className={"footnote-list"}>
      <FancyUL>
        {[
          ..._.chain(real_footnotes)
            .groupBy("subject.id")
            .map((footnotes, subject_id) => (
              <div key={`${subject_id}`}>
                <SubjectSubtitle subject={footnotes[0].subject} />
                <FootnoteSublist footnotes={footnotes} />
              </div>
            ))
            .value(),
          !_.isEmpty(fake_footnotes) && (
            <div key={"other"}>
              <FootnoteListSubtitle title={text_maker("other")} />
              <FootnoteSublist footnotes={footnotes} />
            </div>
          ),
        ]}
      </FancyUL>
    </div>
  );
};

export { FootnoteList };
