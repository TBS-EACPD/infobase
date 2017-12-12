import { Format } from '../util_components.js';
import './pses-components.scss';
/*
  layout + BEM-components :
  .question-grid
    .question-row
      .question-cell
        .QuestionDef 
      .question-cell
        .QuestionDataVis


*/


export const QuestionGrid = ({ questions }) => <div className="question-grid">
  {_.map(questions, ({ question, answer_data}) => 
    <div key={question.id} className="question-row">
      <div className="question-cell">
        <QuestionDef {...question} />
      </div>
      <div className="question-cell">
        <QuestionDataVis {...answer_data} />
      </div>
    </div>
  )}
</div>

export const QuestionDataVis = ({ pct_agree, pct_positive, pct_negative }) => (
  <div className="QuestionDataVis">
    { 
      pct_agree === pct_negative ?
      <div style={{color:'red'}}> <Format type="percentage1" content={pct_agree} /> </div> :
      <div style={{color:'green'}}> <Format type="percentage1" content={pct_agree} /> </div>
    } 
  </div>
);

export const QuestionDef = ({ name, id,  }) => <div className="QuestionDef">
  {name} 
</div>;
