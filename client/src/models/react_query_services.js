import { request } from "graphql-request";
import _ from "lodash";
import { useQuery } from "react-query";

import { lang } from "src/core/injected_build_constants.js";

import { get_api_url } from "src/graphql_utils/graphql_utils.js";

import {
  all_services_query,
  dept_services_query,
} from "./populate_services.js";

export const useGQLReactQuery = (key, subject) => {
  const is_gov = subject ? false : true;
  const query = is_gov ? all_services_query : dept_services_query;

  return useQuery(key, async () => {
    const endpoint = await get_api_url();
    const res = await request(endpoint, query, {
      lang: lang,
      id: is_gov ? "gov" : subject.id,
    });
    if (res.isError) {
      throw new Error(res.error);
    }
    const data = is_gov ? res.root.orgs : res.root.org.services;
    const services = is_gov
      ? _.chain(data).flatMap("services").compact().uniqBy("service_id").value()
      : data;

    return services;
  });
};
