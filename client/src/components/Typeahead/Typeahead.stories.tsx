import { Story, Meta } from "@storybook/react";
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

const filter = (
  query: string,
  datum: Record<string, string | JSX.Element | ((...args: any[]) => void)>
) => _.includes(_.lowerCase(datum.title as string), _.lowerCase(query));

interface TypeaheadWrapperProps {
  data: Record<string, string>[];
  min_length: number;
}

interface TypeaheadWrapperState {
  query: string;
}

class TypeaheadWrapper extends React.Component<
  TypeaheadWrapperProps,
  TypeaheadWrapperState
> {
  constructor(props: TypeaheadWrapperProps) {
    super(props);

    this.state = {
      query: "",
    };
  }

  on_query = (query_value: string) => this.setState({ query: query_value });

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

const TypeaheadTemplate: Story<TypeaheadWrapperProps> = (
  props: TypeaheadWrapperProps
) => <TypeaheadWrapper {...props} />;

export default {
  title: "Input/Typeahead",
  component: TypeaheadTemplate,
} as Meta;

export const BasicTypeahead = TypeaheadTemplate.bind({});
BasicTypeahead.args = {
  min_length: 2,
  data,
};
