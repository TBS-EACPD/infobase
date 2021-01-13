import _ from "lodash";
import React, { Fragment } from "react";


import { Details } from "./Details.js";
import "../common_css/grid-system.scss";

const KeyConceptList = ({ question_answer_pairs, compact = true }) => (
  <div>
    <div className="lg-grid">
      {_.map(question_answer_pairs, ([question, answer], ix) => (
        <div key={ix} className="grid-row">
          {!compact && (
            <Fragment>
              <div className="lg-grid-panel30 key_concept_term">{question}</div>
              <div className="lg-grid-panel70 key_concept_def">{answer}</div>
            </Fragment>
          )}
          {compact && (
            <div className="lg-grid-panel100 key_concept_def">
              <Details summary_content={question} content={answer} />
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

export { KeyConceptList };
