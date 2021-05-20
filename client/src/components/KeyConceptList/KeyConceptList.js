import _ from "lodash";
import React, { Fragment } from "react";

import { Details } from "./Details/Details";
import "./KeyConceptList.scss";

interface KeyConceptListProps {
  question_answer_pairs: [React.ReactElement, React.ReactElement][];
  compact: boolean;
}

const KeyConceptList = ({
  question_answer_pairs,
  compact = true,
}: KeyConceptListProps) => (
  <div>
    <div>
      {_.map(question_answer_pairs, ([question, answer], ix) => (
        <div key={ix}>
          {!compact && (
            <Fragment>
              <div className="key_concept_term">{question}</div>
              <div className="key_concept_def">{answer}</div>
            </Fragment>
          )}
          {compact && (
            <div className="key_concept_def">
              <Details summary_content={question} content={answer} />
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

export { KeyConceptList };
