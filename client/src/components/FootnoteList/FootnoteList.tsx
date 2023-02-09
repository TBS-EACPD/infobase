import _ from "lodash";
import React from "react";

import { FancyUL } from "src/components/FancyUL/FancyUL";

import footnote_topic_text from "src/models/footnotes/footnote_topics.yaml";
import { is_subject_class, is_subject_instance,  } from "src/models/subjects";
import { create_text_maker } from "src/models/text";
import type {SubjectClassInstance} from 'src/models/subjects';
import type {TopicKey} from "src/models/footnotes/footnotes";
import { sanitized_dangerous_inner_html } from "src/general_utils";

import footnote_list_text from "./FootnoteList.yaml";
import "./FootnoteList.scss";
import { FootNoteDef } from "src/models/footnotes/footnotes";



const text_maker = create_text_maker([footnote_list_text, footnote_topic_text]);

const is_real_footnote = ({subject, topic_keys}: {subject: SubjectClassInstance, topic_keys: TopicKey[]}) =>
  _.isObject(subject) && !_.isEmpty(topic_keys)? true : false;

const FootnoteListSubtitle = ({ title }: {title: string}) => (
  <div className="footnote-list__subtitle">{title}</div>
);

const SubjectSubtitle = ({ subject }: {subject: SubjectClassInstance}) => {
  if (is_subject_instance(subject) && !_.isUndefined(subject.name)) {
    return (
      <FootnoteListSubtitle
        title={text_maker("subject_footnote_title", {
          subject_name: subject.name,
        })}
      />
    );
  } else if (is_subject_class(subject)) {
    return (
      <FootnoteListSubtitle
        title={text_maker("class_footnote_title", {
          subject_name: subject.subject_name,
        })}
      />
    );
  } else {
    // Should fail fast for standard footnote, since the route load tests include the footnote inventory.
    // Might not fail fast if ad-hoc fake footnotes are thrown in a FootnoteList in an obscure panel etc...
    throw new Error(
      `FootnoteList SubjectSubtitle's must be passed valid subject instances or subject classes. ${JSON.stringify(
        subject
      )} is neither.`
    );
  }
};

const years_to_plain_text = (year1:number, year2:number) => {
  if (year1 && year2 && year1 !== year2) {
    return text_maker("footnote_years", { year1, year2 });
  } else if (year1 || year2) {
    const year: number = year1 || year2;
    return text_maker("footnote_year", { year });
  }
};
const topic_keys_to_plain_text = (topic_keys: TopicKey[]) =>
  _.chain(topic_keys).map(text_maker).sort().uniq().value();

const FootnoteMeta = ({ meta_items }: {meta_items: any}) => (
  <div className={"footnote-list__meta_container"} aria-hidden={true}>
    {_.map(meta_items, (meta_item_text, ix) => (
      <div key={ix} className="footnote-list__meta_item tag-badge">
        {meta_item_text}
      </div>
    ))}
  </div>
);

const FootnoteSublist = ({ footnotes }: {footnotes: any}) => (
  <ul className="list-unstyled">
    {_.chain(footnotes)
      .uniqBy("text")
      .map(({ text, year1, year2, topic_keys, subject }: {text: string, year1: number, year2: number, topic_keys: TopicKey[], subject: SubjectClassInstance}, ix) => (
        <li key={`footnote_${ix}`} className={"footnote-list__item"}>
          <div
            className="footnote-list__note"
            dangerouslySetInnerHTML={sanitized_dangerous_inner_html(text)}
          />
          <FootnoteMeta
            meta_items={_.compact([
              years_to_plain_text(year1, year2),
              ...topic_keys_to_plain_text(topic_keys),
              subject && is_subject_instance(subject) && subject.name,
              subject &&
                is_subject_instance(subject) &&
                _.get(subject, "dept.name"),
            ])}
          />
        </li>
      ))
      .value()}
  </ul>
);

// sortBy is stable, so sorting by properties in reverse importance order results in the desired final ordering
// note: not sorting by subject, expect that sorting/grouping to happen elsewhere, this is just footnote metadata sorting
const sort_footnotes = (footnotes: any) =>
  _.chain(footnotes)
    .sortBy(({ topic_keys }: {topic_keys:TopicKey[]}) =>
      _.chain(topic_keys).thru(topic_keys_to_plain_text).join(" ").value()
    )
    .sortBy(({ topic_keys }) => -topic_keys.length)
    .sortBy(({ year1, year2 }: {year1: number,year2: number}) => -(year2 || year1 || Infinity))
    .value();

const group_and_sort_footnotes = (footnotes: any) =>
  _.chain(footnotes)
    .groupBy(({ subject }: {subject: SubjectClassInstance}) => {
      const { id, name, subject_type } = subject;

      const subject_type_sort_importance = (() => {
        switch (subject_type) {
          case "gov":
            return 1;
          case "dept":
            return 2;
          case "crso":
            return 3;
          case "program":
            return 4;
          default:
            return 999;
        }
      })();

      return `${subject_type_sort_importance}_${
        is_subject_instance(subject) ? `${name}_${id}` : "AAAA"
      }`;
    })
    .map((grouped_footnotes, group_name) => {
      return [grouped_footnotes, group_name];
    })
    .sortBy(_.last)
    .map(([grouped_footnotes]) => sort_footnotes(grouped_footnotes))
    .value();

const FootnoteList = ({ footnotes }: {footnotes: any[]}) => {
  const { true: real_footnotes, false: fake_footnotes } = _.groupBy(
    footnotes,
    is_real_footnote
  );

  const { true: class_wide_footnotes, false: instance_specific_footnotes } =
    _.groupBy(real_footnotes, ({ subject }) => is_subject_class(subject));

  const class_footnotes_grouped_and_sorted =
    group_and_sort_footnotes(class_wide_footnotes);
  const instance_footnotes_grouped_and_sorted = group_and_sort_footnotes(
    instance_specific_footnotes
  );

  return (
    <div className={"footnote-list"}>
      <FancyUL>
        {[
          ..._.chain(class_footnotes_grouped_and_sorted)
            .concat(instance_footnotes_grouped_and_sorted)
            .map((footnotes, ix) => (
              <div key={`${ix}`}>
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
