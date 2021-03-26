import _ from "lodash";
import React, { Fragment } from "react";

import { Details } from "./Details.js";
import "src/common_css/grid-system.scss";

const KeyConceptList = ({ question_answer_pairs, compact = true }) => (
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
