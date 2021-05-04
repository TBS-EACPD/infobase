import { lang } from "src/core/injected_build_constants.ts";

export const app_reducer = (
  state = { lang: lang, is_showing_graph_overlay: true },
  { type, payload }
) => {
  switch (type) {
    case "graph_overlay":
      return { ...state, is_showing_graph_overlay: false };
  }
  return state;
};

export const hide_graph_overlay = () => {
  return {
    type: "graph_overlay",
  };
};
