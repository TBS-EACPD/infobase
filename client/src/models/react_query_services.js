import axios from "axios";
// import { GraphQLClient } from "graphql-request";
import _ from "lodash";
import { useQuery } from "react-query";

import { Subject } from "src/models/subject.js";

import { lang } from "src/core/injected_build_constants.js";

import { get_api_url } from "src/graphql_utils/graphql_utils.js";

import {
  all_services_query,
  dept_services_query,
} from "./populate_services.js";

const { Gov } = Subject;
//eslint-disable no-console

const get_query_id = (subject) => `services_${subject.level}_${subject.id}`;

const fetchServices = async (subject) => {
  const is_gov = subject.level === "gov";
  const query = is_gov ? all_services_query : dept_services_query;

  const url = await get_api_url();
  // const client = new GraphQLClient(url, {
  //   mode: "cors",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  // });
  // const res = await client.request(query, {
  //   lang,
  //   id: is_gov ? "gov" : subject.id,
  // });
  const res = await axios.post(
    url,
    {
      query: query.loc.source.body,
      variables: { lang, id: is_gov ? "gov" : subject.id },
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  console.log(res);

  if (res.status !== 200) {
    throw new Error("fetchServices failed");
  }
  const res_data = res.data.data.root;
  const data = is_gov ? res_data.orgs : res_data.org.services;

  const services = is_gov
    ? _.chain(data)
        .flatMap("services")
        .compact()
        .uniqBy("service_id")
        .flatMap((service) => ({ ...service, id: service.service_id })) //TODO I don't like this duplication. Should try to throw this into pipeline
        .value()
    : _.flatMap(data, (service) => ({ ...service, id: service.service_id }));

  return services;
};

export const prefetchServices = async (queryClient, subject = Gov) => {
  await queryClient.prefetchQuery(
    get_query_id(subject),
    async () => fetchServices(subject),
    {
      cacheTime: 1000 * 60 * 15,
    }
  );
};

export const useGQLReactQuery = (subject) => {
  return useQuery(get_query_id(subject), async () => fetchServices(subject), {
    cacheTime: 1000 * 60 * 15,
  });
};
