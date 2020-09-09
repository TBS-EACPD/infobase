import leaf_loading_spinner from "../svg/leaf-loading-spinner.svg";
import "../components/LeafSpinner.scss";

export default function () {
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

  return function stop() {
    app_el.removeChild(containerDiv);
    app_el.removeAttribute("aria-busy");
  };
}
