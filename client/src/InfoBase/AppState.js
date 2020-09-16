export default function app_reducer(
  //export not needed but dev tools will throw error about no key
  state = { lang: window.lang, show_graph_overlay: true },
  { type, payload }
) {
  switch (type) {
    case "graph_overlay":
      return { ...state, show_graph_overlay: false };
  }
  return state;
}

export const hide_graph_overlay = () => {
  return {
    type: "graph_overlay",
  };
};
