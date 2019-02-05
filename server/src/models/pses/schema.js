import _ from 'lodash';
import { en_fr } from '../schema_utils';

const schema = `
  extend type Root {
    pses_questions : [PsesQuestion]
  }
  extend type Org {
    pses_data(year: String, question: String): [ PsesRecord ]
  }
  extend type Gov {
    pses_data(year: String, question: String): [ PsesRecord ]
  }
  type PsesRecord {
    year: String
    answer1: Int
    answer2: Int
    answer3: Int
    answer4: Int
    answer5: Int
    answer6: Int
    answer7: Int
    positive: Int
    neutral: Int
    negative: Int
    agree: Int
    average_1_to_5: Float
    average_percent: Float
    answer_count: Int

    question: PsesQuestion

  }

  type PsesQuestion {
    id: String
    name: String
    positive: [ Int ]
    neutral: [ Int ]
    negative: [ Int ]
    agree: [ Int ]
    type: String
  }
`


export default function({models}){

  const { PsesQuestion, PsesData, PsesOrg } = models;

  async function pses_data_resolver(org, {year,question}){
    let records;
    if(org.id === "gov"){
      records = PsesData.get_by_dept_code(org.dept_code);
    } else {
      records = PsesData.get_gov();
    }
    
    if(year){
      records = _.filter(records, { year })
    }

    if(question){
      records = _.filter(records, { question_id: question })
    }
    
    return records;
  }

  const resolvers = {
    Root: { pses_questions: () => PsesQuestion.get_all() },
    Org: { pses_data: pses_data_resolver },
    Gov: { pses_data: pses_data_resolver },
    PsesRecord: {
      question: ({question_id}) => PsesQuestion.get_by_id(question_id),
    },
    PsesQuestion: {
      name: en_fr("name_en","name_fr"),
    },
  };


  return {
    schema,
    resolvers,
  };
}