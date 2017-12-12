import { storiesOf } from '@storybook/react';
import React from 'react';
import { setupGraphiQL } from '@storybook/addon-graphql'

import { QuestionGrid } from './pses/pses-components.js';

const api_url = "http://localhost:1337";
function fetcher(query){
  return fetch( api_url,{
    mode: 'cors',
    method: "POST",
    body: JSON.stringify(query),
    headers: { 'Content-Type': 'application/json' },
  })
    .then(resp=>resp.text())
    .then(json => JSON.parse(json))
}

class LoaderHOC extends React.Component {
  constructor(){
    super()
    this.state = {
      loading: true,
    }
  }
  componentDidMount(){
    const { query } = this.props;
    fetcher({query}).then(data=>{
      this.setState({
        loading:false,
        query_data: data,
      });
    });
  }
  render(){
    const {  data_to_props, Component } = this.props;
    const {  loading, query_data } = this.state;
    if(loading){
      return "loading...";
    } else {
      return <Component {...data_to_props(query_data)} />
    }
  }
}

const graphiql = setupGraphiQL({fetcher});

storiesOf('GraphiQL',module)
  .add('with a graphiQL component', graphiql(`{
    org(dept_code:"AGR"){
      name
    }
  }`));

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
storiesOf('pses_components',module)
  .add('pses_question_grid', ()=>
    <LoaderHOC
      query={`
        query {
          org	(org_id:"326") {
            name
            ...questions_2017
          } 
        }
        
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
      `}
      Component={props=> 
        <div 
          style={{
            maxWidth: "600px",
            
          }}
        >
          <QuestionGrid {...props} />
        </div>
      }
      data_to_props={({
        data: { org: { questions_2017 } }
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
      })}
    />
  );
