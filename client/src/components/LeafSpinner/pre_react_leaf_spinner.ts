import leaf_loading_spinner from "./LeafSpinner.svg";
import "./LeafSpinner.scss";

export const start_spinner = () => {
  const app_el = document.querySelector("#app");

  if (app_el === null) {
    throw new Error(
      "start_spinner interacts with the DOM imperatively and requires a #app node to exist. No #app found!"
    );
  }

  const spinner_container = document.createElement("div");
  spinner_container.className = "leaf-spinner-container";
  spinner_container.setAttribute(
    "style",
    "transform: scale(2); position: fixed"
  );
  spinner_container.innerHTML = leaf_loading_spinner;

  app_el.appendChild(spinner_container);
  app_el.setAttribute("aria-busy", "true");

  const stop_spinner = () => {
    app_el.removeChild(spinner_container);
    app_el.removeAttribute("aria-busy");
  };

  return stop_spinner;
};
