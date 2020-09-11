export const app_reducer = (
  //export not needed but dev tools will throw error about no key
  state = { lang: window.lang, show_rotate_landscape: true },
  { type, payload }
) => {
  switch (type) {
    case "rotate_landscape":
      return { ...state, show_rotate_landscape: false };
  }
  return state;
};

export const rotate_landscape_off = () => {
  return {
    type: "rotate_landscape",
  };
};
