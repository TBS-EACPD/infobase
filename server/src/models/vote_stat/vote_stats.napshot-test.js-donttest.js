const org_query = `
query MyQuery($lang: String!, $dept_code: String!){
  root(lang: $lang){
    org(dept_code: $dept_code){
      name
      pa_vote_stat {
        data(year: pa_last_year) {
          year
          auth
          exp
          vote_num
          vs_type
          name
        }
        info {
          yearly_totals {
            auth
            exp
            year
          }
        }
      }
      
      estimates_vote_stat {
        data(year: est_in_year){
          year
          vs_type
          amount
          vote_num
          doc
          name
        }
        info {
          yearly_totals{
            year
            amount
          }
          
        }
      }
      
    }
  }
}
`;

const { execQuery } = global;

describe("vote-stat", function () {
  it("vote-stat org test (public accounts + estimates)", async () => {
    const variables = { dept_code: "AGR" };
    const data = await execQuery(org_query, variables);
    return expect(data).toMatchSnapshot();
  });
});

const program_query = `
  query {
    root(lang:"en"){
      program(id: "AGR-AAA00"){
        name
        vote_stat_data(year: pa_last_year){
          year
          exp
          vs_type
        }
      }
    }
  }
`;

describe("program vote-stat", function () {
  it("program vote-stat", async () => {
    const vars = { program_id: "AGR-AAA00" };
    const result = await execQuery(program_query, vars);
    expect(result).toMatchSnapshot();
  });
});
