import { QueryClient as ReactQueryClient } from "react-query";

export const reactQueryClient = new ReactQueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
    },
  },
});
