import leaf_loading_spinner from "./leaf-spinner.svg";
import "./LeafSpinner.scss";

export const start_spinner = () => {
  const app_el = document.querySelector("#app");

  const containerDiv = document.createElement("div");
  containerDiv.className = "faded-loading-container--true";
  containerDiv.style.position = "fixed";

  const spinnerDiv = document.createElement("div");
  spinnerDiv.className = "leaf-spinner-container";
  spinnerDiv.setAttribute("style", "transform: scale(2); position: fixed");
  spinnerDiv.innerHTML = leaf_loading_spinner;

  containerDiv.appendChild(spinnerDiv);
  app_el.appendChild(containerDiv);
  app_el.setAttribute("aria-busy", "true");

  const stop_spinner = () => {
    app_el.removeChild(containerDiv);
    app_el.removeAttribute("aria-busy");
  };

  return stop_spinner;
};
