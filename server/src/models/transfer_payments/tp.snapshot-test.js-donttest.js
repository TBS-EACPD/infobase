const org_query = `
query ($lang: String!, $dept_code: String!){
  root(lang: $lang){
    org(dept_code:$dept_code){
      transfer_payments_data {
        data {
          type
          name
          auth
          exp
          year
        }
        top_n_with_other(year: pa_last_year, n: 3) {
          type
          name
          auth
          exp
          year
        }
        collapsed{
          type
          auth
          exp
          year
        }
      }
    }
  }
}
`;

const { execQuery } = global;

describe("transfer payments", function () {
  it("org-level transfer payments", async () => {
    const variables = { dept_code: "AGR" };
    const data = await execQuery(org_query, variables);
    return expect(data).toMatchSnapshot();
  });
});
