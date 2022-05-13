export default {
  schema: `

    enum PublicAccountsYear {
      pa_last_year
      pa_last_year_2
      pa_last_year_3
      pa_last_year_4
      pa_last_year_5
    }

    type Query {
      root(lang:String!): Root!
    }

    type Root {
      # graphQL cant have empty blocks of fields
      non_field: String,
    }
  `,
  resolvers: {
    Query: {
      root: (_x, { lang }, context) => {
        context.lang = lang;
        return {};
      },
    },
  },
};
