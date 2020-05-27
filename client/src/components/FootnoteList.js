import "./FootnoteList.scss";

import { sanitized_dangerous_inner_html } from "../general_utils.js";

import {
  FancyUL,
  create_text_maker_component,
} from "./misc_util_components.js";

const { text_maker } = create_text_maker_component();

const FootnoteListSubtitle = ({ title }) => <div>{title}</div>; // styling TODO

const Footnote = ({ text }) => (
  <div
    className={"footnote-list__note"}
    dangerouslySetInnerHTML={sanitized_dangerous_inner_html(text)}
  />
);

const FootnoteList = ({ footnotes }) => {
  const { true: real_footnotes, false: fake_footnotes } = _.chain(footnotes)
    .uniqBy("text")
    .groupBy(
      footnotes,
      ({ subject, topic_keys }) => _.isObject(subject) && !_.isEmpty(topic_keys)
    )
    .value();

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
                <FootnoteListSubtitle
                  title={footnotes[0].subject.name}
                  key={`${subject_id}_title`}
                />
              ),
              ..._.map(footnotes, ({ text }, ix) => (
                <Footnote text={text} key={`${subject_id}_footnote_${ix}`} />
              )),
            ])
            .value(),
          include_other_subtitle && (
            <FootnoteListSubtitle
              title={text_maker("other")}
              key={"other_title"}
            />
          ),
          ..._.map(fake_footnotes, ({ text }, ix) => (
            <Footnote key={ix} text={text} key={`other_footnote_${ix}`} />
          )),
        ]}
      </FancyUL>
    </div>
  );
};

export { FootnoteList };
