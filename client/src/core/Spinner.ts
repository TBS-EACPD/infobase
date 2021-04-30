import { Spinner } from "spin.js";
import "spin.js/spin.css";

const spinner_configs = {
  initial: { scale: 4 },
  route: { scale: 4 },
  sub_route: { scale: 2 },
  small_inline: {
    scale: 0.5,
    color: "#fff",
    position: "relative",
    top: "9px",
    left: "-50%",
  },
};

export { Spinner, spinner_configs };
