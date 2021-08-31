const { execQuery } = global;

describe("People data", () => {
  it("Org headcount and average age data", async () => {
    const data = await execQuery(
      `
    query ($lang: String = "en") {
      root(lang: $lang) {
        org(org_id: "1") {
          people_data {
            average_age {
              year,
              value,
            }

            type {
              dimension
              yearly_data {
                year,
                value,
              }
              avg_share
            }
          }
        }
      }
    }`,
      {}
    );
    return expect(data).toMatchSnapshot();
  });
  it("Gov headcount and average age data", async () => {
    const data = await execQuery(
      `
    query ($lang: String = "en") {
      root(lang: $lang) {
        gov {
          people_data {
            average_age {
              year,
              value,
            }

            type {
              dimension
              yearly_data {
                year,
                value,
              }
            }
          }
        }
      }
    }`,
      {}
    );
    return expect(data).toMatchSnapshot();
  });
});
