import { request } from "graphql-request";
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

  const endpoint = await get_api_url();
  console.log(subject);
  console.log(endpoint);
  const res = await request(endpoint, query, {
    lang: lang,
    id: is_gov ? "gov" : subject.id,
  });
  if (res.isError) {
    throw new Error(res.error);
  }
  console.log(res);
  const data = is_gov ? res.root.orgs : res.root.org.services;
  const services = is_gov
    ? _.chain(data).flatMap("services").compact().uniqBy("service_id").value()
    : data;

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
