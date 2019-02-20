const question_index_query = `
  query {
    root(lang:"en"){
      pses_questions{
        id
        name
        
        positive
        neutral
        negative
        
        agree
        type
        
        
      }

    }
  }
`

const org_query = `
  query($dept_code: String) {
    root(lang:"en"){
      org(dept_code:$dept_code) {
        pses_data {
          year
          
          answer1
          answer2
          answer3
          answer4
          answer5
          answer6
          answer7
          
          positive
          neutral
          negative
          
          agree
          
          
          average_1_to_5
          average_percent
          answer_count
          question {
            id
          }
          
        }
      }
    }
  }
`

const { execQuery } = global;

describe("PSES data", function(){

  it("has an index of all questions", async ()=> {
    const data = await execQuery(question_index_query);
    return expect(data).toMatchSnapshot();
  });

  it("has survey data for an org", async ()=> {
    const data = await execQuery(org_query, {dept_code: "AGR"});
    return expect(data).toMatchSnapshot();
  });


})