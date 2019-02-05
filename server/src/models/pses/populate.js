import _ from "lodash";
import {
  get_standard_csv_file_rows,
} from '../load_utils.js';


export default function({models}){

  const { PsesQuestion, PsesData } = models;

  const question_csv_records = get_standard_csv_file_rows('questions.csv');
  const pses_data_csv_records = get_standard_csv_file_rows('pseas.csv');

  const to_num = num => parseInt(num);
  const pses_question_records = _.map(question_csv_records, record => ({
    ...record,
    agree: _.split(record.agree,",").map(to_num),
    positive: _.split(record.positive,",").map(to_num),
    negative: _.split(record.negative,",").map(to_num),
    neutral: _.split(record.neutral,",").map(to_num),
  }));

  _.each(pses_question_records, record => PsesQuestion.register(record) );
  _.each(pses_data_csv_records, record => PsesData.register(record) );

}
