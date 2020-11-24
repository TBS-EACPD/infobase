export const app_reducer = (
  state = {
    lang: window.lang,
    redirect_target: null,
    redirect_msg: null,
    is_showing_graph_overlay: true,
  },
  { type, payload }
) => {
  switch (type) {
    case "set_redirect":
      return {
        ...state,
        redirect_target: payload.redirect_target,
        redirect_msg: payload.redirect_msg,
      };
    case "graph_overlay":
      return { ...state, is_showing_graph_overlay: false };
    default:
      return state;
  }
};

export const hide_graph_overlay = () => {
  return {
    type: "graph_overlay",
  };
};
