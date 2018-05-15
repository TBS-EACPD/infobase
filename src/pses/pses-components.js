
import { Format } from '../util_components.js';
import './pses-components.scss';
import gql from 'graphql-tag';
import { Fragment } from 'react';

/*
  layout + BEM-components :
  .question-grid
    .question-row
      .question-cell
        .QuestionDef 
      .question-cell
        .QuestionDataVis

*/


const get_num_from_str = /\d+/;
function getQuestionLabels(q_id){
  const num = Number(_.first(get_num_from_str.exec(q_id)))
  if(num < 12){
    return [ "Strongly Disagree", "Strongly Agree" ];
  } else if(num === 12){
    return [ "Very Low", "Very High" ];
  } else if(num===13){
    return [ "Strongly Agree", "Strongly Disagree" ];
  }
}

const QuestionDataVis = ({ org_data, gov_data, acronym, question_id }) => (
  <div className="QuestionDataVis">
    <div>
      { 
        null && (
        org_data.pct_agree === org_data.pct_negative ?
        <div style={{color:'red'}}> <Format type="percentage1" content={org_data.pct_agree} /> agree </div> :
        <div style={{color:'green'}}> <Format type="percentage1" content={org_data.pct_agree} /> agree </div>
        )
      }
    </div>
    <div>
      <GradientBar
        series={[
          { val: org_data.average_1_to_5/5.0, name: acronym },
          { val: gov_data.average_1_to_5/5.0, name: "FPS", isLabelBelow: true},
        ]} 
        startsPositive={org_data.pct_agree !== org_data.pct_negative} 
        height="50px"
        width="400px"
        labels={getQuestionLabels(question_id)}
      />
    </div> 
  </div>
);

const QuestionDef = ({ name, id }) => (
  <div className="QuestionDef">
    {name} 
  </div>
);


export const QuestionGrid = ({ data: { questions, acronym } }) => <div className="question-grid">
  {_.map(questions, ({ name, id, org_data, gov_data }) => 
    <div key={id} className="question-row">
      <div className="question-cell question-cell-left">
        <QuestionDef name={name} />
      </div>
      <div className="question-cell question-cell-right">
        <QuestionDataVis
          acronym={acronym}
          org_data={org_data}
          gov_data={gov_data}
          question_id={id}
        />
      </div>
    </div>
  )}
</div>




const fragments = gql`
  fragment question_data on PsesRecord {
    question {
      id
    }
    positive
    negative
    neutral
    agree
    demcode
    answer_count
    average_1_to_5
    
  }
`;

const query = gql`
  query {
    root(lang: "en"){
      pses_questions {
        name
        id
        type
      }

      org	(org_id:"133") {
        acronym
        pses_data(year: "2017"){
          ...question_data
        }
      }

      gov {
        pses_data(year: "2017"){
          ...question_data
        }
      }
    }
  }
  ${fragments}
  
`;

const to_answer_data = obj => ({
  average_1_to_5: obj.average_1_to_5,
  pct_positive: obj.positive/100,
  pct_negative: obj.negative/100,
  pct_neutral: obj.neutral/100,
  pct_agree: obj.agree/100,
});

const data_to_props = ({ root: {
  pses_questions: question_metadata, 
  org: { 
    acronym,
    pses_data: org_questions,
  },
  gov: {
    pses_data: gov_questions,
  },
}})=> {

  const joined_questions = _.chain(question_metadata)
    .filter({type:"numeric"})
    .map( ({id, name}) => ({
      id,
      name,
      org_data: to_answer_data(_.find(org_questions, record => record.question.id === id)),
      gov_data: to_answer_data(_.find(gov_questions, record => record.question.id === id)),
    }))
    .value(); 

  return {
    questions: joined_questions,
    acronym,
  };
}


const GradientBar = ({ series, startsPositive, height, width, labels }) => {
  const [ leftLabel, rightLabel ] = labels;

  return (
    <div style={{padding:"40px"}}>
      <div 
        style={{
          display: "flex",
          justifyContent: "stretch",
          alignItems: "stretch",
          height,
          width,
        }}
      > 
        <div
          style={{
            backgroundImage: `linear-gradient(${startsPositive ? "to right" : "to left"}, rgba(255, 0, 0, 0.6), hsla(0, 0%, 70%, 0.6), rgba(0, 128, 0, 0.6))`,
            position:"relative",
            display: "flex",
            alignItems:"stretch",
            flexBasis: "100%",
          }}
        >
          <div
            key="left-label"
            style={{
              position:"absolute",
              left: "0%",
              top: "50%",
              fontSize: "1rem",
              transform: `translate(-110%,-50%)`,
              width: "40px",
              textAlign: "right",
            }}
          >
            { leftLabel }
          </div>
          <div
            key="right-label"
            style={{
              position:"absolute",
              right: "0%",
              top: "50%",
              fontSize: "1rem",
              transform: `translate(110%, -50%)`,
              width: "40px",
              textAlign: "left",
            }}
          >
            { rightLabel }
          </div>
          {series.map( ({val,name, isLabelBelow },ix) => 
            <Fragment key={ix}> 
              {name && 
              <div style={{
                position:"absolute",
                top: isLabelBelow ? "120%" : "-30%",
                left: `${ (val*100) - 5}%`,
                fontweight: "bold",
                fontSize: "1rem",
                textAlign: "center",
                transform: `translate(50%, -30%)`,
              }}
              >
                {name}
              </div>
              }
              <div style={{
                position:"absolute",
                width: "2px",
                backgroundColor: "#333",
                left: `${val*100}%`,
                height: "120%",
                top: "-10%",
              }}
              />
            </Fragment>)}
        </div>
      </div>
    </div>
  );
}

export const QuestionGridConfig = {
  query,
  Component: QuestionGrid,
  data_to_props,
};
