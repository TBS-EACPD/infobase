import {
  query_org_has_services,
  query_program_has_services,
} from "./queries.js";

export const api_load_has_services = (subject) => {
  const level = subject && subject.level;

  const { is_loaded, query } = (() => {
    const has_services_is_loaded = (() => {
      try {
        subject.has_data("services");
      } catch (error) {
        return false;
      }
      return true;
    })();

    switch (level) {
      case "dept":
        return {
          is_loaded: has_services_is_loaded,
          query: query_org_has_services,
        };
      case "program":
        return {
          is_loaded: has_services_is_loaded,
          query: query_program_has_services,
        };
      default:
        return {
          is_loaded: true, // no default case, this is to resolve the promise early
        };
    }
  })();

  if (is_loaded) {
    return Promise.resolve();
  }

  return query({ id: String(subject.id) }).then((has_services) => {
    subject.set_has_data("services", has_services);
    return Promise.resolve();
  });
};
