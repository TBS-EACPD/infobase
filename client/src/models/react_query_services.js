import { GraphQLClient } from "graphql-request";
import _ from "lodash";
import { useQuery } from "react-query";

import { Subject } from "src/models/subject.js";

import { lang } from "src/core/injected_build_constants.js";

import { get_api_url } from "src/graphql_utils/graphql_utils.js";

import { services_query } from "./populate_services.js";

const { Gov } = Subject;
//eslint-disable no-console

const fetchServices = async (query_options) => {
  const t0 = performance.now();

  const { subject } = query_options;
  const is_gov = subject.level === "gov";
  const fetch_query = services_query(query_options);

  const url = await get_api_url();
  // const url =
  //   "https://us-central1-ib-serverless-api-dev.cloudfunctions.net/service_inventory_w_react_query/graphql";
  const client = new GraphQLClient(url, {
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const res = await client.request(fetch_query, {
    lang,
    id: is_gov ? "gov" : subject.id,
  });
  console.log(res);

  if (res.isError) {
    throw new Error(res.error);
  }
  const data = is_gov ? res.root.orgs : res.root.org.services;

  const services = is_gov
    ? _.chain(data)
        .flatMap("services")
        .compact()
        .uniqBy("service_id")
        .flatMap((service) => ({ ...service, id: service.service_id })) //TODO I don't like this duplication. Should try to throw this into pipeline
        .value()
    : _.flatMap(data, (service) => ({ ...service, id: service.service_id }));

  const t1 = performance.now();
  console.log(t1 - t0);

  return services;
};

export const prefetchServices = async (queryClient, subject = Gov) => {
  await queryClient.prefetchQuery(
    `services_${subject.level}_${subject.id}`,
    async () => fetchServices(subject),
    {
      cacheTime: 1000 * 60 * 15,
    }
  );
};

export const useGQLReactQuery = (query_options) => {
  const { key } = query_options;
  return useQuery(key, async () => fetchServices(query_options), {
    cacheTime: 1000 * 60 * 15,
  });
};
