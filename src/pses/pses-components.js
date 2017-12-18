
import { Format } from '../util_components.js';
import './pses-components.scss';
import gql from 'graphql-tag';


const numeric_questions = [
  "Q01",
  "Q02",
  "Q03",
  "Q04",
  "Q05",
  "Q06",
  "Q07",
  "Q08",
  "Q09",
  "Q10",
  "Q11",
  "Q12",
  "Q13",
];

/*
  layout + BEM-components :
  .question-grid
    .question-row
      .question-cell
        .QuestionDef 
      .question-cell
        .QuestionDataVis


*/

const QuestionDataVis = ({ pct_agree, pct_positive, pct_negative }) => (
  <div className="QuestionDataVis">
    { 
      pct_agree === pct_negative ?
      <div style={{color:'red'}}> <Format type="percentage1" content={pct_agree} /> </div> :
      <div style={{color:'green'}}> <Format type="percentage1" content={pct_agree} /> </div>
    } 
  </div>
);

const QuestionDef = ({ name, id,  }) => (
  <div className="QuestionDef">
    {name} 
  </div>
);


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




const fragments = gql`
  fragment questions_2017 on Org {
    questions_2017: pses_data(year:"2017"){
      question {
        id,
        name: name_en
        agree
        type
      }
      positive
      negative
      neutral
      agree
      demcode
      answer_count
      average_1_to_5
      average_percent
    }
  }
`;

const query = gql`
  query RandomQueryName {
    org	(org_id:"326") {
      name
      ...questions_2017
    } 
  }
  ${fragments}
`;

const data_to_props = ({
  org: { 
    questions_2017,
  },
})=> ({
  questions: _.chain(questions_2017)
    .filter( obj => obj.question.type === "numeric")
    .sortBy( ({question: {id}}) => _.indexOf(numeric_questions, id) )
    .map(obj =>({
      question: obj.question,
      answer_data: {
        average_1_to_5: obj.average_1_to_5,
        pct_positive: obj.positive/100,
        pct_negative: obj.negative/100,
        pct_neutral: obj.neutral/100,
        pct_agree: obj.agree/100,
      },
    }))
    .value(),
})

export const QuestionGridConfig = {
  query,
  Component: QuestionGrid,
  data_to_props,
};
