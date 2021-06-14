// List.stories.js

import _ from "lodash";
import React from "react";

import { Typeahead } from "./Typeahead";

const NA = "North America";
const SA = "South America";
const EU = "Europe";
const AS = "Asia";

const data = [
  {
    country: "Canada",
    continent: NA,
  },
  {
    country: "United States of America",
    continent: NA,
  },
  {
    country: "Brazil",
    continent: SA,
  },
  {
    country: "Chile",
    continent: SA,
  },
  {
    country: "France",
    continent: EU,
  },
  {
    country: "Germany",
    continent: EU,
  },
  {
    country: "Japan",
    continent: AS,
  },
  {
    country: "South Korea",
    continent: AS,
  },
];

const filter = (query, datum) =>
  _.includes(_.lowerCase(datum.title), _.lowerCase(query));

class TypeaheadWrapper extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      query: "",
    };
  }

  on_query = (query_value) => this.setState({ query: query_value });

  render() {
    const { query } = this.state;

    return (
      <Typeahead
        {...{
          ...this.props,
          on_query: this.on_query,
          query_value: query,
          results: this.results,
        }}
      />
    );
  }

  get results() {
    const { query } = this.state;
    const { data } = this.props;

    return _.chain(data)
      .map((datum) => ({
        title: datum.country,
        content: (
          <div>
            {datum.country} <br />
            <small
              style={{ marginLeft: "20px" }}
            >{`This country is in ${datum.continent}`}</small>
          </div>
        ),
        plain_text: datum.country,
        on_select: _.noop,
      }))
      .filter((datum) => filter(query, datum))
      .value();
  }
}

const TypeaheadTemplate = (props) => <TypeaheadWrapper {...props} />;

export default {
  title: "Input/Typeahead",
  component: TypeaheadTemplate,
};

export const BasicTypeahead = TypeaheadTemplate.bind({});
BasicTypeahead.args = {
  min_length: 2,
  data,
};
