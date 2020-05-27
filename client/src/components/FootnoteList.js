import "./FootnoteList.scss";
import text from "./FootnoteList.yaml";

import { sanitized_dangerous_inner_html } from "../general_utils.js";

import {
  FancyUL,
  create_text_maker_component,
} from "./misc_util_components.js";

const { text_maker } = create_text_maker_component(text);

const FootnoteListSubtitle = ({ title }) => <div>{title}</div>; // styling TODO

const SubjectSubtitle = ({ subject }) => {
  const is_subject_instance = !_.isUndefined(subject.id);

  const is_subject_class =
    _.isUndefined(subject.id) && !_.isUndefined(subject.type_name);

  if (is_subject_instance) {
    return (
      <FootnoteListSubtitle
        title={text_maker("subject_footnote_title", subject)}
      />
    );
  } else if (is_subject_class) {
    return (
      <FootnoteListSubtitle
        title={text_maker("global_footnote_title", subject)}
      />
    );
  } else {
    // TODO hmm, throw an error or just use a default title? Wouldn't be a very fast failing error, likely
    // to be caught in production if I do throw it
    // ... guess loading all footnotes through the footnote route (that still alive?) during route load tests
    // would catch it
    return <div />;
  }
};

const FootnoteItem = ({ text }) => (
  <div
    className={"footnote-list__note"}
    dangerouslySetInnerHTML={sanitized_dangerous_inner_html(text)}
  />
);

const FootnoteList = ({ footnotes }) => {
  const { true: real_footnotes, false: fake_footnotes } = _.groupBy(
    footnotes,
    ({ subject, topic_keys }) => _.isObject(subject) && !_.isEmpty(topic_keys)
  );

  const include_subject_subtitles = _.chain(real_footnotes)
    .map("subject.id")
    .uniq()
    .thru((subject_ids) => subject_ids.length > 1)
    .value();

  const include_other_subtitle =
    !_.isEmpty(real_footnotes) && !_.isEmpty(fake_footnotes);

  return (
    <div className={"footnote-list"}>
      <FancyUL>
        {[
          ..._.chain(real_footnotes)
            .groupBy("subject.id")
            .flatMap((footnotes, subject_id) => [
              include_subject_subtitles && (
                <SubjectSubtitle
                  subject={footnotes[0].subject}
                  key={`${subject_id}_title`}
                />
              ),
              ..._.chain(footnotes)
                .uniqBy("text")
                .map(({ text }, ix) => (
                  <FootnoteItem
                    text={text}
                    key={`${subject_id}_footnote_${ix}`}
                  />
                ))
                .value(),
            ])
            .value(),
          include_other_subtitle && (
            <FootnoteListSubtitle
              title={text_maker("other")}
              key={"other_title"}
            />
          ),
          ..._.chain(fake_footnotes)
            .uniqBy("text")
            .map(({ text }, ix) => (
              <FootnoteItem key={ix} text={text} key={`other_footnote_${ix}`} />
            ))
            .value(),
        ]}
      </FancyUL>
    </div>
  );
};

export { FootnoteList };
